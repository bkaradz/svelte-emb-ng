import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
	const user = locals?.user
	console.log("🚀 ~ file: +layout.server.ts:5 ~ load ~ user", user)
	return { user };
}) satisfies LayoutServerLoad;