import { loadPackageEnv, packageRootFrom } from '../../env';
import { createSeedConfigFromEnvironment, seed } from './index';

loadPackageEnv(packageRootFrom(import.meta.url, 3));

seed(createSeedConfigFromEnvironment()).catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
