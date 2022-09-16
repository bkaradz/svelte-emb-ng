import type { LayoutServerLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const user = locals?.user
	return { user };
};