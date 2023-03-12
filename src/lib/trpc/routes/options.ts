import { router } from '$lib/trpc/t';
import { saveOptionsSchema } from '$lib/validation/saveOption.validate';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';
import {
	deleteByIdPrisma,
	getByIdPrisma,
	getOptionsPrisma,
	saveOrUpdateOptionPrisma
} from './options.prisma';

export const options = router({
	getOptions: protectedProcedure
		.input(
			z.object({
				group: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			return await getOptionsPrisma(input);
		}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await getByIdPrisma(input);
	}),
	saveOrUpdateOption: protectedProcedure
		.input(saveOptionsSchema)
		.mutation(async ({ input, ctx }) => {
			return await saveOrUpdateOptionPrisma(input, ctx);
		}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		return await deleteByIdPrisma(input);
	})
});
