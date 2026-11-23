// First-boot admin for the Railway template.
// Runs after `prisma migrate deploy` and before the backend starts. On an empty
// database it creates the administrator from ADMIN_EMAIL / ADMIN_PASSWORD and
// turns sign-in on, so no visitor can claim the instance or switch auth off.
// Once any active user exists it does nothing (changing the variables later
// doesn't change the password: use the app's Profile page for that).
const { PrismaClient } = require("/app/dist/generated/client");
const bcrypt = require("bcrypt");

const ADMIN_ID = "bootstrap-admin"; // the id upstream uses for its first admin

const main = async () => {
  const prisma = new PrismaClient();
  try {
    const active = await prisma.user.count({ where: { isActive: true } });
    if (active > 0) {
      console.log("[railway] users exist; first-admin setup skipped");
      return;
    }
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";
    if (!email.includes("@")) throw new Error("ADMIN_EMAIL must be an email address");
    if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = {
      email,
      username: null,
      passwordHash,
      name: "Admin",
      role: "ADMIN",
      mustResetPassword: false,
      isActive: true,
    };
    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({ where: { id: ADMIN_ID }, update: admin, create: { id: ADMIN_ID, ...admin } });
      await tx.collection.upsert({
        where: { id: `trash:${ADMIN_ID}` },
        update: {},
        create: { id: `trash:${ADMIN_ID}`, name: "Trash", userId: ADMIN_ID },
      });
      await tx.systemConfig.upsert({
        where: { id: "default" },
        update: { authEnabled: true, authOnboardingCompleted: true },
        create: { id: "default", authEnabled: true, authOnboardingCompleted: true, registrationEnabled: false },
      });
    });
    console.log(`[railway] created the administrator ${email} (password: the backend's ADMIN_PASSWORD variable)`);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};

main().catch((err) => {
  console.error("[railway] first-admin setup failed:", err && err.message ? err.message : err);
  process.exit(1);
});
