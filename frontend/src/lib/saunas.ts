export interface Sauna {
  id: string;
  name: string;
  type: "russian" | "finnish" | "hamam";
  typeLabel: string;
  size: "small" | "large";
  sizeLabel: string;
  description: string;
  pool?: string;
  amenities: string[];
  extras: string[];
  image: string;
}

export interface SaunaComplex {
  id: string;
  name: string;
  address: string;
  phone: string;
  categories?: {
    id: string;
    name: string;
    saunas: Sauna[];
  }[];
  saunas?: Sauna[];
}

// Семейная сауна в 9-м комплексе
const familySaunas9: Sauna[] = [
  {
    id: "family-1",
    name: "Сауна №1",
    type: "finnish",
    typeLabel: "Финская сауна",
    size: "small",
    sizeLabel: "С джакузи",
    description: "Уютная финская сауна с джакузи. Идеальный вариант для семейного отдыха в комфортной обстановке.",
    amenities: [
      "Комната отдыха",
      "Сауна",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "family-2",
    name: "Русская сауна №2",
    type: "russian",
    typeLabel: "Русская сауна",
    size: "small",
    sizeLabel: "Малый зал",
    description: "Русская сауна с бассейном 3×4 м. Просторная комната отдыха и все удобства для комфортного отдыха.",
    pool: "3×4 м",
    amenities: [
      "Комната отдыха",
      "Сауна",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "family-3",
    name: "Русская сауна №3",
    type: "russian",
    typeLabel: "Русская сауна",
    size: "small",
    sizeLabel: "Малый зал",
    description: "Классическая русская сауна с бассейном. Комфортная атмосфера для семейного отдыха.",
    pool: "3×4 м",
    amenities: [
      "Комната отдыха",
      "Сауна",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "family-4",
    name: "Турецкий хамам №4",
    type: "hamam",
    typeLabel: "Турецкий хамам",
    size: "small",
    sizeLabel: "Малый зал",
    description: "Настоящий турецкий хамам с бассейном. Погрузитесь в атмосферу восточной бани.",
    pool: "3×4 м",
    amenities: [
      "Комната отдыха",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "family-5",
    name: "Турецкий хамам №5",
    type: "hamam",
    typeLabel: "Турецкий хамам",
    size: "large",
    sizeLabel: "Большой зал",
    description: "Просторный турецкий хамам с большим бассейном. Подойдёт для большой компании.",
    pool: "3×4 м",
    amenities: [
      "Комната отдыха",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "family-6",
    name: "Русская сауна №6",
    type: "russian",
    typeLabel: "Русская сауна",
    size: "large",
    sizeLabel: "Большой зал",
    description: "Большой зал русской сауны с бассейном. Отличный выбор для групповых посещений.",
    pool: "3×4 м",
    amenities: [
      "Комната отдыха",
      "Сауна",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "family-7",
    name: "Русская сауна №7",
    type: "russian",
    typeLabel: "Русская сауна",
    size: "large",
    sizeLabel: "Большой зал",
    description: "Просторная русская сауна с бассейном для большой компании. Максимальный комфорт и отдых.",
    pool: "3×4 м",
    amenities: [
      "Комната отдыха",
      "Сауна",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
];

// Обычные сауны в 9-м комплексе
const regularSaunas9: Sauna[] = [
  {
    id: "regular-1",
    name: "Русская сауна №1",
    type: "russian",
    typeLabel: "Русская сауна",
    size: "small",
    sizeLabel: "Малый зал",
    description: "Русская сауна с бассейном 2×3 м и двумя комнатами отдыха. Полный набор удобств.",
    pool: "2×3 м",
    amenities: [
      "Бассейн (2×3 м)",
      "2 комнаты отдыха",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "regular-2",
    name: "Финская сауна №2",
    type: "finnish",
    typeLabel: "Финская сауна",
    size: "large",
    sizeLabel: "Большой зал",
    description: "Финская сауна с большим бассейном 3×4,5 м. Просторное помещение для комфортного отдыха.",
    pool: "3×4,5 м",
    amenities: [
      "Комната отдыха",
      "Бассейн (3×4,5 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "regular-3",
    name: "Турецкий хамам №3",
    type: "hamam",
    typeLabel: "Турецкий хамам",
    size: "large",
    sizeLabel: "Большой зал",
    description: "Турецкий хамам с бассейном 3×4 м. Восточная атмосфера и полный релакс.",
    pool: "3×4 м",
    amenities: [
      "Комната отдыха",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "regular-4",
    name: "Русская сауна №4",
    type: "russian",
    typeLabel: "Русская сауна",
    size: "small",
    sizeLabel: "Малый зал",
    description: "Уютная русская сауна с бассейном и двумя комнатами отдыха.",
    pool: "3×4 м",
    amenities: [
      "Бассейн (3×4 м)",
      "2 комнаты отдыха",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
];

// Сауны в 50-м комплексе
const saunas50: Sauna[] = [
  {
    id: "50-1",
    name: "Сауна №1",
    type: "finnish",
    typeLabel: "Финская сауна",
    size: "small",
    sizeLabel: "Малый зал",
    description: "Компактная и уютная сауна с бассейном 2×3 м. Идеально для небольшой компании.",
    pool: "2×3 м",
    amenities: [
      "Комната отдыха",
      "Бассейн (2×3 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Микроволновая печь",
      "Электрический чайник",
      "Тёплый пол",
    ],
    extras: ["Мангал и шашлычный двор", "Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "50-2",
    name: "Сауна №2",
    type: "finnish",
    typeLabel: "Финская сауна",
    size: "small",
    sizeLabel: "Малый зал",
    description: "Сауна с бассейном и тёплой шашлычной. Уютная атмосфера для отдыха.",
    pool: "2×3 м",
    amenities: [
      "Комната отдыха",
      "Бассейн (2×3 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Тёплая шашлычная",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Уютный двор с мангалом", "Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "50-3",
    name: "Сауна №3",
    type: "finnish",
    typeLabel: "Финская сауна",
    size: "large",
    sizeLabel: "Большой зал",
    description: "Просторная сауна с большим бассейном 3×4 м и двумя комнатами отдыха.",
    pool: "3×4 м",
    amenities: [
      "2 комнаты отдыха",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Микроволновая печь",
      "Электрический чайник",
      "Тёплый пол",
    ],
    extras: ["Мангал и шашлычный двор", "Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
  {
    id: "50-4",
    name: "Сауна №4",
    type: "finnish",
    typeLabel: "Финская сауна",
    size: "large",
    sizeLabel: "Большой зал",
    description: "Большой зал для больших компаний. Бассейн 3×4 м, две комнаты отдыха и мангал.",
    pool: "3×4 м",
    amenities: [
      "2 комнаты отдыха",
      "Бассейн (3×4 м)",
      "Гостиная с обеденным столом",
      "Wi-Fi",
      "Спутниковое TV (ЖК)",
      "Электрический чайник",
      "Тёплый пол",
      "Микроволновая печь",
    ],
    extras: ["Мангал и шашлычный двор", "Массажное кресло"],
    image: "/images/sauna-placeholder.jpg",
  },
];

export const complex9: SaunaComplex = {
  id: "complex-9",
  name: "Сауна 9 комплекс",
  address: "пр. Мира, д. 9/04А",
  phone: "+7 (927) 465-1000",
  categories: [
    {
      id: "family",
      name: "Семейная сауна",
      saunas: familySaunas9,
    },
    {
      id: "regular",
      name: "Обычная сауна",
      saunas: regularSaunas9,
    },
  ],
};

export const complex50: SaunaComplex = {
  id: "complex-50",
  name: "Сауна 50 комплекс",
  address: "ул. Нижняя Боровецкая, 20",
  phone: "+7 (8552) 784 000",
  saunas: saunas50,
};

export const promotions = [
  {
    id: "promo-1",
    title: "Сауны от 800 ₽",
    description: "С понедельника по пятницу с 9:00 до 15:00",
    note: "Кроме предпраздничных и праздничных выходных",
    icon: "flame",
  },
  {
    id: "promo-2",
    title: "Подарочные карты",
    description: "Карта на 3 000 ₽ и 5 000 ₽",
    note: "Уточняйте у администраторов",
    icon: "gift",
  },
  {
    id: "promo-3",
    title: "Скидка 10% в день рождения!",
    description: "Скидка действует 3 дня до и 3 дня после",
    note: "При предъявлении документа, удостоверяющего личность",
    icon: "cake",
  },
];

export function getSaunaById(complexId: string, categoryId: string | null, saunaId: string): Sauna | undefined {
  if (complexId === "complex-9" && categoryId) {
    const category = complex9.categories?.find((c) => c.id === categoryId);
    return category?.saunas.find((s) => s.id === saunaId);
  }
  if (complexId === "complex-50") {
    return complex50.saunas?.find((s) => s.id === saunaId);
  }
  return undefined;
}
