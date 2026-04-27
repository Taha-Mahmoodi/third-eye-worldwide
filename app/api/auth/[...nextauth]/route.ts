// Auth.js v5 hands us pre-built route handlers — re-export them.
// See lib/auth.ts for the actual config.
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
