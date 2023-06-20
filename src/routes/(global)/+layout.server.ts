import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const { user } = await locals.auth.validateUser()

	if (!user) throw redirect(303, '/auth/login')
	return { user }

}) satisfies LayoutServerLoad;
