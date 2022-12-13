import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
// import { isAuthenticated } from './middleware/auth';
// import { isAuthenticated } from './middleware/auth';

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

// export const middleware = t.middleware;



