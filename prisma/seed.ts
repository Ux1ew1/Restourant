import "dotenv/config";
import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

/** Создаёт новостной баннер, если ещё нет записи с таким заголовком и привязкой к заведению. */
async function ensureNewsItem(data: {
  venueId?: string | null;
  title: string;
  content?: string | null;
  isActive?: boolean;
  publishedAt?: Date;
}) {
  const where =
    data.venueId === undefined || data.venueId === null
      ? { title: data.title, venueId: null }
      : { title: data.title, venueId: data.venueId };

  const exists = await prisma.newsItem.findFirst({ where });
  if (exists) return;

  await prisma.newsItem.create({
    data: {
      venueId: data.venueId ?? null,
      title: data.title,
      content: data.content ?? null,
      isActive: data.isActive ?? true,
      publishedAt: data.publishedAt ?? new Date(),
    },
  });
}

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

  const venue3 = await prisma.venue.upsert({
    where: { cityId_slug: { cityId: city.id, slug: "lapsha" } },
    update: {},
    create: {
      name: "Лапша",
      slug: "lapsha",
      cityId: city.id,
      address: "ул. Пример, 25",
      phone: "+7 (999) 222-22-22",
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

  const [catSoups1, catMain1, catDrinks1] = await Promise.all([
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue1.id, slug: "soups" } },
      update: {},
      create: { venueId: venue1.id, name: "Супы", slug: "soups", sortOrder: 0 },
    }),
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

  const [catMain2, catDesserts2, catSides2] = await Promise.all([
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
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue2.id, slug: "sides" } },
      update: {},
      create: { venueId: venue2.id, name: "Гарниры", slug: "sides", sortOrder: 3 },
    }),
  ]);

  const [catNoodles3, catSoups3, catStarters3] = await Promise.all([
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue3.id, slug: "noodles" } },
      update: {},
      create: { venueId: venue3.id, name: "Лапша", slug: "noodles", sortOrder: 0 },
    }),
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue3.id, slug: "soups" } },
      update: {},
      create: { venueId: venue3.id, name: "Супы", slug: "soups", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { venueId_slug: { venueId: venue3.id, slug: "starters" } },
      update: {},
      create: { venueId: venue3.id, name: "Закуски", slug: "starters", sortOrder: 2 },
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
        categoryId: catMain1.id,
        name: "Ризотто с белыми грибами",
        slug: "risotto-mushrooms",
        description: "Кремовый рис арборио с пармезаном и грибами.",
        weight: "280 г",
        composition: "рис, грибы, сыр, бульон",
        price: 64000,
      },
      {
        venueId: venue1.id,
        categoryId: catMain1.id,
        name: "Стейк рибай",
        slug: "ribeye-steak",
        description: "Мраморная говядина со сливочным маслом и травами.",
        weight: "220 г",
        composition: "говядина, масло, чеснок, розмарин",
        price: 129000,
      },
      {
        venueId: venue1.id,
        categoryId: catMain1.id,
        name: "Брускетта с томатами",
        slug: "bruschetta-tomato",
        description: "Хрустящий хлеб с базиликом и оливковым маслом.",
        weight: "180 г",
        composition: "багет, томаты, базилик, чеснок",
        price: 39000,
      },
      {
        venueId: venue1.id,
        categoryId: catSoups1.id,
        name: "Борщ с говядиной",
        slug: "borscht",
        description: "Наваристый борщ со сметаной и зеленью.",
        weight: "350 мл",
        composition: "говядина, свёкла, капуста, картофель",
        price: 42000,
      },
      {
        venueId: venue1.id,
        categoryId: catSoups1.id,
        name: "Том-ям с креветками",
        slug: "tom-yam",
        description: "Острый суп с лемонграссом и кокосовым молоком.",
        weight: "400 мл",
        composition: "креветки, грибы, паста том-ям, лайм",
        price: 58000,
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
        venueId: venue1.id,
        categoryId: catDrinks1.id,
        name: "Эспрессо",
        slug: "espresso",
        description: "Двойной шот арабики.",
        weight: "60 мл",
        composition: "зёрна кофе",
        price: 18000,
      },
      {
        venueId: venue1.id,
        categoryId: catDrinks1.id,
        name: "Смузи ягодный",
        slug: "berry-smoothie",
        description: "Клубника, малина, банан, йогурт.",
        weight: "350 мл",
        composition: "ягоды, банан, йогурт",
        price: 29000,
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
        categoryId: catMain2.id,
        name: "Чикен-бургер",
        slug: "chicken-burger",
        description: "Хрустящее куриное филе и коул-слоу.",
        weight: "320 г",
        composition: "булочка, курица, капуста, соус",
        price: 49000,
      },
      {
        venueId: venue2.id,
        categoryId: catSides2.id,
        name: "Картофель фри",
        slug: "fries",
        weight: "150 г",
        composition: "картофель, масло",
        price: 22000,
      },
      {
        venueId: venue2.id,
        categoryId: catSides2.id,
        name: "Луковые кольца",
        slug: "onion-rings",
        weight: "120 г",
        composition: "лук, панировка",
        price: 24000,
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
      {
        venueId: venue2.id,
        categoryId: catDesserts2.id,
        name: "Тирамису",
        slug: "tiramisu",
        description: "Классика с маскарпоне и кофе.",
        weight: "130 г",
        composition: "маскарпоне, савоярди, кофе, какао",
        price: 38000,
      },
      {
        venueId: venue2.id,
        categoryId: catDesserts2.id,
        name: "Мороженое три шарика",
        slug: "ice-cream-trio",
        weight: "120 г",
        composition: "молоко, сливки, ваниль, шоколад",
        price: 26000,
      },
      {
        venueId: venue3.id,
        categoryId: catNoodles3.id,
        name: "Рамен с курицей",
        slug: "chicken-ramen",
        description: "Пшеничная лапша в насыщенном бульоне с курицей, яйцом и нори.",
        imageUrl: "/images/menu/chicken-ramen.png",
        weight: "520 г",
        composition: "лапша, курица, бульон, яйцо, нори, зелёный лук",
        price: 56000,
      },
      {
        venueId: venue3.id,
        categoryId: catNoodles3.id,
        name: "Удон с говядиной",
        slug: "beef-udon",
        description: "Обжаренный удон с говядиной, овощами и соусом терияки.",
        imageUrl: "/images/menu/beef-udon.png",
        weight: "430 г",
        composition: "лапша удон, говядина, болгарский перец, лук, соус терияки",
        price: 59000,
      },
      {
        venueId: venue3.id,
        categoryId: catNoodles3.id,
        name: "Соба с креветками",
        slug: "shrimp-soba",
        description: "Гречневая лапша с креветками, брокколи и кунжутом.",
        imageUrl: "/images/menu/shrimp-soba.png",
        weight: "410 г",
        composition: "лапша соба, креветки, брокколи, морковь, кунжут",
        price: 62000,
      },
      {
        venueId: venue3.id,
        categoryId: catSoups3.id,
        name: "Мисо-суп с тофу",
        slug: "miso-tofu",
        description: "Лёгкий мисо-бульон с тофу, вакаме и зелёным луком.",
        imageUrl: "/images/menu/miso-tofu.png",
        weight: "320 мл",
        composition: "мисо-паста, тофу, вакаме, зелёный лук",
        price: 29000,
      },
      {
        venueId: venue3.id,
        categoryId: catStarters3.id,
        name: "Гёдза с курицей",
        slug: "chicken-gyoza",
        description: "Японские пельмени на пару и гриле с соусом понзу.",
        imageUrl: "/images/menu/chicken-gyoza.png",
        weight: "180 г",
        composition: "тесто, курица, капуста, имбирь, соус понзу",
        price: 36000,
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
  const popularRisotto = await prisma.product.findFirst({
    where: { venueId: venue1.id, slug: "risotto-mushrooms" },
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
  if (popularRisotto) {
    await prisma.popularProduct.upsert({
      where: { venueId_productId: { venueId: venue1.id, productId: popularRisotto.id } },
      update: { sortOrder: 3 },
      create: { venueId: venue1.id, productId: popularRisotto.id, sortOrder: 3 },
    });
  }

  const burgerNorth = await prisma.product.findFirst({
    where: { venueId: venue2.id, slug: "burger" },
    select: { id: true },
  });
  if (burgerNorth) {
    await prisma.popularProduct.upsert({
      where: { venueId_productId: { venueId: venue2.id, productId: burgerNorth.id } },
      update: { sortOrder: 1 },
      create: { venueId: venue2.id, productId: burgerNorth.id, sortOrder: 1 },
    });
  }

  const now = Date.now();
  const day = 86400000;

  await ensureNewsItem({
    venueId: venue1.id,
    title: "Скидка 10% на пасту по будням",
    content: "Действует с 12:00 до 16:00.",
    publishedAt: new Date(now - day * 1),
  });
  await ensureNewsItem({
    venueId: venue1.id,
    title: "Бранч по выходным",
    content: "Комбо-завтрак и кофе — только суббота и воскресенье.",
    publishedAt: new Date(now - day * 2),
  });
  await ensureNewsItem({
    venueId: venue1.id,
    title: "Вечер живой музыки по пятницам",
    content: "Джаз и ужин с 19:00. Бронь столика по телефону.",
    publishedAt: new Date(now - day * 3),
  });
  await ensureNewsItem({
    venueId: venue1.id,
    title: "Дегустация вина и сыра",
    content: "Каждое последнее воскресенье месяца — сет из 5 позиций.",
    publishedAt: new Date(now - day * 4),
  });
  await ensureNewsItem({
    venueId: venue1.id,
    title: "Доставка бесплатно от 2000 ₽",
    content: "По зоне в пределах МКАД при заказе от суммы на сайте.",
    publishedAt: new Date(now - day * 5),
  });

  await ensureNewsItem({
    venueId: venue2.id,
    title: "Новый десерт недели",
    content: "Попробуйте наш чизкейк с ягодным соусом.",
    publishedAt: new Date(now - day * 1),
  });
  await ensureNewsItem({
    venueId: venue2.id,
    title: "Комбо: бургер + картофель + напиток",
    content: "Выгода 15% на буднях с 11:00 до 15:00.",
    publishedAt: new Date(now - day * 2),
  });
  await ensureNewsItem({
    venueId: venue2.id,
    title: "Детское меню с подарком",
    content: "Закажите детский набор — раскраска в подарок.",
    publishedAt: new Date(now - day * 3),
  });

  await ensureNewsItem({
    venueId: null,
    title: "Сеть Restaurant: бонусная программа",
    content: "Копите баллы за заказы в любом нашем заведении города.",
    publishedAt: new Date(now - day * 0),
  });
  await ensureNewsItem({
    venueId: null,
    title: "Заказывайте через сайт — быстрее на кухню",
    content: "Статус заказа и история в личном кабинете (скоро).",
    publishedAt: new Date(now - day * 6),
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
