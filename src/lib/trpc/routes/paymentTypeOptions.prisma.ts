import prisma from '$lib/prisma/client';
import type { SavePaymentTypeOptions } from '$lib/validation/savePaymentTypeOptions.validate';
import type { Prisma } from '@prisma/client';
import type { Context } from '../context';

export const getPaymentsPrisma = async (input: { group?: string | undefined }) => {
	type ObjectKeys = keyof typeof input;

	const objectKeys = Object.keys(input)[0] as ObjectKeys;

	let query: Prisma.PaymentTypeOptionsFindManyArgs;

	if (objectKeys) {
		query = {
			where: {
				isActive: true,
				[objectKeys]: {
					contains: input[objectKeys],
					mode: 'insensitive'
				}
			},
			orderBy: {
				label: 'asc'
			}
		};
	} else {
		query = {
			where: {
				isActive: true
			},
			orderBy: {
				label: 'asc'
			}
		};
	}

	return await prisma.paymentTypeOptions.findMany(query);
};

export type GetPayments = typeof getPaymentsPrisma;
export type GetPaymentsReturn = Prisma.PromiseReturnType<typeof getPaymentsPrisma>;

export const getByIdPrisma = async (input: number) => {
	const option = await prisma.paymentTypeOptions.findUnique({
		where: {
			id: input
		}
	});

	return option;
};

export type GetById = typeof getByIdPrisma;
export type GetByIdReturn = Prisma.PromiseReturnType<typeof getByIdPrisma>;

export const saveOrUpdatePaymentsPrisma = async (input: SavePaymentTypeOptions, ctx: Context) => {
	if (!ctx?.userId) {
		throw new Error('User not authorised');
	}

	const createdBy = ctx.userId ;

	if (input.isDefault) {
		changeCurrentDefault(input.group);
	}

	const option = { ...input, createdBy };

	if (input.id) {
		return await prisma.paymentTypeOptions.update({ where: { id: input.id }, data: option });
	} else {
		return await prisma.paymentTypeOptions.create({ data: option });
	}
};

export type SaveOrUpdatePayments = typeof saveOrUpdatePaymentsPrisma;
export type SaveOrUpdatePaymentsReturn = Prisma.PromiseReturnType<
	typeof saveOrUpdatePaymentsPrisma
>;

export const deleteByIdPrisma = async (input: number) => {
	const option = await prisma.paymentTypeOptions.update({
		where: { id: input },
		data: { isActive: false }
	});

	return option;
};

export type DeleteById = typeof deleteByIdPrisma;
export type DeleteByIdReturn = Prisma.PromiseReturnType<typeof deleteByIdPrisma>;

export const changeCurrentDefault = async (group: string) => {
	await prisma.paymentTypeOptions.updateMany({
		where: {
			group,
			isDefault: {
				equals: true
			}
		},
		data: { isDefault: false }
	});
};
