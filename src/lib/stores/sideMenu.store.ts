import { writable, readable } from 'svelte/store';

import { v4 as uuidv4 } from 'uuid';
import {
	svgContacts,
	svgShoppingBag,
	svgChart,
	svgQrCode,
	svgAdjustments,
	svgDocReport,
	svgDollar,
	svgClipboardList
} from '$lib/utility/svgLogos';

export const toggleMenu = writable<boolean>(false);

const anchorTags = [
	{
		id: uuidv4(),
		url: '/',
		name: 'Dashboard',
		icon: svgChart
	},
	{
		id: uuidv4(),
		url: '/contacts',
		name: 'Customer',
		icon: svgContacts
	},
	{
		id: uuidv4(),
		url: '/products',
		name: 'Products',
		icon: svgShoppingBag
	},
	{
		id: uuidv4(),
		url: '/orders',
		name: 'Sales',
		icon: svgDollar
	},
	{
		id: uuidv4(),
		url: '/reports',
		name: 'Reports',
		icon: svgDocReport
	},
	{
		id: uuidv4(),
		url: '/production',
		name: 'Production',
		icon: svgClipboardList
	},
	{
		id: uuidv4(),
		url: '/test',
		name: 'Test',
		icon: svgQrCode
	},
	{
		id: uuidv4(),
		url: '/settings',
		name: 'Settings',
		icon: svgAdjustments
	}
];

export const anchorList = readable(anchorTags);
