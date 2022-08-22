import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load: LayoutLoad = async ({ parent }) => {
  const { session } = await parent();
  if (session?.authenticated) {
    throw redirect(302, '/auth/signIn');
  }
  return {};
};
