import prisma from "$lib/prisma/client";
import prismaAdapter from "@lucia-auth/adapter-prisma";
import { sveltekit } from 'lucia-auth/middleware'
import lucia from 'lucia-auth';
import { dev } from '$app/environment'


export const auth = lucia({
	adapter: prismaAdapter(prisma as any),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	transformDatabaseUser: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			name: userData.name
		}
	}
});

// export { auth }

export type Auth = typeof auth