import { Telegraf } from "telegraf";
import logger from "./logger";
import prisma from "../prismaClient";
import { broadcast } from "./sse";

let bot: Telegraf | null = null;

export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    logger.warn("Telegram bot not configured");
    return;
  }

  bot = new Telegraf(token);

  bot.action(/^confirm_(\d+)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: "confirmed" },
      });
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.answerCbQuery("Подтверждено");
      broadcast("booking_updated", booking);
    } catch (err) {
      logger.error(err, "Telegram confirm error");
      await ctx.answerCbQuery("Ошибка");
    }
  });

  bot.action(/^reject_(\d+)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: "cancelled" },
      });
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.answerCbQuery("Отклонено");
      broadcast("booking_updated", booking);
    } catch (err) {
      logger.error(err, "Telegram reject error");
      await ctx.answerCbQuery("Ошибка");
    }
  });

  bot.launch({ dropPendingUpdates: true });
  logger.info("Telegram bot started");
}

export async function notifyNewBooking(booking: {
  id: number;
  clientName: string;
  phone: string;
  date: Date;
  time: string;
}) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId) return;

  const dateStr = new Date(booking.date).toLocaleDateString("ru-RU");
  const text = `Новая запись!\n\nИмя: ${booking.clientName}\nТелефон: ${booking.phone}\nДата: ${dateStr}\nВремя: ${booking.time}`;

  try {
    await bot.telegram.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [[
          { text: "Подтвердить", callback_data: `confirm_${booking.id}` },
          { text: "Отклонить", callback_data: `reject_${booking.id}` },
        ]],
      },
    });
  } catch (err) {
    logger.error(err, "Telegram notification error");
  }
}
