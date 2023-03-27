import { router } from '$lib/trpc/t';
import { saveOrdersSchema } from '$lib/validation/saveOrder.validate';
import { searchParamsSchema } from '$lib/validation/searchParams.validate';
import { z } from 'zod';
import { protectedProcedure } from '../middleware/auth';
import {
	deleteByIdPrisma,
	getByIdPrisma,
	getOrderLinePrisma,
	getOrdersPrisma,
	getQuotationOrderPrisma,
	saveOrderOrUpdatePrisma,
	updateStatusPrisma
} from './orders.prisma';

export const orders = router({
	getOrders: protectedProcedure.input(searchParamsSchema.passthrough()).query(async ({ input }) => {
		return await getOrdersPrisma(input);
	}),
	getOrderLine: protectedProcedure
		.input(searchParamsSchema.passthrough())
		.query(async ({ input }) => {
			return await getOrderLinePrisma(input);
		}),
	getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
		return await getByIdPrisma(input);
	}),
	deleteById: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		return await deleteByIdPrisma(input);
	}),
	updateStatus: protectedProcedure
		.input(
			z.object({ id: z.number(), accountsStatus: z.string(), isInvoiced: z.boolean().optional() })
		)
		.mutation(async ({ input, ctx }) => {
			return await updateStatusPrisma(input, ctx);
		}),
	saveOrderOrUpdate: protectedProcedure.input(saveOrdersSchema).mutation(async ({ input, ctx }) => {
		return await saveOrderOrUpdatePrisma(input, ctx);
	}),
	getQuotationOrder: protectedProcedure
		.input(z.object({ id: z.number(), currency: z.string() }))
		.query(async ({ input }) => {
			return await getQuotationOrderPrisma(input);
		})
});
