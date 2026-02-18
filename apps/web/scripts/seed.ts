import { db } from "@stock-tracker/database";
import { users } from "@stock-tracker/database/schema";
import { hashPassword } from "../src/lib/password";

async function seed() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log("Users already exist, skipping seed.");
    process.exit(0);
  }

  const passwordHash = await hashPassword("password123");

  await db.insert(users).values({
    name: "Admin",
    email: "admin@stock-tracker.com",
    passwordHash,
    role: "admin",
  });

  console.log("Created admin user: admin@stock-tracker.com (password: password123)");
  console.log("⚠️  Please change this password after first login!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
