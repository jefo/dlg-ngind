// Интерфейсы для Telegram сообщений

// Основная структура Telegram сообщения
export interface TelegramMessage {
  chat_id: number | string;
  text?: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: TelegramReplyMarkup;
}

// Маркап для ответов
export interface TelegramReplyMarkup {
  inline_keyboard?: TelegramInlineKeyboardButton[][];
  keyboard?: TelegramKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  selective?: boolean;
}

// Кнопки для inline клавиатуры
export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
  callback_game?: any;
  pay?: boolean;
}

// Кнопки для обычной клавиатуры
export interface TelegramKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
  request_poll?: TelegramKeyboardButtonPollType;
}

// Тип опроса для кнопки клавиатуры
export interface TelegramKeyboardButtonPollType {
  type?: string;
}

// Структура для отправки фото
export interface TelegramPhoto {
  chat_id: number | string;
  photo: string; // URL или file_id
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: TelegramReplyMarkup;
}

// Структура для отправки медиагруппы
export interface TelegramMediaGroup {
  chat_id: number | string;
  media: TelegramInputMedia[];
}

// Интерфейс для медиа элемента
export interface TelegramInputMedia {
  type: 'photo' | 'video' | 'audio' | 'document';
  media: string; // URL или file_id
  caption?: string;
  parse_mode?: 'Markdown' | 'HTML';
}

// Структура для карточки в Telegram (используем sendMessage с HTML разметкой)
export interface TelegramCardMessage {
  chat_id: number | string;
  text: string;
  parse_mode: 'HTML';
  reply_markup?: TelegramReplyMarkup;
}