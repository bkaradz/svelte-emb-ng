import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async({ locals }) => {
	const session = await locals.auth.validate()
	const validateUser = await locals.auth.validateUser()

	if (!session) {
			throw redirect(303, '/auth/login')
	}

	return { user: validateUser.user}
	
}) satisfies LayoutServerLoad;
