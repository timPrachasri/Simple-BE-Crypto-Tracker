import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('>> Seeding token: Bitcoin (BTC)')

  const token = await prisma.token.create({
    data: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8, // Satoshi is the smallest unit of Bitcoin
    },
  })

  console.log(`>> DONE seeding token: ${token.name} (${token.symbol})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
