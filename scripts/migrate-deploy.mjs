import { execSync } from "child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not set — skipping prisma migrate deploy");
  process.exit(0);
}

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} catch (e) {
  console.error("prisma migrate deploy failed:", e.message);
  process.exit(1);
}
