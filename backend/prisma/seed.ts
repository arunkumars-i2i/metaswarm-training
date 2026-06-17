/**
 * Seed a known test user (T016). Account creation is out of scope for the feature
 * (spec Assumptions); this provides a credential to log in with for dev/manual testing.
 *
 * Default: rep@example.com / Password123!  (override via SEED_EMAIL / SEED_PASSWORD)
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';
import { normalizeEmail } from '../src/repositories/user.repository.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = normalizeEmail(process.env.SEED_EMAIL ?? 'rep@example.com');
  const password = process.env.SEED_PASSWORD ?? 'Password123!';
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isActive: true },
    create: { email, passwordHash, isActive: true },
  });

  console.log(`Seeded user ${user.email} (id=${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
