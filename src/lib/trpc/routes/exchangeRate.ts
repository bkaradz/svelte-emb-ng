import { router } from '$lib/trpc/t';
import { saveExchangeRateSchema } from '$lib/validation/saveExchangeRate.validate';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';
import {
	deleteByIdPrisma,
	getByIdPrisma,
	getDefaultExchangeRatePrisma,
	getExchangeRatesPrisma,
	saveOrUpdateExchangeRatePrisma
} from './exchangeRate.prisma';

export const exchangeRate = router({
	getExchangeRates: protectedProcedure
		.input(
			z.object({
				isDefault: z.boolean().optional(),
				isActive: z.boolean().optional()
			})
		)
		.query(async ({ input }) => {
			const { isActive, isDefault } = input;
			if (!isActive || !isDefault) {
				throw new Error('isActive and isDefault can not be undefined');
			}
			return await getExchangeRatesPrisma({ ...input, isActive, isDefault });
		}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await getByIdPrisma(input);
	}),
	getDefaultExchangeRate: protectedProcedure.query(async () => {
		return await getDefaultExchangeRatePrisma();
	}),
	saveOrUpdateExchangeRate: protectedProcedure
		.input(saveExchangeRateSchema)
		.mutation(async ({ input, ctx }) => {
			return await saveOrUpdateExchangeRatePrisma(input, ctx);
		}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		return await deleteByIdPrisma(input);
	})
});
