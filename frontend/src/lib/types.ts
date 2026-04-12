// ========== Branch ==========
export interface Branch {
  id: number;
  slug: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  latitude: number;
  longitude: number;
  coverImage: string | null;
  tourUrl: string | null;
  workingHours: Record<string, unknown> | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BranchWithSaunas extends Branch {
  categories: Array<SaunaCategory & { saunas: Sauna[] }>;
  saunas: Sauna[];
}

// ========== SaunaCategory ==========
export interface SaunaCategory {
  id: number;
  slug: string;
  name: string;
  branchId: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ========== Sauna ==========
export type SaunaType = "russian" | "finnish" | "hamam";
export type SaunaSize = "small" | "large";

export interface Sauna {
  id: number;
  slug: string;
  name: string;
  type: SaunaType;
  typeLabel: string | null;
  size: SaunaSize | null;
  sizeLabel: string | null;
  description: string | null;
  capacity: number;
  area: number | null;
  poolSize: string | null;
  hasBBQ: boolean;
  mainImage: string | null;
  images: string[] | null;
  amenities: string[] | null;
  extras: string[] | null;
  isActive: boolean;
  sortOrder: number;
  cleaningMinutes: number;
  minHours: number;
  openHour: number;
  closeHour: number;
  depositPercent: number;
  branchId: number;
  categoryId: number | null;
  branch?: Pick<Branch, "id" | "slug" | "name">;
  category?: Pick<SaunaCategory, "id" | "slug" | "name"> | null;
  prices?: PriceSlot[];
  priceFrom?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ========== PriceSlot ==========
export type DayType = "weekday" | "weekend";
export type TimeSlot = "day" | "evening" | "night";

export interface PriceSlot {
  id: number;
  saunaId: number;
  dayType: DayType;
  timeSlot: TimeSlot;
  pricePerHour: number;
  minHours: number;
}

// ========== Promotion ==========
export interface Promotion {
  id: number;
  slug: string;
  title: string;
  description: string;
  note: string | null;
  icon: string | null;
  image: string | null;
  promoCode: string | null;
  discount: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ========== Booking ==========
export type BookingStatus = "pending_payment" | "new" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "deposit_paid" | "fully_paid" | "refunded";

export interface Booking {
  id: number;
  clientName: string;
  phone: string;
  startAt: string;
  endAt: string;
  guests: number;
  comment: string | null;
  status: BookingStatus;
  totalPrice: number | null;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  smsSent: boolean;
  branchId: number;
  saunaId: number;
  branch?: Branch;
  sauna?: Sauna;
  payments?: Payment[];
  payment?: Payment | null;          // возвращается в POST /bookings response
  createdAt: string;
  updatedAt: string;
}

// ========== Payment ==========
export type PaymentStatusType = "pending" | "succeeded" | "canceled";
export type PaymentType = "deposit" | "full";

export interface Payment {
  id: number;
  bookingId: number;
  provider: "mock" | "yookassa";
  externalId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  type: PaymentType;
  paymentMethod: string | null;
  confirmationUrl: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  refundedAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

// ========== Availability ==========
export interface OccupiedInterval {
  bookingId: number;
  start: string;
  end: string;
  cleaningEnd: string;
}

export interface AvailabilitySlot {
  hour: number;
  available: boolean;
  reason?: "booked" | "cleaning" | "closed";
}

export interface SaunaAvailability {
  date: string;
  saunaId: number;
  openHour: number;
  closeHour: number;
  minHours: number;
  cleaningMinutes: number;
  occupied: OccupiedInterval[];
  slots: AvailabilitySlot[];
}

// ========== Review ==========
export interface Review {
  id: number;
  authorName: string;
  text: string;
  rating: number;
  source: "site" | "2gis" | "yandex";
  sourceId: string | null;
  branchId: number | null;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== Settings ==========
export interface HomeSlide {
  image: string;
}

export interface Settings {
  id: number;
  companyName: string;
  mainPhone: string;
  email: string;
  vk: string;
  instagram: string;
  telegramChatId: string;
  smsEnabled: boolean;
  homeCarouselSlides: HomeSlide[];
  updatedAt: string;
}

// ========== Stats ==========
export interface Stats {
  bookings: { total: number; new: number; confirmed: number };
  branches: number;
  saunas: number;
  promotions: number;
  reviews: { total: number; pending: number };
}
