import { router } from '$lib/trpc/t';
import { savePaymentTypesOptionsSchema } from '$lib/validation/savePaymentTypeOptions.validate';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';
import {
	deleteByIdPrisma,
	getByIdPrisma,
	getPaymentsPrisma,
	saveOrUpdatePaymentsPrisma
} from './paymentTypeOptions.prisma';

export const paymentTypeOptions = router({
	getPayments: protectedProcedure
		.input(
			z.object({
				group: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			return await getPaymentsPrisma(input);
		}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await getByIdPrisma(input);
	}),
	saveOrUpdatePayments: protectedProcedure
		.input(savePaymentTypesOptionsSchema)
		.mutation(async ({ input, ctx }) => {
			return await saveOrUpdatePaymentsPrisma(input, ctx);
		}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		return await deleteByIdPrisma(input);
	})
});
