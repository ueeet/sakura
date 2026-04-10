import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./prismaClient";

async function main() {
  console.log("🌱 Seeding database...");

  // ========== Admin ==========
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.admin.create({ data: { login: "admin", passwordHash } });
    console.log("✅ Admin created (login: admin / password: admin123)");
  } else {
    console.log("⏭  Admin exists, skipped");
  }

  // ========== Settings ==========
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "Сакура",
      mainPhone: "+7 (8552) 782-000",
      email: "info@sauna-chelny.com",
      vk: "https://vk.com/sauna_sakura",
    },
  });
  console.log("✅ Settings initialized");

  // ========== Branches ==========
  const branch9 = await prisma.branch.upsert({
    where: { slug: "complex-9" },
    update: {},
    create: {
      slug: "complex-9",
      name: "Сауна 9 комплекс",
      address: "пр. Мира, д. 9/04А",
      phone: "+7 (927) 465-1000",
      description: "Сауны в Новом городе с категориями: Семейные и Обычные. Бассейны, мангал, банкеты.",
      latitude: 55.7387,
      longitude: 52.4063,
      sortOrder: 1,
    },
  });
  const branch50 = await prisma.branch.upsert({
    where: { slug: "complex-50" },
    update: {},
    create: {
      slug: "complex-50",
      name: "Сауна 50 комплекс",
      address: "ул. Нижняя Боровецкая, 20",
      phone: "+7 (8552) 784 000",
      description: "Финские сауны с бассейнами и шашлычной зоной.",
      latitude: 55.7019,
      longitude: 52.3550,
      sortOrder: 2,
    },
  });
  console.log("✅ 2 branches seeded");

  // ========== SaunaCategory (только для complex-9) ==========
  const familyCat = await prisma.saunaCategory.upsert({
    where: { branchId_slug: { branchId: branch9.id, slug: "family" } },
    update: {},
    create: {
      slug: "family",
      name: "Семейная сауна",
      branchId: branch9.id,
      sortOrder: 1,
    },
  });
  const regularCat = await prisma.saunaCategory.upsert({
    where: { branchId_slug: { branchId: branch9.id, slug: "regular" } },
    update: {},
    create: {
      slug: "regular",
      name: "Обычная сауна",
      branchId: branch9.id,
      sortOrder: 2,
    },
  });
  console.log("✅ 2 categories seeded");

  // ========== Saunas ==========
  const baseAmenities = [
    "Комната отдыха",
    "Сауна",
    "Гостиная с обеденным столом",
    "Wi-Fi",
    "Спутниковое TV (ЖК)",
    "Электрический чайник",
    "Тёплый пол",
    "Микроволновая печь",
  ];

  // Семейная категория, complex-9
  const familySaunas = [
    {
      slug: "complex-9-family-1",
      name: "Сауна №1",
      type: "finnish",
      typeLabel: "Финская сауна",
      size: "small",
      sizeLabel: "С джакузи",
      description: "Уютная финская сауна с джакузи. Идеальный вариант для семейного отдыха в комфортной обстановке.",
      poolSize: null,
      mainImage: "/images/saunas/complex-9/family/1/2.webp",
      images: [
        "/images/saunas/complex-9/family/1/1.webp",
        "/images/saunas/complex-9/family/1/2.webp",
        "/images/saunas/complex-9/family/1/3.webp",
        "/images/saunas/complex-9/family/1/4.webp",
      ],
      amenities: baseAmenities,
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-family-2",
      name: "Русская сауна №2",
      type: "russian",
      typeLabel: "Русская сауна",
      size: "small",
      sizeLabel: "Малый зал",
      description: "Русская сауна с бассейном 3×4 м. Просторная комната отдыха и все удобства для комфортного отдыха.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/family/2/2.webp",
      images: [
        "/images/saunas/complex-9/family/2/1.webp",
        "/images/saunas/complex-9/family/2/2.webp",
        "/images/saunas/complex-9/family/2/3.webp",
        "/images/saunas/complex-9/family/2/4.webp",
      ],
      amenities: [...baseAmenities, "Бассейн (3×4 м)"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-family-3",
      name: "Русская сауна №3",
      type: "russian",
      typeLabel: "Русская сауна",
      size: "small",
      sizeLabel: "Малый зал",
      description: "Классическая русская сауна с бассейном. Комфортная атмосфера для семейного отдыха.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/family/3/3.webp",
      images: [
        "/images/saunas/complex-9/family/3/1.webp",
        "/images/saunas/complex-9/family/3/2.webp",
        "/images/saunas/complex-9/family/3/3.webp",
        "/images/saunas/complex-9/family/3/4.webp",
      ],
      amenities: [...baseAmenities, "Бассейн (3×4 м)"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-family-4",
      name: "Турецкий хамам №4",
      type: "hamam",
      typeLabel: "Турецкий хамам",
      size: "small",
      sizeLabel: "Малый зал",
      description: "Настоящий турецкий хамам с бассейном. Погрузитесь в атмосферу восточной бани.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/family/4/1.webp",
      images: [
        "/images/saunas/complex-9/family/4/1.webp",
        "/images/saunas/complex-9/family/4/2.webp",
        "/images/saunas/complex-9/family/4/3.webp",
        "/images/saunas/complex-9/family/4/4.webp",
      ],
      amenities: ["Комната отдыха", "Бассейн (3×4 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-family-5",
      name: "Турецкий хамам №5",
      type: "hamam",
      typeLabel: "Турецкий хамам",
      size: "large",
      sizeLabel: "Большой зал",
      description: "Просторный турецкий хамам с большим бассейном. Подойдёт для большой компании.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/family/5/1.webp",
      images: [
        "/images/saunas/complex-9/family/5/1.webp",
        "/images/saunas/complex-9/family/5/2.webp",
        "/images/saunas/complex-9/family/5/3.webp",
        "/images/saunas/complex-9/family/5/4.webp",
      ],
      amenities: ["Комната отдыха", "Бассейн (3×4 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-family-6",
      name: "Русская сауна №6",
      type: "russian",
      typeLabel: "Русская сауна",
      size: "large",
      sizeLabel: "Большой зал",
      description: "Большой зал русской сауны с бассейном. Отличный выбор для групповых посещений.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/family/6/1.webp",
      images: [
        "/images/saunas/complex-9/family/6/1.webp",
        "/images/saunas/complex-9/family/6/2.webp",
        "/images/saunas/complex-9/family/6/3.webp",
        "/images/saunas/complex-9/family/6/4.webp",
      ],
      amenities: [...baseAmenities.filter(a => a !== "Электрический чайник"), "Бассейн (3×4 м)"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-family-7",
      name: "Русская сауна №7",
      type: "russian",
      typeLabel: "Русская сауна",
      size: "large",
      sizeLabel: "Большой зал",
      description: "Просторная русская сауна с бассейном для большой компании. Максимальный комфорт и отдых.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/family/7/1.webp",
      images: [
        "/images/saunas/complex-9/family/7/1.webp",
        "/images/saunas/complex-9/family/7/2.webp",
        "/images/saunas/complex-9/family/7/3.webp",
        "/images/saunas/complex-9/family/7/4.webp",
      ],
      amenities: [...baseAmenities, "Бассейн (3×4 м)"],
      extras: ["Массажное кресло"],
    },
  ];

  // Обычная категория, complex-9
  const regularSaunas = [
    {
      slug: "complex-9-regular-1",
      name: "Русская сауна №1",
      type: "russian",
      typeLabel: "Русская сауна",
      size: "small",
      sizeLabel: "Малый зал",
      description: "Русская сауна с бассейном 2×3 м и двумя комнатами отдыха. Полный набор удобств.",
      poolSize: "2×3 м",
      mainImage: "/images/saunas/complex-9/regular/1/1.webp",
      images: [
        "/images/saunas/complex-9/regular/1/1.webp",
        "/images/saunas/complex-9/regular/1/2.webp",
        "/images/saunas/complex-9/regular/1/3.webp",
        "/images/saunas/complex-9/regular/1/4.webp",
      ],
      amenities: ["Бассейн (2×3 м)", "2 комнаты отдыха", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-regular-2",
      name: "Финская сауна №2",
      type: "finnish",
      typeLabel: "Финская сауна",
      size: "large",
      sizeLabel: "Большой зал",
      description: "Финская сауна с большим бассейном 3×4,5 м. Просторное помещение для комфортного отдыха.",
      poolSize: "3×4,5 м",
      mainImage: "/images/saunas/complex-9/regular/2/1.webp",
      images: [
        "/images/saunas/complex-9/regular/2/1.webp",
        "/images/saunas/complex-9/regular/2/2.webp",
        "/images/saunas/complex-9/regular/2/3.webp",
        "/images/saunas/complex-9/regular/2/4.webp",
      ],
      amenities: ["Комната отдыха", "Бассейн (3×4,5 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-regular-3",
      name: "Турецкий хамам №3",
      type: "hamam",
      typeLabel: "Турецкий хамам",
      size: "large",
      sizeLabel: "Большой зал",
      description: "Турецкий хамам с бассейном 3×4 м. Восточная атмосфера и полный релакс.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/regular/3/1.webp",
      images: [
        "/images/saunas/complex-9/regular/3/1.webp",
        "/images/saunas/complex-9/regular/3/2.webp",
        "/images/saunas/complex-9/regular/3/3.webp",
        "/images/saunas/complex-9/regular/3/4.webp",
      ],
      amenities: ["Комната отдыха", "Бассейн (3×4 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Массажное кресло"],
    },
    {
      slug: "complex-9-regular-4",
      name: "Русская сауна №4",
      type: "russian",
      typeLabel: "Русская сауна",
      size: "small",
      sizeLabel: "Малый зал",
      description: "Уютная русская сауна с бассейном и двумя комнатами отдыха.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-9/regular/4/1.webp",
      images: [
        "/images/saunas/complex-9/regular/4/1.webp",
        "/images/saunas/complex-9/regular/4/2.webp",
        "/images/saunas/complex-9/regular/4/3.webp",
        "/images/saunas/complex-9/regular/4/4.webp",
      ],
      amenities: ["Бассейн (3×4 м)", "2 комнаты отдыха", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Массажное кресло"],
    },
  ];

  // Сауны 50-го комплекса (без категорий)
  const saunas50 = [
    {
      slug: "complex-50-1",
      name: "Сауна №1",
      type: "finnish",
      typeLabel: "Финская сауна",
      size: "small",
      sizeLabel: "Малый зал",
      description: "Компактная и уютная сауна с бассейном 2×3 м. Идеально для небольшой компании.",
      poolSize: "2×3 м",
      mainImage: "/images/saunas/complex-50/1/1.webp",
      images: [
        "/images/saunas/complex-50/1/1.webp",
        "/images/saunas/complex-50/1/2.webp",
        "/images/saunas/complex-50/1/3.webp",
        "/images/saunas/complex-50/1/4.webp",
      ],
      amenities: ["Комната отдыха", "Бассейн (2×3 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Микроволновая печь", "Электрический чайник", "Тёплый пол"],
      extras: ["Мангал и шашлычный двор", "Массажное кресло"],
    },
    {
      slug: "complex-50-2",
      name: "Сауна №2",
      type: "finnish",
      typeLabel: "Финская сауна",
      size: "small",
      sizeLabel: "Малый зал",
      description: "Сауна с бассейном и тёплой шашлычной. Уютная атмосфера для отдыха.",
      poolSize: "2×3 м",
      mainImage: "/images/saunas/complex-50/2/1.webp",
      images: [
        "/images/saunas/complex-50/2/1.webp",
        "/images/saunas/complex-50/2/2.webp",
        "/images/saunas/complex-50/2/3.webp",
        "/images/saunas/complex-50/2/4.webp",
      ],
      amenities: ["Комната отдыха", "Бассейн (2×3 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Тёплая шашлычная", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Уютный двор с мангалом", "Массажное кресло"],
    },
    {
      slug: "complex-50-3",
      name: "Сауна №3",
      type: "finnish",
      typeLabel: "Финская сауна",
      size: "large",
      sizeLabel: "Большой зал",
      description: "Просторная сауна с большим бассейном 3×4 м и двумя комнатами отдыха.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-50/3/1.webp",
      images: [
        "/images/saunas/complex-50/3/1.webp",
        "/images/saunas/complex-50/3/2.webp",
        "/images/saunas/complex-50/3/3.webp",
        "/images/saunas/complex-50/3/4.webp",
      ],
      amenities: ["2 комнаты отдыха", "Бассейн (3×4 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Микроволновая печь", "Электрический чайник", "Тёплый пол"],
      extras: ["Мангал и шашлычный двор", "Массажное кресло"],
    },
    {
      slug: "complex-50-4",
      name: "Сауна №4",
      type: "finnish",
      typeLabel: "Финская сауна",
      size: "large",
      sizeLabel: "Большой зал",
      description: "Большой зал для больших компаний. Бассейн 3×4 м, две комнаты отдыха и мангал.",
      poolSize: "3×4 м",
      mainImage: "/images/saunas/complex-50/4/1.webp",
      images: [
        "/images/saunas/complex-50/4/1.webp",
        "/images/saunas/complex-50/4/2.webp",
        "/images/saunas/complex-50/4/3.webp",
        "/images/saunas/complex-50/4/4.webp",
      ],
      amenities: ["2 комнаты отдыха", "Бассейн (3×4 м)", "Гостиная с обеденным столом", "Wi-Fi", "Спутниковое TV (ЖК)", "Электрический чайник", "Тёплый пол", "Микроволновая печь"],
      extras: ["Мангал и шашлычный двор", "Массажное кресло"],
    },
  ];

  // Чистим старые сауны (если они были от предыдущих сидов)
  await prisma.sauna.deleteMany({});

  // Создаём сауны
  let order = 0;
  for (const s of familySaunas) {
    await prisma.sauna.create({
      data: {
        ...s,
        capacity: s.size === "large" ? 12 : 6,
        cleaningMinutes: s.type === "hamam" ? 90 : 60,
        minHours: 2,
        branchId: branch9.id,
        categoryId: familyCat.id,
        sortOrder: order++,
        hasBBQ: false,
      },
    });
  }
  for (const s of regularSaunas) {
    await prisma.sauna.create({
      data: {
        ...s,
        capacity: s.size === "large" ? 12 : 6,
        cleaningMinutes: s.type === "hamam" ? 90 : 60,
        minHours: 2,
        branchId: branch9.id,
        categoryId: regularCat.id,
        sortOrder: order++,
        hasBBQ: false,
      },
    });
  }
  for (const s of saunas50) {
    await prisma.sauna.create({
      data: {
        ...s,
        capacity: s.size === "large" ? 12 : 6,
        cleaningMinutes: 60,
        minHours: 2,
        branchId: branch50.id,
        categoryId: null,
        sortOrder: order++,
        hasBBQ: s.extras.some((e: string) => e.toLowerCase().includes("мангал")),
      },
    });
  }
  console.log(`✅ ${familySaunas.length + regularSaunas.length + saunas50.length} saunas seeded`);

  // ========== Price slots (универсальные для всех саун) ==========
  const allSaunas = await prisma.sauna.findMany({ select: { id: true, type: true, size: true } });
  await prisma.priceSlot.deleteMany({});

  for (const sauna of allSaunas) {
    const basePrice = sauna.type === "hamam" ? 1500 : sauna.size === "large" ? 1200 : 800;
    const slots = [
      { dayType: "weekday", timeSlot: "day", price: basePrice },
      { dayType: "weekday", timeSlot: "evening", price: Math.round(basePrice * 1.3) },
      { dayType: "weekday", timeSlot: "night", price: Math.round(basePrice * 1.1) },
      { dayType: "weekend", timeSlot: "day", price: Math.round(basePrice * 1.2) },
      { dayType: "weekend", timeSlot: "evening", price: Math.round(basePrice * 1.5) },
      { dayType: "weekend", timeSlot: "night", price: Math.round(basePrice * 1.3) },
    ];
    for (const s of slots) {
      await prisma.priceSlot.create({
        data: {
          saunaId: sauna.id,
          dayType: s.dayType,
          timeSlot: s.timeSlot,
          pricePerHour: s.price,
          minHours: 2,
        },
      });
    }
  }
  console.log(`✅ ${allSaunas.length * 6} price slots seeded`);

  // ========== Promotions ==========
  await prisma.promotion.deleteMany({});
  await prisma.promotion.createMany({
    data: [
      {
        slug: "promo-1",
        title: "Сауны от 800 ₽",
        description: "С понедельника по пятницу с 9:00 до 15:00",
        note: "Кроме предпраздничных и праздничных выходных",
        icon: "flame",
        sortOrder: 1,
      },
      {
        slug: "promo-2",
        title: "Подарочные карты",
        description: "Карта на 3 000 ₽ и 5 000 ₽",
        note: "Уточняйте у администраторов",
        icon: "gift",
        sortOrder: 2,
      },
      {
        slug: "promo-3",
        title: "Скидка 10% в день рождения!",
        description: "Скидка действует 3 дня до и 3 дня после",
        note: "При предъявлении документа, удостоверяющего личность",
        icon: "cake",
        discount: 10,
        sortOrder: 3,
      },
    ],
  });
  console.log("✅ 3 promotions seeded");

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => process.exit(0));
