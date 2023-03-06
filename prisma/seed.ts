import { PrismaClient } from '@prisma/client'
import { contacts, products, users, options, pricelists, eexchangeRates, paymentTypeOptions } from "./seedData";
import logger from '../src/lib/utility/logger';
import bcrypt from 'bcrypt';
import config from 'config';
import { dinero } from 'dinero.js';
import { USD } from '@dinero.js/currencies';


const prisma = new PrismaClient()

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
  
  users.forEach(async (user) => {

    const salt = await bcrypt.genSalt(config.get('saltWorkFactor'));

    const hash = bcrypt.hashSync(user.password, salt);

    user.password = hash;

    const role = {
      userRole: 'ADMIN',
      isUser: true,
      isActive: true,
      isUserActive: true
    };

    const adminPromise = prisma.contacts.create({
      data: {
        ...user,
        ...role,
        email: {
          create: user.email
        },
        phone: {
          create: user.phone
        },
        address: {
          create: user.address
        }
      }
    })

    const admin = await Promise.all([adminPromise])
    const adminId = admin[0].id

    contacts.forEach(async (contact) => {

      await prisma.contacts.create({
        data: {
          "createdBy": adminId,
          ...contact,
          isActive: true,
          isCorporate: false,
          isUser: false,
          email: {
            create: contact.email
          },
          phone: {
            create: contact.phone
          },
          address: {
            create: contact.address
          }
        }
      })
    })

    products.forEach(async (product) => {
      await prisma.products.create({
        data: {
          "createdBy": adminId,
          ...product
        }
      })
    })

    options.forEach(async (option) => {

      await prisma.options.create({
        data: {
          "createdBy": adminId,
          ...option
        }
      })
    })

    paymentTypeOptions.forEach(async (option) => {

      await prisma.paymentTypeOptions.create({
        data: {
          "createdBy": adminId,
          ...option
        }
      })
    })

    pricelists.forEach(async (pricelist) => {
      const subPrices = pricelist.PricelistDetails.map((list) => {
        const pricePerThousandStitches = (Math.ceil(list.pricePerThousandStitches * 100))
        const minimumPrice = (Math.ceil(list.minimumPrice * 100))
        return {
          ...list,
          pricePerThousandStitches: JSON.stringify(dinero({ amount: pricePerThousandStitches, currency: USD })),
          minimumPrice: JSON.stringify(dinero({ amount: minimumPrice, currency: USD }))
        };
      });

      await prisma.pricelists.create({
        data: {
          "createdBy": adminId,
          ...pricelist,
          PricelistDetails: { createMany: { data: subPrices } }
        }
      })
    })

    eexchangeRates.forEach(async (rate) => {

      await prisma.exchangeRate.create({
        data: {
          "createdBy": adminId,
          ...rate,
          ExchangeRateDetails: {
            create: rate.ExchangeRateDetails
          },
        }
      })
    })

  })

}

main().catch(e => {
  logger.error(`Error: ${e}`);
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})