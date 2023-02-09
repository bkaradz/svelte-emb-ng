import { PrismaClient } from '@prisma/client'
import { products } from "./seedData/products";
import logger from '../src/lib/utility/logger';

const prisma = new PrismaClient()

async function main() {
  products.forEach((product) => {
    prisma.products.create({
      data: product
    })
  })
}

main().catch(e => {
  logger.error(`Error: ${e}`);
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})