import "dotenv/config";
import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const city = await prisma.city.upsert({
    where: { slug: "moskva" },
    update: {},
    create: { name: "Москва", slug: "moskva", isActive: true },
  });

  const venue1 = await prisma.venue.upsert({
    where: { cityId_slug: { cityId: city.id, slug: "center" } },
    update: {},
    create: {
      name: "Restaurant Center",
      slug: "center",
      cityId: city.id,
      address: "ул. Пример, 1",
      phone: "+7 (999) 000-00-00",
      isActive: true,
    },
  });

  const venue2 = await prisma.venue.upsert({
    where: { cityId_slug: { cityId: city.id, slug: "north" } },
    update: {},
    create: {
      name: "Restaurant North",
      slug: "north",
      cityId: city.id,
      address: "ул. Пример, 10",
      phone: "+7 (999) 111-11-11",
      isActive: true,
    },
  });

  const adminEmail = "admin@example.com";
  const passwordHash = await bcrypt.hash("admin12345", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Администратор",
      phone: "+7 (900) 000-00-00",
      passwordHash,
      role: "ADMIN",
    },
  });

  const [catMain1, catDrinks1] = await Promise.all([
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue1.id, slug: "main" } },
      update: {},
      create: { venueId: venue1.id, name: "Основные", slug: "main", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue1.id, slug: "drinks" } },
      update: {},
      create: { venueId: venue1.id, name: "Напитки", slug: "drinks", sortOrder: 2 },
    }),
  ]);

  const [catMain2, catDesserts2] = await Promise.all([
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue2.id, slug: "main" } },
      update: {},
      create: { venueId: venue2.id, name: "Основные", slug: "main", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue2.id, slug: "desserts" } },
      update: {},
      create: { venueId: venue2.id, name: "Десерты", slug: "desserts", sortOrder: 2 },
    }),
  ]);

  await prisma.product.createMany({
    data: [
      {
        venueId: venue1.id,
        categoryId: catMain1.id,
        name: "Паста Карбонара",
        slug: "carbonara",
        description: "Классическая паста с соусом на основе яйца и сыра.",
        weight: "320 г",
        composition: "паста, бекон, яйцо, сыр",
        price: 69000,
      },
      {
        venueId: venue1.id,
        categoryId: catMain1.id,
        name: "Салат Цезарь",
        slug: "caesar",
        description: "Сочный салат с курицей и соусом.",
        weight: "250 г",
        composition: "салат, курица, соус, сухарики",
        price: 52000,
      },
      {
        venueId: venue1.id,
        categoryId: catDrinks1.id,
        name: "Лимонад",
        slug: "lemonade",
        weight: "400 мл",
        composition: "лимон, сахар, вода",
        price: 19000,
      },
      {
        venueId: venue2.id,
        categoryId: catMain2.id,
        name: "Бургер",
        slug: "burger",
        description: "Говяжья котлета, сыр, соус, овощи.",
        weight: "350 г",
        composition: "булочка, говядина, сыр, овощи",
        price: 59000,
      },
      {
        venueId: venue2.id,
        categoryId: catDesserts2.id,
        name: "Чизкейк",
        slug: "cheesecake",
        weight: "140 г",
        composition: "сыр, печенье, сливки",
        price: 31000,
      },
    ],
    skipDuplicates: true,
  });

  const popularCarbonara = await prisma.product.findFirst({
    where: { venueId: venue1.id, slug: "carbonara" },
    select: { id: true },
  });
  const popularCaesar = await prisma.product.findFirst({
    where: { venueId: venue1.id, slug: "caesar" },
    select: { id: true },
  });

  if (popularCarbonara) {
    await prisma.popularProduct.upsert({
      where: { venueId_productId: { venueId: venue1.id, productId: popularCarbonara.id } },
      update: { sortOrder: 1 },
      create: { venueId: venue1.id, productId: popularCarbonara.id, sortOrder: 1 },
    });
  }
  if (popularCaesar) {
    await prisma.popularProduct.upsert({
      where: { venueId_productId: { venueId: venue1.id, productId: popularCaesar.id } },
      update: { sortOrder: 2 },
      create: { venueId: venue1.id, productId: popularCaesar.id, sortOrder: 2 },
    });
  }

  await prisma.newsItem.createMany({
    data: [
      {
        venueId: venue1.id,
        title: "Скидка 10% на пасту по будням",
        content: "Действует с 12:00 до 16:00.",
        isActive: true,
      },
      {
        venueId: venue1.id,
        title: "Бранч по выходным",
        content: "Комбо-завтрак и кофе — только суббота и воскресенье.",
        isActive: true,
      },
      {
        venueId: venue2.id,
        title: "Новый десерт недели",
        content: "Попробуйте наш чизкейк с ягодным соусом.",
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

