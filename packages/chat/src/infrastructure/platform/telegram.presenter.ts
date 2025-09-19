import { sendTelegramMessage } from "./telegram-api.client";
import type { ComponentRenderDto } from "@dlg-ngind/bot-persona/src/runtime/dtos";
import type { MessageProps } from "@dlg-ngind/bot-persona/src/desing/domain/ui/message.entity";
import type { ButtonGroupProps } from "@dlg-ngind/bot-persona/src/desing/domain/ui/button-group.entity";

/** 
 * Telegram Presenter - это адаптер для порта componentRenderOutPort.
 * Он отвечает за преобразование платформо-независимых UI-сущностей
 * в нативные элементы управления Telegram.
 */
export async function telegramPresenterAdapter(dto: ComponentRenderDto): Promise<void> {
  // В новой системе мы получаем компоненты по одному, с уже объединенными кнопками
  const { chatId, componentName, props } = dto;

  // Проверяем, что это сообщение - только сообщения мы отправляем напрямую
  if (componentName !== 'message' && componentName !== 'Message') {
    // Для других компонентов мы ничего не делаем,
    // так как кнопки отправляются вместе с сообщением
    return;
  }

  // Извлекаем текст сообщения
  const messageText = props.text;
  if (!messageText) {
    console.error("[Presenter] Error: No text found in message component.");
    return;
  }

  // Формируем нативный UI для Telegram
  let reply_markup: any = {};

  // Если есть кнопки в props, формируем их
  if (props.buttons && Array.isArray(props.buttons) && props.buttons.length > 0) {
    const inline_keyboard = props.buttons.map(button => ({
      text: button.label,
      // Важно: превращаем event и payload в строку, чтобы передать через callback_data
      callback_data: JSON.stringify({ event: button.event, payload: button.payload || {} }),
    }));

    // Для простоты пока делаем один ряд кнопок
    reply_markup = {
      inline_keyboard: [inline_keyboard],
    };
  }

  // Вызываем API-клиент Telegram
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
    messageText,
    token,
    reply_markup
  );
}
