import prisma from '$lib/prisma/client';
import { setMonetaryValue } from '$lib/services/monetary';
import type { SavePricelists } from '$lib/validation/savePricelists.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Pricelists, Prisma } from '@prisma/client';
import type { Context } from '../context';

export const getPricelistsPrisma = async (input: SearchParams) => {
	type ObjectKeys = keyof Pricelists;

	const objectKeys = Object.keys(input)[0] as ObjectKeys;

	let query: Prisma.PricelistsFindManyArgs;

	const containsArg = input[objectKeys];

	if (objectKeys) {
		query = {
			where: {
				isActive: true,
				[objectKeys]: {
					contains: containsArg,
					mode: 'insensitive'
				}
			},
			orderBy: {
				id: 'asc'
			}
		};
	} else {
		query = {
			where: {
				isActive: true
			},
			orderBy: {
				id: 'asc'
			}
		};
	}

	return await prisma.pricelists.findMany(query);
};

export type GetPricelists = typeof getPricelistsPrisma;
export type GetPricelistsReturn = Prisma.PromiseReturnType<typeof getPricelistsPrisma>


export const getByIdPrisma = async (input: number) => {
	const pricelist = await prisma.pricelists.findUnique({
		where: {
			id: input
		},
		include: {
			PricelistDetails: true
		}
	});

	return pricelist;
};

export type GetById = typeof getByIdPrisma;
export type GetByIdReturn = Prisma.PromiseReturnType<typeof getByIdPrisma>


export const getDefaultPricelistPrisma = async () => {
	const pricelist = await prisma.pricelists.findMany({
		where: {
			isDefault: {
				equals: true
			}
		},
		include: {
			PricelistDetails: true
		}
	});

	if (pricelist.length > 1) {
		throw new Error('Default pricelist more than one');
	}

	if (pricelist.length === 0) {
		throw new Error('Default pricelist not found');
	}

	return pricelist[0];
};

export type GetDefaultPricelist = typeof getDefaultPricelistPrisma;
export type GetDefaultPricelistReturn = Prisma.PromiseReturnType<typeof getDefaultPricelistPrisma>


export const saveOrUpdatePricelistPrisma = async (input: SavePricelists, ctx: Context) => {
	if (!ctx?.userId) {
		throw new Error('User not authorised');
	}

	const createdBy = ctx.userId as number;

	if (input.isDefault) {
		changeCurrentDefault();
	}

	const { pricelistDetails, ...restPricelist } = input;

	const subPrices = pricelistDetails.map((list: any) => {
		return {
			...list,
			pricePerThousandStitches: setMonetaryValue(list.pricePerThousandStitches),
			minimumPrice: setMonetaryValue(list.minimumPrice)
		};
	});

	if (input.id) {
		return await prisma.pricelists.update({
			where: {
				id: input.id
			},
			data: {
				...restPricelist,
				createdBy,
				PricelistDetails: { createMany: { data: subPrices } }
			}
		});
	} else {
		return await prisma.pricelists.create({
			data: {
				...restPricelist,
				createdBy,
				PricelistDetails: { createMany: { data: subPrices } }
			}
		});
	}
};

export type SaveOrUpdatePricelist = typeof saveOrUpdatePricelistPrisma;
export type SaveOrUpdatePricelistReturn = Prisma.PromiseReturnType<typeof saveOrUpdatePricelistPrisma>


export const deleteByIdPrisma = async (input: number) => {
	const pricelist = await prisma.pricelists.update({
		where: { id: input },
		data: { isActive: false }
	});

	return pricelist;
};

export type DeleteById = typeof deleteByIdPrisma;
export type DeleteByIdReturn = Prisma.PromiseReturnType<typeof deleteByIdPrisma>


export const changeCurrentDefault = async () => {
	return await prisma.pricelists.updateMany({
		where: {
			isDefault: {
				equals: true
			}
		},
		data: { isDefault: false }
	});
};
