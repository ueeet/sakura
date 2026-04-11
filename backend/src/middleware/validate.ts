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

// Если сообщение содержит кириллицу — оно задано вручную в схеме, используем как есть
function isCustomRussian(msg: string | undefined): boolean {
  return !!msg && /[А-Яа-яЁё]/.test(msg);
}

function humanizeIssue(issue: z.core.$ZodIssue): string {
  // 1. Сначала смотрим, есть ли кастомное русское сообщение в схеме
  if (isCustomRussian(issue.message)) {
    return issue.message;
  }

  const label = fieldLabel(issue.path.join("."));
  const code = issue.code;

  if (code === "invalid_type") {
    return `${label} — обязательное поле`;
  }
  if (code === "too_small") {
    if ("type" in issue && issue.type === "string") {
      if ("minimum" in issue && issue.minimum === 1) {
        return `${label} — обязательное поле`;
      }
      return `${label}: слишком короткое значение`;
    }
    return `${label}: значение слишком маленькое`;
  }
  if (code === "too_big") {
    return `${label}: значение слишком большое`;
  }
  if (code === "invalid_value") {
    return `${label}: недопустимое значение`;
  }
  if (code === "invalid_format") {
    return `${label}: неверный формат`;
  }
  return `${label}: ошибка`;
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
