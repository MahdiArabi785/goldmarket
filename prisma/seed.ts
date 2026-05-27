import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // پاک‌سازی داده‌های قبلی
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.walletTransaction.deleteMany()
  await prisma.priceAlert.deleteMany()
  await prisma.expertRequest.deleteMany()
  await prisma.user.deleteMany()
  await prisma.priceHistory.deleteMany()

  console.log('🗑️  داده‌های قبلی پاک شدند')

  // ایجاد کاربر ادمین
  const admin = await prisma.user.create({
    data: {
      phone: '09120000000',
      name: 'مدیر سیستم',
      role: 'ADMIN',
      walletBalance: 0,
    },
  })
  console.log('👤 ادمین ساخته شد:', admin.phone)

  // ایجاد فروشنده
  const seller = await prisma.user.create({
    data: {
      phone: '09121111111',
      name: 'طلا فروشی البرز',
      role: 'SELLER',
      walletBalance: 1000000000,
    },
  })
  console.log('👤 فروشنده ساخته شد:', seller.name)

  // ایجاد خریدار
  const buyer = await prisma.user.create({
    data: {
      phone: '09122222222',
      name: 'علی خریدار',
      role: 'BUYER',
      walletBalance: 500000000,
    },
  })
  console.log('👤 خریدار ساخته شد:', buyer.name)

  // ایجاد کارشناس
  const expert = await prisma.user.create({
    data: {
      phone: '09123333333',
      name: 'کارشناس طلا',
      role: 'EXPERT',
      walletBalance: 0,
    },
  })
  console.log('👤 کارشناس ساخته شد:', expert.name)

  // محصولات نمونه
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: seller.id,
        type: 'NEW',
        name: 'گردنبند طلا ۱۸ عیار طرح اشک',
        weight: 5.5,
        karat: 18,
        wage: 2500000,
        profitPercent: 7,
        finalPrice: 125000000,
        stock: 5,
        images: ['https://picsum.photos/seed/gold1/400/400'],
        description: 'گردنبند طلای ۱۸ عیار با طراحی منحصر به فرد',
        isVerified: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        type: 'NEW',
        name: 'دستبند طلا ۱۸ عیار زنجیره‌ای',
        weight: 8.2,
        karat: 18,
        wage: 3200000,
        profitPercent: 5,
        finalPrice: 180000000,
        stock: 3,
        images: ['https://picsum.photos/seed/gold2/400/400'],
        description: 'دستبند زنجیره‌ای طلای ۱۸ عیار',
        isVerified: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        type: 'SECOND_HAND',
        name: 'انگشتر طلا دست دوم',
        weight: 3.1,
        karat: 18,
        wage: 0,
        profitPercent: 3,
        finalPrice: 68000000,
        stock: 1,
        images: ['https://picsum.photos/seed/gold3/400/400'],
        description: 'انگشتر طلا دست دوم - تأیید شده توسط کارشناس',
        isVerified: true,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        type: 'MELTED',
        name: 'طلا آب شده ۱۸ عیار',
        weight: 50,
        karat: 18,
        wage: 0,
        profitPercent: 1,
        finalPrice: 1000000000,
        stock: 10,
        images: ['https://picsum.photos/seed/gold4/400/400'],
        description: 'طلای آب شده ۱۸ عیار - مناسب سرمایه‌گذاری',
        isVerified: true,
      },
    }),
  ])
  console.log(`🪙 ${products.length} محصول ساخته شد`)

  // تاریخچه قیمت
  const priceHistories = []
  const basePrice = 20000000
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const variation = (Math.random() - 0.5) * 2000000
    priceHistories.push(
      await prisma.priceHistory.create({
        data: {
          price: Math.round(basePrice + variation),
          source: 'tgju.org',
          createdAt: date,
        },
      })
    )
  }
  console.log(`📊 ${priceHistories.length} رکورد قیمت ساخته شد`)

  // تراکنش نمونه
  await prisma.walletTransaction.create({
    data: {
      userId: buyer.id,
      amount: 500000000,
      type: 'DEPOSIT',
      description: 'شارژ اولیه کیف پول',
    },
  })

  // سفارش نمونه
  await prisma.order.create({
    data: {
      buyerId: buyer.id,
      productId: products[0].id,
      quantity: 1,
      totalPrice: products[0].finalPrice,
      status: 'COMPLETED',
    },
  })

  console.log('✅ Seed کامل شد!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })