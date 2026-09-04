import { toNextJsHandler } from 'better-auth/next-js';
import { getApplication } from '@orange-concierge/infrastructure';

export const { GET, POST } = toNextJsHandler(getApplication().auth);
