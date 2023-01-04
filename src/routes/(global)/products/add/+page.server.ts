import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    const productCategories = await router.createCaller(await createContext(event)).options.getOptions({ group: 'productCategories' })

    return { productCategories };
}) satisfies PageServerLoad;