import { z } from "zod/v4";

export const loginSchema = z.object({
  login: z.string().min(1, "Логин обязателен"),
  password: z.string().min(1, "Пароль обязателен"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh токен обязателен"),
});

// Staff
export const createStaffSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  role: z.string().min(1, "Роль обязательна"),
  experience: z.number().int().min(0).optional(),
  photo: z.string().optional(),
  description: z.string().optional(),
  schedule: z.record(z.unknown()).optional(),
});

export const updateStaffSchema = createStaffSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Services
export const createServiceSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  price: z.number().int().min(0, "Цена не может быть отрицательной"),
  duration: z.number().int().min(1).optional(),
  category: z.string().optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Bookings
export const createBookingSchema = z.object({
  clientName: z.string().min(1, "Имя обязательно"),
  phone: z.string().min(5, "Телефон обязателен"),
  date: z.string().min(1, "Дата обязательна"),
  time: z.string().min(1, "Время обязательно"),
  comment: z.string().optional(),
  staffId: z.number().int().min(1),
  serviceId: z.number().int().min(1),
});

export const updateBookingSchema = z.object({
  status: z.enum(["new", "confirmed", "cancelled", "completed"]).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  comment: z.string().optional(),
  staffId: z.number().int().min(1).optional(),
  serviceId: z.number().int().min(1).optional(),
});

// Portfolio
export const createPortfolioSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  beforePhoto: z.string().optional(),
  afterPhoto: z.string().optional(),
  category: z.string().optional(),
  staffId: z.number().int().min(1),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

// Reviews
export const updateReviewSchema = z.object({
  isApproved: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

// Settings
export const updateSettingsSchema = z.object({
  companyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  workingHours: z.record(z.unknown()).optional(),
  telegramChatId: z.string().optional(),
  smsEnabled: z.boolean().optional(),
});
