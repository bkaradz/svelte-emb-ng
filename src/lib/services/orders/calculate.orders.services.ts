import prisma from '$lib/prisma/client';
import { getQuantityPricelist } from '$lib/services/getQuantityPricelist.services';
import logger from '$lib/utility/logger';
import type { OrderLine, Products } from '@prisma/client';
import {
	dinero,
	greaterThanOrEqual,
	multiply,
	toSnapshot,
	type DineroSnapshot
} from 'dinero.js';

type NewOrderLine = OrderLine & Products;

type MainOrder = {
	id?: number | undefined;
	customersID: number | undefined;
	pricelistsID: number | undefined;
	isActive: boolean;
	accountsStatus: string | undefined;
	orderDate: string | undefined;
	deliveryDate?: string | undefined;
	comment?: string;
	OrderLine: Partial<NewOrderLine>[];
	isInvoiced: boolean;
};

export const calculateOrder = async (reqOrder: Partial<MainOrder>) => {
	try {
		/**
		 * Get Pricelist
		 */
		const pricelist = await prisma.pricelists.findUnique({
			where: {
				id: reqOrder.pricelistsID
			},
			include: {
				PricelistDetails: true
			}
		});

		if (!pricelist) {
			throw new Error("Pricelist not found");
		}

		if (!Array.isArray(reqOrder.OrderLine)) {
			throw new Error("OrderLine array not found");
		}

		const asyncOrderLine = reqOrder.OrderLine.map(async (item) => {
			const { quantity = 1, embroideryTypes = 'flat' } = item;
			/**
			 * Get product
			 */
			const product = await prisma.products.findUnique({
				where: {
					id: item?.id
				}
			});

			if (!product) {
				throw new Error(`Product id ${item?.id} does not exist`);
			}

			const { stitches } = product;

			if (stitches && pricelist && embroideryTypes) {
				/**
				 * Get appropriate pricePerThousandStitches & minimumPrice given the pricelist, quantity & embroideryTypes
				 */
				const { pricePerThousandStitches, minimumPrice } = getQuantityPricelist({
					pricelist,
					embroideryTypes,
					quantity
				}) as unknown as { pricePerThousandStitches: DineroSnapshot<number>, minimumPrice: DineroSnapshot<number> };

				/**
				 *  convert to dinero units
				 */
				const dineroPrice = dinero(JSON.parse(pricePerThousandStitches));

				/**
				 * calculate the unit price = stitches * pricePerThousandStitches
				 */
				const calcUnitPrice = multiply(dineroPrice, { amount: stitches, scale: 3 });

				/**
				 *  Get the greatest of unit price between Minimum Price & Calculated Price
				 */
				const largestUnitPrice = greaterThanOrEqual(dinero(JSON.parse(minimumPrice)), calcUnitPrice)
					? dinero(JSON.parse(minimumPrice))
					: calcUnitPrice;

				return {
					...item,
					unitPrice: toSnapshot(largestUnitPrice)
				};
			} else {
				return structuredClone(item);
			}
		});

		const newOrderLine = await Promise.all(asyncOrderLine);

		return newOrderLine;
	} catch (err: unknown) {
		logger.error(`Error: ${err}`);
		throw new Error(`Error:  ${err?.message}`);
	}
};
