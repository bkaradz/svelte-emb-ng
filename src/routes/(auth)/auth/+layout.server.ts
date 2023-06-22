import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
    const { user, session } = await locals.auth.validateUser()

    if (session) {
        throw redirect(302, "/")
    }
    return { user }
    
}) satisfies LayoutServerLoad;
