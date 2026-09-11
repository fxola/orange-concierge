import { createSeedConfig, seed } from './index';

seed(createSeedConfig()).catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
