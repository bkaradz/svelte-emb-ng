import { browser } from "$app/environment";
import { createConverter } from "$lib/services/monetary";
import type { CurrencyOption } from "$lib/stores/setCurrency.store";
import { trpc } from "$lib/trpc/client";
import logger from '$lib/utility/logger';
import type { OrderLine, Orders, Products } from "@prisma/client";
import { add, dinero, multiply, toSnapshot, type Dinero, type DineroSnapshot } from "dinero.js";

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

const handleCalculations = async (lineArray: NewOrderLine[] = [], pricelistsId: number) => {
    try {
        return await trpc().cart.calculateCart.mutate({
            pricelistsID: pricelistsId,
            OrderLine: lineArray
        })
    } catch (err: any) {
        
        logger.error(`Error: ${err}`);
        throw new Error("Error occurred during calculations");
    }
};

const handleCurrency = async (order: Orders & { OrderLine: NewOrderLine[] }, selectedCurrency: CurrencyOption, zero: Dinero<number>) => {

    /**
     * Calculate using the cart default usd currency
     */
    let newArray;
    if (browser) {
        newArray  = await handleCalculations(order.OrderLine, order.pricelistsID);
    }
    if (!Array.isArray(newArray)) {
        return;
    }

    const convert = createConverter(selectedCurrency.dineroObj);

    order.OrderLine = newArray.map((item) => {
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

    // oldOrder.OrderLine = oldOrder?.OrderLine

    // delete oldOrder?.OrderLine

    const order: Orders & { OrderLine: NewOrderLine[] } = JSON.parse(JSON.stringify(oldOrder))

    const newOrder = await handleCurrency(order, selectedCurrency, zero);

    if (!newOrder) {
        throw new Error("Error in calculations");
    }

    const subTotalsCalc = getCountAndSubTotal(newOrder.OrderLine, zero);

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