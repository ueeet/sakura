import { z } from "zod/v4";

// ========== Auth ==========
export const loginSchema = z.object({
  login: z.string().min(1, "Логин обязателен"),
  password: z.string().min(1, "Пароль обязателен"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh токен обязателен"),
});

// ========== Branch ==========
export const createBranchSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  coverImage: z.string().optional(),
  tourUrl: z.string().optional(),
  workingHours: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
});

export const updateBranchSchema = createBranchSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ========== SaunaCategory ==========
export const createCategorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  branchId: z.number().int().min(1),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ========== Sauna ==========
export const createSaunaSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["russian", "finnish", "hamam"]),
  typeLabel: z.string().optional(),
  size: z.enum(["small", "large"]).optional(),
  sizeLabel: z.string().optional(),
  description: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  area: z.number().optional(),
  poolSize: z.string().optional(),
  hasBBQ: z.boolean().optional(),
  mainImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
  cleaningMinutes: z.number().int().min(0).max(240).optional(),
  minHours: z.number().int().min(1).max(24).optional(),
  openHour: z.number().int().min(0).max(24).optional(),
  closeHour: z.number().int().min(0).max(24).optional(),
  branchId: z.number().int().min(1),
  categoryId: z.number().int().min(1).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateSaunaSchema = createSaunaSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ========== PriceSlot ==========
export const createPriceSlotSchema = z.object({
  saunaId: z.number().int().min(1),
  dayType: z.enum(["weekday", "weekend"]),
  timeSlot: z.enum(["day", "evening", "night"]),
  pricePerHour: z.number().int().min(0),
  minHours: z.number().int().min(1).optional(),
});

export const updatePriceSlotSchema = createPriceSlotSchema.partial();

// ========== Promotion ==========
export const createPromotionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  note: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  promoCode: z.string().optional(),
  discount: z.number().int().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ========== Booking ==========
export const createBookingSchema = z.object({
  clientName: z.string().min(2, "Введите ваше имя"),
  phone: z.string().min(10, "Введите телефон полностью"),
  startAt: z.string().min(1, "Укажите время начала"),
  endAt: z.string().min(1, "Укажите время окончания"),
  guests: z.number().int().min(1, "Минимум 1 гость").max(50).optional(),
  comment: z.string().optional(),
  branchId: z.number().int().min(1),
  saunaId: z.number().int().min(1),
  totalPrice: z.number().int().min(0).optional(),
  paymentType: z.enum(["deposit", "full"]).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(["new", "confirmed", "cancelled", "completed"]).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  guests: z.number().int().min(1).optional(),
  comment: z.string().optional(),
  totalPrice: z.number().int().min(0).optional(),
});

// ========== Review ==========
export const createReviewSchema = z.object({
  authorName: z.string().min(1),
  text: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  branchId: z.number().int().min(1).optional(),
});

export const publicReviewSchema = z.object({
  authorName: z.string().min(2).max(100),
  text: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5),
  branchId: z.number().int().min(1).optional(),
});

export const updateReviewSchema = z.object({
  isApproved: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

// ========== Settings ==========
export const homeSlideSchema = z.object({
  image: z.string().min(1, "Укажите фото"),
});

export const updateSettingsSchema = z.object({
  companyName: z.string().optional(),
  mainPhone: z.string().optional(),
  email: z.string().optional(),
  vk: z.string().optional(),
  instagram: z.string().optional(),
  telegramChatId: z.string().optional(),
  smsEnabled: z.boolean().optional(),
  homeCarouselSlides: z.array(homeSlideSchema).optional(),
});
