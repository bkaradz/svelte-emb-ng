import { USD } from '@dinero.js/currencies';
import prisma from "../src/lib/prisma/client";
// import { auth } from '../src/lib/lucia/client';
import logger from '../src/lib/utility/logger';
import { dinero } from 'dinero.js';
import { sveltekit } from 'lucia-auth/middleware'
import lucia from 'lucia-auth';
import prismaAdapter from "@lucia-auth/adapter-prisma";

import {
	contacts,
	exchangeRates,
	options,
	paymentTypeOptions,
	pricelists,
	products,
	users
} from './seedData';


type User = {
  userId: string,
  username: string,
  name: string
}

export const auth = lucia({
	adapter: prismaAdapter(prisma as any),
	env: 'DEV',
	middleware: sveltekit(),
	transformDatabaseUser: (userData) => {
		return {
			userId: userData.id,
			username: userData.username,
			name: userData.name
		}
	}
});


async function main() {
	await prisma.contacts.deleteMany();
	await prisma.email.deleteMany();
	await prisma.phone.deleteMany();
	await prisma.address.deleteMany();
	await prisma.products.deleteMany();
	await prisma.options.deleteMany();
	await prisma.pricelists.deleteMany();
	await prisma.pricelistDetails.deleteMany();
	await prisma.exchangeRate.deleteMany();
	await prisma.exchangeRateDetails.deleteMany();
	await prisma.paymentTypeOptions.deleteMany();

	// contacts.forEach(async (contact) => {
	// 		await prisma.contacts.create({
	// 			data: {
	// 				// createdBy: adminId,
	// 				...contact,
	// 				isActive: true,
	// 				isCorporate: false,
	// 				email: {
	// 					create: contact.email
	// 				},
	// 				phone: {
	// 					create: contact.phone
	// 				},
	// 				address: {
	// 					create: contact.address
	// 				}
	// 			}
	// 		});
	// 	});

	// 	products.forEach(async (product) => {
	// 		await prisma.products.create({
	// 			data: {
	// 				// createdBy: adminId,
	// 				...product
	// 			}
	// 		});
	// 	});

	// 	options.forEach(async (option) => {
	// 		await prisma.options.create({
	// 			data: {
	// 				// createdBy: adminId,
	// 				...option
	// 			}
	// 		});
	// 	});

	// 	paymentTypeOptions.forEach(async (option) => {
	// 		await prisma.paymentTypeOptions.create({
	// 			data: {
	// 				// createdBy: adminId,
	// 				...option
	// 			}
	// 		});
	// 	});

	// 	pricelists.forEach(async (pricelist) => {
	// 		const subPrices = pricelist.PricelistDetails.map((list) => {
	// 			const pricePerThousandStitches = Math.ceil(list.pricePerThousandStitches * 100);
	// 			const minimumPrice = Math.ceil(list.minimumPrice * 100);
	// 			return {
	// 				...list,
	// 				pricePerThousandStitches: JSON.stringify(
	// 					dinero({ amount: pricePerThousandStitches, currency: USD })
	// 				),
	// 				minimumPrice: JSON.stringify(dinero({ amount: minimumPrice, currency: USD }))
	// 			};
	// 		});

	// 		await prisma.pricelists.create({
	// 			data: {
	// 				// createdBy: adminId,
	// 				...pricelist,
	// 				PricelistDetails: { createMany: { data: subPrices } }
	// 			}
	// 		});
	// 	});

	// 	exchangeRates.forEach(async (rate) => {
	// 		await prisma.exchangeRate.create({
	// 			data: {
	// 				// createdBy: adminId,
	// 				...rate,
	// 				ExchangeRateDetails: {
	// 					create: rate.ExchangeRateDetails
	// 				}
	// 			}
	// 		});
	// 	});


	users.forEach(async (user) => {
		const { name, username, password } = user

		const newUser = await auth.createUser({
			primaryKey: {
				providerId: 'username',
				providerUserId: username,
				password
			},
			attributes: {
				name,
				username
			}
		}) as User

		// const admin = await Promise.all([newUser]);
		// const adminId = admin[0].userId;
		
	});
	
}

main()
	.catch((e) => {
		logger.error(`Error: ${e}`);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});
