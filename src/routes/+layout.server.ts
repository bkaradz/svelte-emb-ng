import type { LayoutServerLoad } from '../../.svelte-kit/types/src/routes/$types';
// import type { SessionsModel } from '$lib/models/sessions.model';

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		session: locals?.user,
	};
};