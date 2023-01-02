import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
	const user = locals?.user
	return { user };
}) satisfies LayoutServerLoad;