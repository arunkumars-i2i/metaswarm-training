/**
 * Prisma client singleton. Imported ONLY by repositories (Repository Pattern,
 * constitution Principle III) — services and routes never import this directly.
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
