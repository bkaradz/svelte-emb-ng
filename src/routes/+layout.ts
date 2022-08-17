import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ session }) => {
	if (!session?.user?.authenticated) {
		throw redirect(302, '/auth/signIn');
	}
	return {};
};
