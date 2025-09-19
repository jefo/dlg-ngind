import { RenderedView, MessageComponentDTO, ButtonComponentDTO, CardComponentDTO, ProductCardComponentDTO, BotProductCardComponentDTO } from '../../application/index.ts';
import { TelegramMessage, TelegramReplyMarkup, TelegramInlineKeyboardButton } from './telegram.types.ts';

/**
 * Адаптер для презентации рендеринга в Telegram
 * Преобразует RenderedView в формат, понятный Telegram Bot API
 */
export const telegramViewPresentationAdapter = async (renderedView: RenderedView): Promise<void> => {
  try {
    // Здесь будет логика преобразования RenderedView в Telegram сообщения
    // Для демонстрации создаем простое текстовое сообщение
    
    // Генерируем текст сообщения на основе компонентов
    const messageText = generateMessageText(renderedView);
    
    // Генерируем клавиатуру на основе кнопок
    const replyMarkup = generateReplyMarkup(renderedView);
    
    // Создаем объект сообщения для Telegram
    const telegramMessage: TelegramMessage = {
      chat_id: 123456789, // В реальной реализации будет передаваться из контекста
      text: messageText,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    };
    
    // В реальной реализации здесь будет вызов Telegram Bot API
    console.log('Отправка сообщения в Telegram:', JSON.stringify(telegramMessage, null, 2));
    
    // Имитация асинхронной операции
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error: any) {
    throw new Error(`Ошибка презентации в Telegram: ${error.message}`);
  }
};

/**
 * Генерирует текст сообщения на основе компонентов представления
 */
const generateMessageText = (renderedView: RenderedView): string => {
  let messageText = `<b>${renderedView.name}</b>\n\n`;
  
  for (const component of renderedView.components) {
    switch (component.type) {
      case 'message':
        const messageComponent = component as MessageComponentDTO;
        messageText += formatMessageComponent(messageComponent);
        break;
        
      case 'card':
        const cardComponent = component as CardComponentDTO;
        messageText += formatCardComponent(cardComponent);
        break;
        
      case 'product-card':
        const productCardComponent = component as ProductCardComponentDTO;
        messageText += formatProductCardComponent(productCardComponent);
        break;
        
      case 'bot-product-card':
        const botProductCardComponent = component as BotProductCardComponentDTO;
        messageText += formatBotProductCardComponent(botProductCardComponent);
        break;
        
      default:
        messageText += `<i>Компонент типа "${component.type}"</i>\n\n`;
    }
  }
  
  return messageText;
};

/**
 * Форматирует компонент сообщения
 */
const formatMessageComponent = (component: MessageComponentDTO): string => {
  let text = component.props.text;
  
  // Применяем стилизацию в зависимости от варианта
  switch (component.props.variant) {
    case 'info':
      text = `<i>${text}</i>`;
      break;
    case 'success':
      text = `<b>✅ ${text}</b>`;
      break;
    case 'warning':
      text = `<b>⚠️ ${text}</b>`;
      break;
    case 'error':
      text = `<b>❌ ${text}</b>`;
      break;
  }
  
  return `${text}\n\n`;
};

/**
 * Форматирует компонент карточки
 */
const formatCardComponent = (component: CardComponentDTO): string => {
  let text = `<b>${component.props.title}</b>\n`;
  
  if (component.props.description) {
    text += `${component.props.description}\n`;
  }
  
  if (component.props.imageUrl) {
    text += `<a href="${component.props.imageUrl}">🖼 Просмотр изображения</a>\n`;
  }
  
  return `${text}\n`;
};

/**
 * Форматирует компонент карточки товара
 */
const formatProductCardComponent = (component: ProductCardComponentDTO): string => {
  let text = `<b>${component.props.title}</b>\n`;
  
  if (component.props.description) {
    text += `${component.props.description}\n`;
  }
  
  if (component.props.price !== undefined) {
    const currency = component.props.currency || 'RUB';
    text += `<b>Цена: ${component.props.price} ${currency}</b>\n`;
  }
  
  if (component.props.imageUrl) {
    text += `<a href="${component.props.imageUrl}">🖼 Просмотр товара</a>\n`;
  }
  
  return `${text}\n`;
};

/**
 * Форматирует компонент карточки бота
 */
const formatBotProductCardComponent = (component: BotProductCardComponentDTO): string => {
  let text = `🤖 <b>${component.props.modelName}</b>\n`;
  
  if (component.props.features && component.props.features.length > 0) {
    text += `\n<b>Функции:</b>\n`;
    for (const feature of component.props.features) {
      text += `• ${feature}\n`;
    }
  }
  
  if (component.props.price !== undefined) {
    const currency = component.props.currency || 'RUB';
    text += `\n<b>Стоимость: ${component.props.price} ${currency}</b>\n`;
  }
  
  if (component.props.integrations && component.props.integrations.length > 0) {
    text += `\n<b>Интеграции:</b>\n`;
    for (const integration of component.props.integrations) {
      text += `• ${integration}\n`;
    }
  }
  
  return `${text}\n`;
};

/**
 * Генерирует клавиатуру на основе кнопок в компонентах
 */
const generateReplyMarkup = (renderedView: RenderedView): TelegramReplyMarkup | undefined => {
  const buttons: TelegramInlineKeyboardButton[] = [];
  
  // Собираем все кнопки из компонентов
  for (const component of renderedView.components) {
    if (component.type === 'button') {
      const buttonComponent = component as ButtonComponentDTO;
      buttons.push({
        text: buttonComponent.props.text,
        callback_data: buttonComponent.props.action
      });
    }
    
    // Для карточек с действиями
    if (component.type === 'card' && component.props.actions) {
      for (const action of component.props.actions) {
        buttons.push({
          text: action.props.text,
          callback_data: action.props.action
        });
      }
    }
    
    // Для карточек товаров с кнопкой "подробнее"
    if (component.type === 'product-card' && component.props.action) {
      buttons.push({
        text: component.props.actionText || 'Подробнее',
        callback_data: component.props.action
      });
    }
    
    // Для карточек ботов с кнопкой "подробнее"
    if (component.type === 'bot-product-card' && component.props.action) {
      buttons.push({
        text: component.props.actionText || 'Подробнее',
        callback_data: component.props.action
      });
    }
  }
  
  // Если есть кнопки, создаем клавиатуру
  if (buttons.length > 0) {
    // Организуем кнопки в строки по 2 кнопки в строке
    const keyboard: TelegramInlineKeyboardButton[][] = [];
    for (let i = 0; i < buttons.length; i += 2) {
      keyboard.push(buttons.slice(i, i + 2));
    }
    
    return {
      inline_keyboard: keyboard
    };
  }
  
  return undefined;
};