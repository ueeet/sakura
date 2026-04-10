import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./prismaClient";

async function main() {
  console.log("🌱 Seeding database...");

  // ========== Admin ==========
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.admin.create({
      data: { login: "admin", passwordHash },
    });
    console.log("✅ Admin created (login: admin, password: admin123)");
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
      instagram: "",
    },
  });
  console.log("✅ Settings initialized");

  // ========== Branches ==========
  const branches = [
    {
      slug: "complex-9",
      name: "9-й комплекс (Новый город)",
      address: "пр-т Мира, 9/04А",
      phone: "+7 (8552) 782-000",
      description: "Сауны в Новом городе. Бассейны с подсветкой, мангальная зона, банкетный зал.",
      latitude: 55.7387,
      longitude: 52.4063,
      sortOrder: 1,
    },
    {
      slug: "complex-50",
      name: "50-й комплекс",
      address: "ул. Нижняя Боровецкая, 20",
      phone: "+7 (8552) 784-000",
      description: "Уютные сауны в спокойном районе. Хаммам, русская баня, бассейн.",
      latitude: 55.7019,
      longitude: 52.3550,
      sortOrder: 2,
    },
    {
      slug: "complex-62",
      name: "62-й комплекс",
      address: "пр-т Московский, ул. И. Утробина, 16А",
      phone: "+7 (8552) 783-000",
      description: "Просторные сауны с большим бассейном и зоной отдыха.",
      latitude: 55.7217,
      longitude: 52.4288,
      sortOrder: 3,
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { slug: branch.slug },
      update: branch,
      create: branch,
    });
  }
  console.log(`✅ ${branches.length} branches seeded`);

  const branch9 = await prisma.branch.findUnique({ where: { slug: "complex-9" } });
  const branch50 = await prisma.branch.findUnique({ where: { slug: "complex-50" } });
  if (!branch9 || !branch50) throw new Error("Branches not found after seed");

  // ========== Saunas ==========
  const saunas = [
    {
      slug: "russkaya-banya-1",
      name: "Русская баня №1",
      type: "russian",
      description: "Классическая русская баня на дровах. Просторная парная, бассейн с гейзером.",
      capacity: 8,
      area: 60,
      hasPool: true,
      hasBBQ: true,
      cleaningMinutes: 60,
      minHours: 2,
      branchId: branch9.id,
      sortOrder: 1,
    },
    {
      slug: "finskaya-1",
      name: "Финская сауна №1",
      type: "finnish",
      description: "Сухая финская сауна. Мини-бассейн, душ Шарко, комната отдыха.",
      capacity: 6,
      area: 45,
      hasPool: true,
      hasBBQ: false,
      cleaningMinutes: 60,
      minHours: 2,
      branchId: branch9.id,
      sortOrder: 2,
    },
    {
      slug: "hammam-1",
      name: "Хаммам №1",
      type: "hammam",
      description: "Турецкий хаммам с мраморным лежаком. Парения, скрабирование.",
      capacity: 4,
      area: 35,
      hasPool: false,
      hasBBQ: false,
      cleaningMinutes: 90,
      minHours: 2,
      branchId: branch50.id,
      sortOrder: 1,
    },
  ];

  for (const s of saunas) {
    await prisma.sauna.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`✅ ${saunas.length} saunas seeded`);

  // ========== Price slots ==========
  const russkaya = await prisma.sauna.findUnique({ where: { slug: "russkaya-banya-1" } });
  const finskaya = await prisma.sauna.findUnique({ where: { slug: "finskaya-1" } });
  const hammam = await prisma.sauna.findUnique({ where: { slug: "hammam-1" } });

  const priceData = [
    // Русская баня
    { saunaId: russkaya!.id, dayType: "weekday", timeSlot: "day", pricePerHour: 1000 },
    { saunaId: russkaya!.id, dayType: "weekday", timeSlot: "evening", pricePerHour: 1400 },
    { saunaId: russkaya!.id, dayType: "weekday", timeSlot: "night", pricePerHour: 1200 },
    { saunaId: russkaya!.id, dayType: "weekend", timeSlot: "day", pricePerHour: 1300 },
    { saunaId: russkaya!.id, dayType: "weekend", timeSlot: "evening", pricePerHour: 1700 },
    { saunaId: russkaya!.id, dayType: "weekend", timeSlot: "night", pricePerHour: 1500 },
    // Финская
    { saunaId: finskaya!.id, dayType: "weekday", timeSlot: "day", pricePerHour: 800 },
    { saunaId: finskaya!.id, dayType: "weekday", timeSlot: "evening", pricePerHour: 1200 },
    { saunaId: finskaya!.id, dayType: "weekday", timeSlot: "night", pricePerHour: 1000 },
    { saunaId: finskaya!.id, dayType: "weekend", timeSlot: "day", pricePerHour: 1100 },
    { saunaId: finskaya!.id, dayType: "weekend", timeSlot: "evening", pricePerHour: 1500 },
    { saunaId: finskaya!.id, dayType: "weekend", timeSlot: "night", pricePerHour: 1300 },
    // Хаммам
    { saunaId: hammam!.id, dayType: "weekday", timeSlot: "day", pricePerHour: 1500 },
    { saunaId: hammam!.id, dayType: "weekday", timeSlot: "evening", pricePerHour: 1900 },
    { saunaId: hammam!.id, dayType: "weekday", timeSlot: "night", pricePerHour: 1700 },
    { saunaId: hammam!.id, dayType: "weekend", timeSlot: "day", pricePerHour: 1800 },
    { saunaId: hammam!.id, dayType: "weekend", timeSlot: "evening", pricePerHour: 2200 },
    { saunaId: hammam!.id, dayType: "weekend", timeSlot: "night", pricePerHour: 2000 },
  ];

  for (const p of priceData) {
    await prisma.priceSlot.upsert({
      where: {
        saunaId_dayType_timeSlot: {
          saunaId: p.saunaId,
          dayType: p.dayType,
          timeSlot: p.timeSlot,
        },
      },
      update: { pricePerHour: p.pricePerHour },
      create: p,
    });
  }
  console.log(`✅ ${priceData.length} price slots seeded`);

  // ========== Amenities ==========
  const amenities = [
    { saunaId: russkaya!.id, name: "Бассейн с гейзером", icon: "waves" },
    { saunaId: russkaya!.id, name: "Мангальная зона", icon: "flame" },
    { saunaId: russkaya!.id, name: "Комната отдыха", icon: "armchair" },
    { saunaId: russkaya!.id, name: "Караоке", icon: "mic" },
    { saunaId: finskaya!.id, name: "Мини-бассейн", icon: "waves" },
    { saunaId: finskaya!.id, name: "Душ Шарко", icon: "shower-head" },
    { saunaId: hammam!.id, name: "Мраморный лежак", icon: "bed" },
    { saunaId: hammam!.id, name: "Скрабирование", icon: "sparkles" },
  ];

  // Сначала чистим, чтобы не было дублей при повторном запуске
  await prisma.saunaAmenity.deleteMany({
    where: { saunaId: { in: [russkaya!.id, finskaya!.id, hammam!.id] } },
  });
  for (const a of amenities) {
    await prisma.saunaAmenity.create({ data: a });
  }
  console.log(`✅ ${amenities.length} amenities seeded`);

  // ========== Promotions ==========
  await prisma.promotion.upsert({
    where: { slug: "birthday-discount" },
    update: {},
    create: {
      slug: "birthday-discount",
      title: "Скидка 10% в день рождения",
      description: "Именинникам — скидка 10% на любую сауну. При себе иметь паспорт.",
      discount: 10,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      sortOrder: 1,
    },
  });
  await prisma.promotion.upsert({
    where: { slug: "weekday-special" },
    update: {},
    create: {
      slug: "weekday-special",
      title: "Спеццена в будни 9:00–15:00",
      description: "С понедельника по четверг с 9:00 до 15:00 — специальная цена на все сауны.",
      discount: 20,
      startDate: new Date("2026-01-01"),
      endDate: null,
      sortOrder: 2,
    },
  });
  console.log(`✅ 2 promotions seeded`);

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
