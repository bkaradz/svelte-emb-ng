import { router } from '$lib/trpc/t';
import { protectedProcedure } from '../middleware/auth';
import { z } from 'zod';
import { savePricelistSchema } from '$lib/validation/savePricelists.validate';
import {
	deleteByIdPrisma,
	getByIdPrisma,
	getDefaultPricelistPrisma,
	getPricelistsPrisma,
	saveOrUpdatePricelistPrisma
} from './pricelists.prisma';

export const pricelists = router({
	getPricelists: protectedProcedure
		.input(
			z.object({
				group: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			return await getPricelistsPrisma(input);
		}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await getByIdPrisma(input);
	}),
	getDefaultPricelist: protectedProcedure.query(async () => {
		return await getDefaultPricelistPrisma();
	}),
	saveOrUpdatePricelist: protectedProcedure
		.input(savePricelistSchema)
		.mutation(async ({ input, ctx }) => {
			return await saveOrUpdatePricelistPrisma(input, ctx);
		}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		return await deleteByIdPrisma(input);
	})
});
