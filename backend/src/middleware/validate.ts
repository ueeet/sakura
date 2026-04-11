import { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";

// Маппинг полей в человекочитаемые названия для сообщений об ошибках
const FIELD_LABELS: Record<string, string> = {
  clientName: "Имя",
  phone: "Телефон",
  startAt: "Время начала",
  endAt: "Время окончания",
  guests: "Количество гостей",
  comment: "Комментарий",
  branchId: "Филиал",
  saunaId: "Сауна",
  totalPrice: "Сумма",
  paymentType: "Тип оплаты",
  login: "Логин",
  password: "Пароль",
  refreshToken: "Refresh-токен",
  email: "Email",
  name: "Название",
  slug: "Слаг",
  address: "Адрес",
  latitude: "Широта",
  longitude: "Долгота",
  type: "Тип",
  capacity: "Вместимость",
  pricePerHour: "Цена за час",
  dayType: "Тип дня",
  timeSlot: "Временной слот",
  rating: "Рейтинг",
  authorName: "Имя автора",
  text: "Текст",
};

function fieldLabel(path: string): string {
  if (!path) return "Поле";
  const last = path.split(".").pop() || path;
  return FIELD_LABELS[last] || last;
}

function humanizeIssue(issue: z.core.$ZodIssue): string {
  const label = fieldLabel(issue.path.join("."));
  const code = issue.code;

  // Обязательные / отсутствующие
  if (code === "invalid_type") {
    return `${label} — обязательное поле`;
  }
  // Слишком короткое / маленькое
  if (code === "too_small") {
    if ("minimum" in issue && issue.minimum === 1) {
      return `${label} — обязательное поле`;
    }
    return `${label}: значение слишком маленькое`;
  }
  // Слишком большое
  if (code === "too_big") {
    return `${label}: значение слишком большое`;
  }
  // Неверное значение из перечисления
  if (code === "invalid_value") {
    return `${label}: недопустимое значение`;
  }
  // Неверный формат
  if (code === "invalid_format") {
    return `${label}: неверный формат`;
  }
  // Дефолт — используем сообщение из схемы или общее
  return issue.message ? `${label}: ${issue.message}` : `${label}: ошибка`;
}

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map(humanizeIssue);
      res.status(400).json({
        error: messages.join("; "),
        details: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
