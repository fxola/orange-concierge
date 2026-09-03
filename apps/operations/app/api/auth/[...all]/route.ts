import { toNextJsHandler } from 'better-auth/next-js';
import { getAuth } from '../../../../src/server/composition';

export const { GET, POST } = toNextJsHandler(getAuth());
