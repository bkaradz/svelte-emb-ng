import prisma from '$lib/prisma/client';
import type { SaveOption } from '$lib/validation/saveOption.validate';
import type { Prisma } from '@prisma/client';
import type { Context } from '../context';

export const getOptionsPrisma = async (input: { group?: string | undefined }) => {
	type ObjectKeys = keyof typeof input;

	const objectKeys = Object.keys(input)[0] as ObjectKeys;

	let query: Prisma.OptionsFindManyArgs;

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

	return await prisma.options.findMany(query);
};

export type GetOptions = typeof getOptionsPrisma;

export const getByIdPrisma = async (input: number) => {
	const option = await prisma.options.findUnique({
		where: {
			id: input
		}
	});

	return option;
};

export type GetById = typeof getByIdPrisma;

export const saveOrUpdateOptionPrisma = async (input: SaveOption, ctx: Context) => {
	if (!ctx?.userId) {
		throw new Error('User not authorised');
	}

	const createdBy = ctx.userId as number;

	if (input.isDefault) {
		changeCurrentDefault(input.group);
	}

	const option = { ...input, createdBy };

	if (input.id) {
		return await prisma.options.update({ where: { id: input.id }, data: option });
	} else {
		return await prisma.options.create({ data: option });
	}
};

export type SaveOrUpdateOption = typeof saveOrUpdateOptionPrisma;

export const deleteByIdPrisma = async (input: number) => {
	const option = await prisma.options.update({
		where: { id: input },
		data: { isActive: false }
	});

	return option;
};

export type DeleteById = typeof deleteByIdPrisma;

export const changeCurrentDefault = async (group: string) => {
	await prisma.options.updateMany({
		where: {
			group,
			isDefault: {
				equals: true
			}
		},
		data: { isDefault: false }
	});
};
