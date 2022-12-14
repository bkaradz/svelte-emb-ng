import type { OrderLine, Orders } from "@prisma/client";
import logger from '$lib/utility/logger';
import { createConverter } from "$lib/services/monetary";
import { add, dinero, multiply, toSnapshot, type Dinero, type DineroSnapshot } from "dinero.js";
import { browser } from "$app/environment";
import type { CurrencyOption } from "$lib/stores/setCurrency.store";
import { trpc } from "$lib/trpc/client";

type MainOrder = {
    id?: number | undefined;
    customersID: number | undefined;
    pricelistsID: number | undefined;
    isActive: boolean;
    accountsStatus: string | undefined;
    orderDate: string | undefined;
    deliveryDate?: string | undefined;
    comment?: string;
    OrderLine: OrderLine[];
    isInvoiced: boolean;
};

const handleCalculations = async (lineArray: OrderLine[] = [], pricelistsId: number) => {
    try {
        return await trpc().cart.calculateCart.mutate({
            pricelistsID: pricelistsId,
            orderLine: lineArray
        })
    } catch (err: any) {
        logger.error(`Error: ${err}`);
        throw new Error("Error occurred during calculations");
    }
};

const handleCurrency = async (order: Orders & { orderLine: OrderLine[] }, selectedCurrency: CurrencyOption, zero: Dinero<number>) => {

    /**
     * Calculate using the cart default usd currency
     */
    let newArray;
    if (browser) {
        newArray = await handleCalculations(order.orderLine, order.pricelistsID);
    }
    if (!Array.isArray(newArray)) {
        return;
    }

    const convert = createConverter(selectedCurrency.dineroObj);

    order.orderLine = newArray.map((item) => {
        let unitPrice = convert(dinero(item.unitPrice), selectedCurrency.dineroObj);
        if (!unitPrice) {
            unitPrice = zero;
        }

        return { ...item, unitPrice: toSnapshot(unitPrice) };
    });

    return order
};

const getCountAndSubTotal = (cart: OrderLine[], zero: Dinero<number>) => {
    const totals = cart.reduce(
        (acc, item) => {
            const unitPrice = item.unitPrice as DineroSnapshot<number>
            return {
                totalCartItems: acc.totalCartItems + item.quantity,
                subTotal: add(acc.subTotal, multiply(dinero(unitPrice), item.quantity))
            };
        },
        { totalCartItems: 0, subTotal: zero }
    );
    const totalCartItems = totals.totalCartItems;
    const subTotal = totals.subTotal;
    return { totalCartItems, subTotal }
};

export const handleCartCalculations = async (oldOrder: Partial<MainOrder>, selectedCurrency: CurrencyOption) => {

    const zero = dinero({ amount: 0, currency: selectedCurrency.dineroObj });

    // oldOrder.OrderLine = oldOrder?.orderLine

    // delete oldOrder?.orderLine

    const order: Orders & { orderLine: OrderLine[] } = JSON.parse(JSON.stringify(oldOrder))

    const newOrder = await handleCurrency(order, selectedCurrency, zero);

    if (!newOrder) {
        throw new Error("Error in calculations");
    }

    const subTotalsCalc = getCountAndSubTotal(newOrder.orderLine, zero);

    /**
     * TODO: User the vat rate in the database
     */
    const vat = 0;

    const calculatedVat = multiply(subTotalsCalc.subTotal, { amount: vat, scale: 2 });

    const calculatedTotal = add(calculatedVat, subTotalsCalc.subTotal);

    return {
        totalCartItems: subTotalsCalc.totalCartItems,
        subTotal: subTotalsCalc.subTotal,
        calculatedVat,
        grandTotal: calculatedTotal,
        order: newOrder,
        vat
    }
}