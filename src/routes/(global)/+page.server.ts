import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const { session, user } = await locals.auth.validateUser()

	if (!session) {
		throw redirect(303, `/auth/login`)
	}
	
	return { user }

}) satisfies PageServerLoad; 