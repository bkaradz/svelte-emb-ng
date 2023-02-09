import { PrismaClient } from '@prisma/client'
import { products, users } from "./seedData";
import logger from '../src/lib/utility/logger';

const prisma = new PrismaClient()

async function main() {
  products.forEach(async (product) => {
    await prisma.products.create({
      data: product
    })
  })
  // products.forEach(async (product) => {
  //   await prisma.contacts.create({
  //     data: users
  //   })
  // })
}

main().catch(e => {
  logger.error(`Error: ${e}`);
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})