import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/lucia/client';

export const POST: RequestHandler = async ({locals}) => {
    const session = await locals.auth.validate()

    if (!session) {
        throw redirect(302, `/`)
    }

    await auth.invalidateSession(session.sessionId)
    locals.auth.setSession(null)

    throw redirect(303, `/`)
};