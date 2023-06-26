import { sequence } from '@sveltejs/kit/hooks';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';
import { verifyJwt } from '$lib/utility/jwt.utils';
import { findSessions } from '$lib/services/session.services';
import type { userSessionInterface } from '$lib/types';
import { auth } from '$lib/lucia/client';
import { handleHooks } from '@lucia-auth/sveltekit';

const flipBit = false

export const first = createTRPCHandle({ router, createContext });

export const second: Handle = async ({ event, resolve }) => {
	console.log('object :', event.url.pathname);
	// if (event.url.pathname === "/auth/login") {
	// 	throw redirect(302, "/auth/login")
	// }
	event.locals.auth = auth.handleRequest(event);
	return await resolve(event);
};

export const handle: Handle = sequence(first, second);
