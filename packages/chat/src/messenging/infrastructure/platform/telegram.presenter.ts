import { sendTelegramMessage } from "./telegram-api.client";
import type { ViewRenderDto } from "@dlg-ngind/bot-persona/src/runtime/dtos";

/** 
 * Telegram Presenter - это адаптер для порта viewRenderOutPort.
 * Он отвечает за преобразование платформо-независимых UI-сущностей
 * в нативные элементы управления Telegram.
 */
export async function telegramPresenterAdapter(dto: ViewRenderDto): Promise<void> {
  const { chatId, viewNode } = dto;
  
  // Нам нужно найти сообщение и кнопки в компонентах
  let messageText = "";
  let buttons: any[] = [];

  // Проходим по всем компонентам в viewNode
  for (const component of viewNode.components) {
    // Проверяем тип компонента
    if (component.type === 'message' && component.props && typeof component.props === 'object' && 'text' in component.props) {
      // Это сообщение
      messageText = component.props.text;
    } else if (component.type === 'button' && component.props && typeof component.props === 'object' && 'text' in component.props) {
      // Это кнопка
      buttons.push({
        label: component.props.text,
        event: component.props.action,
        payload: component.props.payload || {}
      });
    }
  }

  // Если нет сообщения, нечего отправлять
  if (!messageText) {
    console.error("[Presenter] Error: No message component found to render.");
    return;
  }

  // Формируем нативный UI для Telegram
  let reply_markup: any = {};

  // Если есть кнопки, формируем их
  if (buttons.length > 0) {
    const inline_keyboard = buttons.map(button => ({
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
