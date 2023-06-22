import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const { session, user } = await locals.auth.validateUser()

	if (!session) {
		throw redirect(303, `/auth/login`)
	}
	
	return { user }

}) satisfies LayoutServerLoad;
