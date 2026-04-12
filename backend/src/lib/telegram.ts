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
        include: { branch: true, sauna: true },
      });
      // Редактируем сообщение целиком (текст + убираем кнопки)
      const newText = renderBookingMessage(booking, "confirmed");
      await ctx.editMessageText(newText, { parse_mode: "HTML" });
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
        include: { branch: true, sauna: true },
      });
      const newText = renderBookingMessage(booking, "cancelled");
      await ctx.editMessageText(newText, { parse_mode: "HTML" });
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

type BookingForMsg = {
  id: number;
  clientName: string;
  phone: string;
  startAt: Date;
  endAt: Date;
  guests?: number | null;
  totalPrice?: number | null;
  paidAmount?: number;
  branch?: { name: string } | null;
  sauna?: { name: string } | null;
};

const STATUS_EMOJI: Record<string, string> = {
  new: "🟡 <b>Ожидает подтверждения</b>",
  confirmed: "✅ <b>Подтверждена</b>",
  cancelled: "❌ <b>Отменена</b>",
  completed: "🏁 <b>Завершена</b>",
};

/**
 * Рендерит текст сообщения брони. Используется и при первой отправке,
 * и при редактировании после смены статуса — один источник правды для
 * форматирования, чтобы обновлённое сообщение выглядело идентично новому.
 */
function renderBookingMessage(booking: BookingForMsg, status: string): string {
  const fmt = (d: Date) => formatMoscowHuman(new Date(d));
  const header = status === "new"
    ? "🔔 <b>Новая оплаченная бронь!</b>"
    : STATUS_EMOJI[status] || `<b>Статус:</b> ${status}`;

  const lines = [
    header,
    "",
    `<b>Клиент:</b> ${booking.clientName}`,
    `<b>Телефон:</b> ${booking.phone}`,
    booking.branch && `<b>Филиал:</b> ${booking.branch.name}`,
    booking.sauna && `<b>Сауна:</b> ${booking.sauna.name}`,
    `<b>Начало:</b> ${fmt(booking.startAt)}`,
    `<b>Конец:</b> ${fmt(booking.endAt)}`,
    booking.guests != null && `<b>Гостей:</b> ${booking.guests}`,
    booking.totalPrice != null && `<b>Сумма:</b> ${booking.totalPrice}₽`,
    booking.paidAmount != null && booking.paidAmount > 0 && `<b>Оплачено:</b> ${booking.paidAmount}₽`,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Отправляет уведомление о новой (оплаченной) брони и сохраняет
 * message_id в БД, чтобы потом можно было редактировать сообщение
 * при confirm/cancel из админки.
 */
export async function notifyNewBooking(booking: BookingForMsg) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId) return;

  const text = renderBookingMessage(booking, "new");

  try {
    const sent = await bot.telegram.sendMessage(chatId, text, {
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
    // Сохраняем ID сообщения, чтобы можно было его отредактировать
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        telegramChatId: String(chatId),
        telegramMessageId: sent.message_id,
      },
    });
  } catch (err) {
    logger.error(err, "Telegram notification error");
  }
}

/**
 * Редактирует ранее отправленное сообщение о брони — меняет текст
 * и убирает inline-кнопки (confirm/cancel уже не нужны).
 * Вызывается из PUT /bookings/:id и из inline-callback'ов бота.
 */
export async function updateBookingMessage(booking: BookingForMsg & {
  status: string;
  telegramChatId?: string | null;
  telegramMessageId?: number | null;
}) {
  if (!bot || !booking.telegramChatId || !booking.telegramMessageId) return;
  const text = renderBookingMessage(booking, booking.status);
  try {
    await bot.telegram.editMessageText(
      booking.telegramChatId,
      booking.telegramMessageId,
      undefined,
      text,
      { parse_mode: "HTML" },
    );
  } catch (err) {
    // 400 "message is not modified" — нормальный случай, игнорируем
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("message is not modified")) {
      logger.error({ err, bookingId: booking.id }, "Telegram edit error");
    }
  }
}
