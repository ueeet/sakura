export interface Staff {
  id: number;
  name: string;
  role: string;
  experience: number;
  photo: string | null;
  description: string | null;
  isActive: boolean;
  schedule: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  clientName: string;
  phone: string;
  date: string;
  time: string;
  comment: string | null;
  status: "new" | "confirmed" | "cancelled" | "completed";
  staffId: number;
  serviceId: number;
  staff: Staff;
  service: Service;
  smsSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioWork {
  id: number;
  title: string;
  description: string | null;
  beforePhoto: string | null;
  afterPhoto: string | null;
  category: string | null;
  staffId: number;
  staff: Staff;
  createdAt: string;
}

export interface Review {
  id: number;
  authorName: string;
  text: string;
  rating: number;
  source: "site" | "2gis" | "yandex";
  sourceId: string | null;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: number;
  companyName: string;
  phone: string;
  address: string;
  workingHours: Record<string, unknown> | null;
  telegramChatId: string;
  smsEnabled: boolean;
  updatedAt: string;
}

export interface Stats {
  bookings: { total: number; new: number; confirmed: number };
  staff: number;
  services: number;
  portfolio: number;
  reviews: { total: number; pending: number };
}
