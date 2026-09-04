import type { ActorRole } from '@orange-concierge/core';
import { createAuth } from './auth';
import { clients, user, type OrangeConciergeDB } from './database';

import { eq } from 'drizzle-orm';
import { createDatabaseFromUrl } from './database/connection';
import { loadPackageEnv, packageRootFrom } from './env';

loadPackageEnv(packageRootFrom(import.meta.url, 1));

export type SeedUserConfig = Readonly<{
  email: string;
  name: string;
  password: string;
}>;

export type SeedConfig = Readonly<{
  databaseUrl: string;
  baseUrl: string;
  authSecret?: string;
  trustedOrigins?: string[];

  users: Readonly<{
    admin: SeedUserConfig;
    consultant: SeedUserConfig;
    reviewer: SeedUserConfig;
  }>;
}>;
type SeedUser = Readonly<{
  name: string;
  email: string;
  password: string;
  role: ActorRole;
}>;

type SeedClient = Readonly<{
  id: string;
  displayName: string;
}>;

export const createSeedUsersFromEnvironment = (
  env: NodeJS.ProcessEnv = process.env
): SeedConfig['users'] => ({
  admin: {
    email: env.SEED_ADMIN_EMAIL?.trim() || '',
    name: env.SEED_ADMIN_NAME?.trim() || '',
    password: env.SEED_ADMIN_PASSWORD?.trim() || '',
  },
  consultant: {
    email: env.SEED_CONSULTANT_EMAIL?.trim() || '',
    name: env.SEED_CONSULTANT_NAME?.trim() || '',
    password: env.SEED_CONSULTANT_PASSWORD?.trim() || '',
  },
  reviewer: {
    email: env.SEED_REVIEWER_EMAIL?.trim() || '',
    name: env.SEED_REVIEWER_NAME?.trim() || '',
    password: env.SEED_REVIEWER_PASSWORD?.trim() || '',
  },
});

const buildSeedUsers = (users: SeedConfig['users']): readonly SeedUser[] => [
  { ...users.admin, role: 'admin' },
  { ...users.consultant, role: 'consultant' },
  { ...users.reviewer, role: 'reviewer' },
];

const SEED_CLIENTS = [
  {
    id: 'client-acme',
    displayName: 'Acme Fund',
  },
  {
    id: 'client-tbw',
    displayName: 'TBW',
  },
  {
    id: 'client-og',
    displayName: 'Origami',
  },
] as const satisfies readonly SeedClient[];

type Database = OrangeConciergeDB;

async function seedClients(db: Database): Promise<void> {
  console.log('Seeding clients…');

  for (const seedClient of SEED_CLIENTS) {
    const inserted = await db
      .insert(clients)
      .values({
        id: seedClient.id,
        displayName: seedClient.displayName,
        createdAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({
        id: clients.id,
      });

    if (inserted.length > 0) {
      console.log(`  + ${seedClient.displayName} (${seedClient.id})`);

      continue;
    }

    await db
      .update(clients)
      .set({
        displayName: seedClient.displayName,
      })
      .where(eq(clients.id, seedClient.id));

    console.log(`  - ${seedClient.displayName} (${seedClient.id}) already exists`);
  }
}

async function seedUsers(
  db: Database,
  auth: ReturnType<typeof createAuth>,
  seedUsers: readonly SeedUser[]
): Promise<void> {
  console.log('Seeding users…');

  for (const seedUser of seedUsers) {
    const existing = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.email, seedUser.email))
      .limit(1);

    if (existing.length === 0) {
      console.log(`  + ${seedUser.email} (${seedUser.role}) — creating via Better Auth`);

      await auth.api.signUpEmail({
        body: {
          name: seedUser.name,
          email: seedUser.email,
          password: seedUser.password,
        },
      });
    } else {
      console.log(`  - ${seedUser.email} already exists`);
    }

    const [current] = await db
      .select({
        id: user.id,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .where(eq(user.email, seedUser.email))
      .limit(1);

    if (!current) {
      throw new Error(`Expected seeded user "${seedUser.email}" to exist.`);
    }

    const requiresUpdate = current.name !== seedUser.name || current.role !== seedUser.role;

    if (!requiresUpdate) {
      console.log(`    → name and role already correct`);

      continue;
    }

    await db
      .update(user)
      .set({
        name: seedUser.name,
        role: seedUser.role,
      })
      .where(eq(user.id, current.id));

    console.log(`    → ensured name "${seedUser.name}" and role "${seedUser.role}"`);
  }
}

export async function seed(config: SeedConfig): Promise<void> {
  const { db, client } = createDatabaseFromUrl(config.databaseUrl);

  try {
    const seedAuth = createAuth({
      db,
      baseURL: config.baseUrl,
      secret: config.authSecret,
      trustedOrigins: config.trustedOrigins,
      disableSignUp: false,
    });

    await seedClients(db);
    await seedUsers(db, seedAuth, buildSeedUsers(config.users));

    console.log('Seed complete.');
  } finally {
    await client.end();
  }
}

const DEFAULT_DATABASE_URL = 'postgresql://concierge:concierge@localhost:5433/concierge';
const DEFAULT_BASE_URL = 'http://localhost:3000';

export const createSeedConfigFromEnvironment = (
  env: NodeJS.ProcessEnv = process.env
): SeedConfig => ({
  databaseUrl: env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL,
  baseUrl: env.BETTER_AUTH_URL?.trim() || env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_BASE_URL,
  authSecret: env.BETTER_AUTH_SECRET?.trim() || env.AUTH_SECRET?.trim() || undefined,
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS?.trim()
    ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : env.TRUSTED_ORIGINS?.trim()
      ? env.TRUSTED_ORIGINS.split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
  users: createSeedUsersFromEnvironment(env),
});

const isSeedMain =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('/infrastructure/src/seed.ts') ||
    process.argv[1].endsWith('\\infrastructure\\src\\seed.ts') ||
    process.argv[1].endsWith('seed.ts'));

if (isSeedMain) {
  seed(createSeedConfigFromEnvironment()).catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  });
}
