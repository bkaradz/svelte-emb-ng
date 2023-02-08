import { PrismaClient } from '@prisma/client'
import { products } from "./seedData/products";

const prisma = new PrismaClient()

async function main() {
  products.forEach((product) => {
    prisma.products.create({
      data: product
    })
  })
}

main().catch().then().finally()