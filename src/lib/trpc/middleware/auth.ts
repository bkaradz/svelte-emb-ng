import { t } from '$lib/trpc/t';
import { TRPCError } from '@trpc/server';

export const isAuthenticated = t.middleware(async ({ next, ctx }) => {
	if (!ctx?.sessionId)
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to use is resource'
		});
	return next();
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
