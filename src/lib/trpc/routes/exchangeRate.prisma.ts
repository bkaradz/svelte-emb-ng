import prisma from '$lib/prisma/client';
import { getBoolean } from '$lib/utility/toBoolean';
import type { SaveExchangeRate } from '$lib/validation/saveExchangeRate.validate';
import type { Prisma } from '@prisma/client';
import type { Context } from '../context';

export const getExchangeRatesPrisma = async (input: { isDefault: boolean; isActive: boolean }) => {
	type ObjectKeys = keyof typeof input;

	const objectKeys = Object.keys(input)[0] as ObjectKeys;

	let whereQuery;

	if (objectKeys === 'isDefault' || objectKeys === 'isActive') {
		if (!input[objectKeys]) {
			return;
		}
		whereQuery = {
			equals: getBoolean(input[objectKeys])
		};
	}

	let query: Prisma.ExchangeRateFindManyArgs;

	const baseQuery = {
		include: {
			ExchangeRateDetails: true
		}
	};

	if (objectKeys) {
		query = {
			...baseQuery,
			where: {
				isActive: true,
				[objectKeys]: whereQuery
			}
		};
	} else {
		query = {
			...baseQuery,
			where: {
				isActive: true
			}
		};
	}

	return await prisma.exchangeRate.findMany({
		...query,
		include: {
			ExchangeRateDetails: true
		}
	});
};

export type GetExchangeRates = typeof getExchangeRatesPrisma;
export type GetExchangeRatesReturn = Prisma.PromiseReturnType<typeof getExchangeRatesPrisma>;

export const getByIdPrisma = async (input: number) => {
	const exchangeRate = await prisma.exchangeRate.findUnique({
		where: {
			id: input
		},
		include: {
			ExchangeRateDetails: true
		}
	});

	return exchangeRate;
};

export type GetById = typeof getByIdPrisma;
export type GetByIdReturn = Prisma.PromiseReturnType<typeof getByIdPrisma>;

export const getDefaultExchangeRatePrisma = async () => {
	const exchangeRate = await prisma.exchangeRate.findMany({
		where: {
			isDefault: {
				equals: true
			}
		},
		include: {
			ExchangeRateDetails: true
		}
	});

	if (exchangeRate.length > 1) {
		throw new Error('Default exchange rates are more than one');
	}

	return exchangeRate;
};

export type GetDefaultExchangeRate = typeof getDefaultExchangeRatePrisma;
export type GetDefaultExchangeRateReturn = Prisma.PromiseReturnType<
	typeof getDefaultExchangeRatePrisma
>;

export const saveOrUpdateExchangeRatePrisma = async (input: SaveExchangeRate, ctx: Context) => {
	if (!ctx?.userId) {
		throw new Error('User not authorised');
	}

	const createdBy = ctx.userId;

	if (input.isDefault) {
		changeCurrentDefault();
	}

	if (input?.exChangeRateDate) {
		input.exChangeRateDate = new Date(input.exChangeRateDate) as unknown as string;
	}

	const { ExchangeRateDetails, ...restRates } = input;

	const rateDetails = ExchangeRateDetails.map((list) => {
		const { id, ...restObj } = list;
		return {
			...restObj
		};
	});

	const data = {
		...restRates,
		createdBy,
		ExchangeRateDetails: { createMany: { data: rateDetails } }
	};

	if (input.id) {
		return await prisma.exchangeRate.update({ where: { id: input.id }, data });
	} else {
		return await prisma.exchangeRate.create({ data });
	}
};

export type SaveOrUpdateExchangeRate = typeof saveOrUpdateExchangeRatePrisma;
export type SaveOrUpdateExchangeRateReturn = Prisma.PromiseReturnType<
	typeof saveOrUpdateExchangeRatePrisma
>;

export const deleteByIdPrisma = async (input: number) => {
	const exchangeRate = await prisma.exchangeRate.update({
		where: { id: input },
		data: { isActive: false }
	});

	return exchangeRate;
};

export type DeleteById = typeof deleteByIdPrisma;
export type DeleteByIdReturn = Prisma.PromiseReturnType<typeof deleteByIdPrisma>;

export const changeCurrentDefault = async () => {
	return await prisma.exchangeRate.updateMany({
		where: {
			isDefault: {
				equals: true
			}
		},
		data: { isDefault: false }
	});
};
