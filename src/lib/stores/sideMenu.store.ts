import { readable } from 'svelte/store';

import {
	svgContacts,
	svgShoppingBag,
	svgChart,
	svgQrCode,
	svgAdjustments,
	svgDollar,
	svgClipboardList,
	svgCart,
	svgDocumentSearch,
	svgCreditCard
} from '$lib/utility/svgLogos';

const anchorTags = [
	{
		id: crypto.randomUUID(),
		url: '/',
		name: 'Dashboard',
		icon: svgChart
	},
	{
		id: crypto.randomUUID(),
		url: '/contacts',
		name: 'Customer',
		icon: svgContacts
	},
	{
		id: crypto.randomUUID(),
		url: '/products',
		name: 'Products',
		icon: svgShoppingBag
	},
	{
		id: crypto.randomUUID(),
		url: '/cart',
		name: 'Cart',
		icon: svgCart
	},
	{
		id: crypto.randomUUID(),
		url: '/orders',
		name: 'Sales',
		icon: svgDollar
	},
	{
		id: crypto.randomUUID(),
		url: '/payments',
		name: 'Payments',
		icon: svgCreditCard
	},
	{
		id: crypto.randomUUID(),
		url: '/reports',
		name: 'Reports',
		icon: svgDocumentSearch
	},
	{
		id: crypto.randomUUID(),
		url: '/production',
		name: 'Production',
		icon: svgClipboardList
	},
	{
		id: crypto.randomUUID(),
		url: '/test',
		name: 'Test',
		icon: svgQrCode
	},
	{
		id: crypto.randomUUID(),
		url: '/settings',
		name: 'Settings',
		icon: svgAdjustments
	}
];

export const anchorList = readable(anchorTags);
