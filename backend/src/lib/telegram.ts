import { Telegraf } from "telegraf";
import logger from "./logger";
import prisma from "../prismaClient";
import { broadcast } from "./sse";
import { formatMoscowHuman } from "./timezone";

let bot: Telegraf | null = null;

export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn("Telegram bot token not set, skipping bot init");
    return;
  }

  bot = new Telegraf(token);

  // /start — приветствие + chat_id для настройки сервера
  bot.start(async (ctx) => {
    const chatId = ctx.chat.id;
    const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name || "";
    await ctx.reply(
      `Привет, ${username}!\n\n` +
        `Это бот уведомлений сети саун «Сакура».\n\n` +
        `🆔 Ваш chat_id: <code>${chatId}</code>\n\n` +
        `Чтобы получать уведомления о новых бронях, добавьте этот ID в переменную ` +
        `TELEGRAM_CHAT_ID на сервере и перезапустите бэкенд.`,
      { parse_mode: "HTML" },
    );
  });

  // /id — короткий способ узнать chat_id
  bot.command("id", async (ctx) => {
    await ctx.reply(`chat_id: <code>${ctx.chat.id}</code>`, { parse_mode: "HTML" });
  });

  // /help
  bot.help(async (ctx) => {
    await ctx.reply(
      "Команды:\n/start — приветствие и chat_id\n/id — узнать chat_id\n/help — помощь",
    );
  });

  // Подтверждение брони из inline-кнопки
  bot.action(/^confirm_(\d+)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: "confirmed" },
      });
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.answerCbQuery("✅ Подтверждено");
      broadcast("booking_updated", booking);
    } catch (err) {
      logger.error(err, "Telegram confirm error");
      await ctx.answerCbQuery("Ошибка");
    }
  });

  // Отклонение брони из inline-кнопки
  bot.action(/^reject_(\d+)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: "cancelled" },
      });
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      await ctx.answerCbQuery("❌ Отклонено");
      broadcast("booking_updated", booking);
    } catch (err) {
      logger.error(err, "Telegram reject error");
      await ctx.answerCbQuery("Ошибка");
    }
  });

  bot
    .launch({ dropPendingUpdates: true })
    .then(() => logger.info("Telegram bot launched successfully"))
    .catch((err) => logger.error({ err }, "Telegram bot launch error"));

  // Корректное завершение
  process.once("SIGINT", () => bot?.stop("SIGINT"));
  process.once("SIGTERM", () => bot?.stop("SIGTERM"));

  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    logger.warn(
      "Telegram bot started but TELEGRAM_CHAT_ID not set — notifications disabled. " +
        "Send /start to the bot to get your chat_id.",
    );
  } else {
    logger.info("Telegram bot ready (notifications enabled)");
  }
}

export async function notifyNewBooking(booking: {
  id: number;
  clientName: string;
  phone: string;
  startAt: Date;
  endAt: Date;
  guests?: number;
  totalPrice?: number | null;
  branch?: { name: string } | null;
  sauna?: { name: string } | null;
}) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId) return;

  const fmt = (d: Date) => formatMoscowHuman(d);

  const lines = [
    "🔔 <b>Новая бронь!</b>",
    "",
    `<b>Клиент:</b> ${booking.clientName}`,
    `<b>Телефон:</b> ${booking.phone}`,
    booking.branch && `<b>Филиал:</b> ${booking.branch.name}`,
    booking.sauna && `<b>Сауна:</b> ${booking.sauna.name}`,
    `<b>Начало:</b> ${fmt(booking.startAt)}`,
    `<b>Конец:</b> ${fmt(booking.endAt)}`,
    booking.guests != null && `<b>Гостей:</b> ${booking.guests}`,
    booking.totalPrice != null && `<b>Сумма:</b> ${booking.totalPrice}₽`,
  ].filter(Boolean);
  const text = lines.join("\n");

  try {
    await bot.telegram.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Подтвердить", callback_data: `confirm_${booking.id}` },
            { text: "❌ Отклонить", callback_data: `reject_${booking.id}` },
          ],
        ],
      },
    });
  } catch (err) {
    logger.error(err, "Telegram notification error");
  }
}
