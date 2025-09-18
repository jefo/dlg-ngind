import { sendTelegramMessage } from "./telegram-api.client";
import type { ComponentRenderDto } from "@bot-persona/src/runtime/dtos"; // Условный импорт, реальный путь будет настроен в tsconfig
import type { MessageProps } from "@bot-persona/src/desing/domain/ui/message.entity";
import type { ButtonGroupProps } from "@bot-persona/src/desing/domain/ui/button-group.entity";

/**
 * Telegram Presenter - это адаптер для порта componentRenderOutPort.
 * Он отвечает за преобразование платформо-независимых UI-сущностей
 * в нативные элементы управления Telegram.
 */
export async function telegramPresenterAdapter(dto: ComponentRenderDto): Promise<void> {
  const { chatId, components } = dto;

  // 1. Находим компоненты, которые нам нужны
  const messageComponent = components.find(
    (c) => "text" in c // Простой способ определить MessageEntity
  ) as MessageProps | undefined;

  const buttonGroupComponent = components.find(
    (c) => "buttons" in c // Простой способ определить ButtonGroupEntity
  ) as ButtonGroupProps | undefined;

  if (!messageComponent) {
    console.error("[Presenter] Error: No message component found to render.");
    return;
  }

  // 2. Формируем нативный UI для Telegram
  let reply_markup: any = {};

  if (buttonGroupComponent && buttonGroupComponent.buttons.length > 0) {
    const inline_keyboard = buttonGroupComponent.buttons.map(button => ({
      text: button.label,
      // Важно: превращаем event и payload в строку, чтобы передать через callback_data
      callback_data: JSON.stringify({ event: button.event, payload: button.payload || {} }),
    }));

    // Для простоты пока делаем один ряд кнопок
    reply_markup = {
      inline_keyboard: [inline_keyboard],
    };
  }

  // 3. Вызываем API-клиент Telegram
  const [platform, platformChatId] = chatId.split(":");
  if (platform !== 'telegram' || !platformChatId) {
    console.error(`[Presenter] Invalid chatId format for Telegram: ${chatId}`);
    return;
  }

  // TODO: Токен нужно будет получать из конфигурации, а не из process.env напрямую
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("[Presenter] TELEGRAM_BOT_TOKEN is not set.");
    return;
  }

  await sendTelegramMessage(
    Number(platformChatId),
    messageComponent.text,
    token,
    reply_markup
  );
}
