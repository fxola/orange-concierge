import type { ActorRole } from '@orange-concierge/core';
import { eq } from 'drizzle-orm';

import { createBackendConfigFromEnvironment, type BackendConfig } from '../../application/config';
import { createAuth } from '../../auth';
import { clients, user, type OrangeConciergeDB } from '..';
import { createDatabaseFromUrl } from '../connection';

function assertDemoSeedAllowed(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seed data cannot be applied when NODE_ENV=production.');
  }

  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Demo seeding is disabled. Set ALLOW_DEMO_SEED=true to enable it.');
  }
}

export type SeedUserConfig = Readonly<{
  email: string;
  name: string;
  password: string;
}>;

export type SeedConfig = BackendConfig &
  Readonly<{
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

type Database = OrangeConciergeDB;

export const createSeedUsersFromEnvironment = (
  env: NodeJS.ProcessEnv = process.env
): SeedConfig['users'] => ({
  admin: {
    email: readSeedText(env, 'SEED_ADMIN_EMAIL'),
    name: readSeedText(env, 'SEED_ADMIN_NAME'),
    password: readSeedSecret(env, 'SEED_ADMIN_PASSWORD'),
  },

  consultant: {
    email: readSeedText(env, 'SEED_CONSULTANT_EMAIL'),
    name: readSeedText(env, 'SEED_CONSULTANT_NAME'),
    password: readSeedSecret(env, 'SEED_CONSULTANT_PASSWORD'),
  },

  reviewer: {
    email: readSeedText(env, 'SEED_REVIEWER_EMAIL'),
    name: readSeedText(env, 'SEED_REVIEWER_NAME'),
    password: readSeedSecret(env, 'SEED_REVIEWER_PASSWORD'),
  },
});

const buildSeedUsers = (users: SeedConfig['users']): readonly SeedUser[] => [
  {
    ...users.admin,
    role: 'admin',
  },
  {
    ...users.consultant,
    role: 'consultant',
  },
  {
    ...users.reviewer,
    role: 'reviewer',
  },
];

const SEED_CLIENTS = [
  {
    id: '98d4ea70-45e2-4c21-8767-3bbe0ae070a7',
    displayName: 'Acme Fund',
  },
  {
    id: '3e2359ca-0b89-48b5-a1d2-d57bd3d0b4ef',
    displayName: 'TBW',
  },
  {
    id: 'eca0e9f5-94f0-471d-b29a-f95919cdfc74',
    displayName: 'Origami',
  },
] as const satisfies readonly SeedClient[];

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
      console.log('    → name and role already correct');

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

/**
 * Seed demo data.
 *
 * Safety checks and required-user validation happen before a database client
 * is created so invalid seed invocations fail without touching Postgres.
 */
export async function seed(config: SeedConfig): Promise<void> {
  assertDemoSeedAllowed();
  assertSeedUsersConfigured(config.users);

  const { db, client } = createDatabaseFromUrl(config.databaseUrl);

  try {
    const seedAuth = createAuth({
      db,
      baseURL: config.baseUrl,
      secret: config.authSecret,
      trustedOrigins: config.trustedOrigins,

      // Runtime signup remains disabled. Demo seed explicitly enables it only
      // for this temporary auth instance.
      disableSignUp: false,
    });

    await seedClients(db);

    await seedUsers(db, seedAuth, buildSeedUsers(config.users));

    console.log('Seed complete.');
  } finally {
    await client.end();
  }
}

export const createSeedConfigFromEnvironment = (
  env: NodeJS.ProcessEnv = process.env
): SeedConfig => ({
  ...createBackendConfigFromEnvironment(env),
  users: createSeedUsersFromEnvironment(env),
});

function assertSeedUsersConfigured(users: SeedConfig['users']): void {
  const missing: string[] = [];

  assertSeedUserConfigured('SEED_ADMIN', users.admin, missing);

  assertSeedUserConfigured('SEED_CONSULTANT', users.consultant, missing);

  assertSeedUserConfigured('SEED_REVIEWER', users.reviewer, missing);

  if (missing.length === 0) {
    return;
  }

  throw new Error(`Missing required demo seed environment variables: ${missing.join(', ')}.`);
}

function assertSeedUserConfigured(
  prefix: string,
  seedUser: SeedUserConfig,
  missing: string[]
): void {
  if (seedUser.email.trim().length === 0) {
    missing.push(`${prefix}_EMAIL`);
  }

  if (seedUser.name.trim().length === 0) {
    missing.push(`${prefix}_NAME`);
  }

  if (seedUser.password.trim().length === 0) {
    missing.push(`${prefix}_PASSWORD`);
  }
}

function readSeedText(env: NodeJS.ProcessEnv, name: string): string {
  return env[name]?.trim() ?? '';
}

/**
 * Determine whether a password exists without modifying it.
 *
 * Password whitespace is meaningful, unlike names/emails, so we should not
 * silently trim a configured password.
 */
function readSeedSecret(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];

  if (!value || value.trim().length === 0) {
    return '';
  }

  return value;
}
