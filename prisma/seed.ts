import { PrismaClient } from '@prisma/client'
// import { contacts, products, users, options, pricelists, exchangeRates } from "./seedData";
import { contacts } from "./seedData/contacts";
import { products } from "./seedData/products";
import { users } from "./seedData/users";
import { options } from "./seedData/options";
import { pricelists, } from "./seedData/pricelists";
import { exchangeRates } from "./seedData/exchangeRates";
import logger from '../src/lib/utility/logger';
import bcrypt from 'bcrypt';
import config from 'config';


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
  await prisma.xchangeRate.deleteMany();
  await prisma.xchangeRateDetails.deleteMany();

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

    await prisma.contacts.create({
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
  })

  contacts.forEach(async (contact) => {

    await prisma.contacts.create({
      data: {
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
      data: product
    })
  })


  options.forEach(async (option) => {

    await prisma.options.create({
      data: option
    })
  })

  pricelists.forEach(async (pricelist) => {

    await prisma.pricelists.create({
      data: {
        ...pricelist,
        PricelistDetails: {
          create: pricelist.PricelistDetails
        },
      }
    })
  })

  exchangeRates.forEach(async (rate) => {

    await prisma.xchangeRate.create({
      data: {
        ...rate,
        XchangeRateDetails: {
          create: rate.XchangeRateDetails
        },
      }
    })
  })
}

main().catch(e => {
  logger.error(`Error: ${e}`);
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})