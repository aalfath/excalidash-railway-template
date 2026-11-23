// Wait (up to 120 s) until the database in DATABASE_URL accepts TCP connections,
// so a backend that starts before Postgres doesn't fail its migrations.
const net = require("net");
const url = process.env.DATABASE_URL || "";
if (!/^postgres(ql)?:\/\//.test(url)) process.exit(0);
const u = new URL(url);
const host = u.hostname.replace(/^\[|\]$/g, "");
const port = Number(u.port || 5432);
const deadline = Date.now() + 120000;
const attempt = () => {
  const s = net.connect({ host, port });
  s.setTimeout(3000);
  const retry = (why) => {
    s.destroy();
    if (Date.now() > deadline) {
      console.error(`[railway] database ${host}:${port} not reachable after 120 s (${why})`);
      process.exit(1);
    }
    setTimeout(attempt, 2000);
  };
  s.on("connect", () => { s.end(); console.log(`[railway] database ${host}:${port} is reachable`); process.exit(0); });
  s.on("timeout", () => retry("timeout"));
  s.on("error", (e) => retry(e.code || e.message));
};
console.log(`[railway] waiting for database ${host}:${port}`);
attempt();
