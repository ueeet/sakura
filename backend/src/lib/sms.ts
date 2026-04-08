import axios from "axios";
import logger from "./logger";

async function sendSms(phone: string, message: string) {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) return;

  try {
    await axios.get("https://sms.ru/sms/send", {
      params: {
        api_id: apiKey,
        to: phone.replace(/^\+/, ""),
        msg: message,
        json: 1,
        from: process.env.SMS_SENDER || undefined,
      },
    });
    logger.info({ phone }, "SMS sent");
  } catch (err) {
    logger.error(err, "SMS send error");
  }
}

export function sendBookingCreatedSms(phone: string, name: string) {
  sendSms(phone, `${name}, ваша заявка принята! Мы свяжемся с вами для подтверждения.`);
}

export function sendBookingConfirmedSms(phone: string, name: string, date: string, time: string) {
  sendSms(phone, `${name}, ваша запись подтверждена на ${date} в ${time}. Ждём вас!`);
}

export function sendBookingCancelledSms(phone: string, name: string) {
  sendSms(phone, `${name}, ваша запись была отменена. Если это ошибка — свяжитесь с нами.`);
}
