import type { HydratedView } from "../../domain/ports.ts";

// Импортируем типы Telegram
import type {
	TelegramMessage,
	TelegramInlineKeyboardButton,
	TelegramReplyMarkup,
	TelegramCardMessage,
} from "./telegram.types.ts";

/**
 * Адаптер для преобразования HydratedView в формат Telegram
 *
 * Этот адаптер принимает результат рендеринга из bot-ui и преобразует его
 * в сообщения, понятные Telegram Bot API
 */
export const telegramViewRenderedAdapter = async (
	hydratedView: HydratedView,
	chatId: number | string,
): Promise<TelegramMessage[]> => {
	const messages: TelegramMessage[] = [];

	// Обрабатываем каждый компонент в представлении
	for (const component of hydratedView.components) {
		switch (component.type) {
			case "message":
				messages.push(convertMessageComponent(component, chatId));
				break;

			case "button":
				// Кнопки обрабатываются как часть других компонентов
				break;

			case "card":
				messages.push(convertCardComponent(component, chatId));
				break;

			case "product-card":
				messages.push(convertProductCardComponent(component, chatId));
				break;

			case "bot-product-card":
				messages.push(convertBotProductCardComponent(component, chatId));
				break;

			default:
				// Для неизвестных компонентов создаем простое текстовое сообщение
				messages.push({
					chat_id: chatId,
					text: `Неизвестный компонент: ${component.type}`,
				});
		}
	}

	return messages;
};

/**
 * Преобразование компонента сообщения в Telegram сообщение
 */
const convertMessageComponent = (
	component: any,
	chatId: number | string,
): TelegramMessage => {
	return {
		chat_id: chatId,
		text: component.props.text,
		parse_mode: "HTML",
		reply_markup: component.props.actions
			? createInlineKeyboard(component.props.actions)
			: undefined,
	};
};

/**
 * Преобразование компонента карточки в Telegram сообщение
 */
const convertCardComponent = (
	component: any,
	chatId: number | string,
): TelegramCardMessage => {
	let text = `<b>${component.props.title}</b>`;

	if (component.props.description) {
		text += `\n\n${component.props.description}`;
	}

	if (component.props.imageUrl) {
		text += `\n\n<a href="${component.props.imageUrl}">Изображение</a>`;
	}

	return {
		chat_id: chatId,
		text: text,
		parse_mode: "HTML",
		reply_markup: component.props.actions
			? createInlineKeyboard(component.props.actions)
			: undefined,
	};
};

/**
 * Преобразование компонента карточки товара в Telegram сообщение
 */
const convertProductCardComponent = (
	component: any,
	chatId: number | string,
): TelegramCardMessage => {
	let text = `<b>${component.props.title}</b>`;

	if (component.props.description) {
		text += `\n\n${component.props.description}`;
	}

	if (component.props.price) {
		const currency = component.props.currency || "RUB";
		text += `\n\n<b>Цена:</b> ${component.props.price} ${currency}`;
	}

	if (component.props.imageUrl) {
		text += `\n\n<a href="${component.props.imageUrl}">Изображение</a>`;
	}

	// Создаем кнопку "подробнее" если она есть
	const replyMarkup: TelegramReplyMarkup | undefined =
		component.props.actionText && component.props.action
			? {
					inline_keyboard: [
						[
							{
								text: component.props.actionText,
								callback_data: component.props.action,
							},
						],
					],
				}
			: undefined;

	return {
		chat_id: chatId,
		text: text,
		parse_mode: "HTML",
		reply_markup: replyMarkup,
	};
};

/**
 * Преобразование компонента карточки бота в Telegram сообщение
 */
const convertBotProductCardComponent = (
	component: any,
	chatId: number | string,
): TelegramCardMessage => {
	let text = `<b>${component.props.modelName}</b>`;

	if (component.props.features && component.props.features.length > 0) {
		text += `\n\n<b>Функции:</b>\n`;
		component.props.features.forEach((feature: string) => {
			text += `• ${feature}\n`;
		});
	}

	if (component.props.price) {
		const currency = component.props.currency || "RUB";
		text += `\n<b>Стоимость:</b> ${component.props.price} ${currency}`;
	}

	if (component.props.integrations && component.props.integrations.length > 0) {
		text += `\n\n<b>Интеграции:</b>\n`;
		component.props.integrations.forEach((integration: string) => {
			text += `• ${integration}\n`;
		});
	}

	// Создаем кнопку "подробнее" если она есть
	const replyMarkup: TelegramReplyMarkup | undefined =
		component.props.actionText && component.props.action
			? {
					inline_keyboard: [
						[
							{
								text: component.props.actionText,
								callback_data: component.props.action,
							},
						],
					],
				}
			: undefined;

	return {
		chat_id: chatId,
		text: text,
		parse_mode: "HTML",
		reply_markup: replyMarkup,
	};
};

/**
 * Создание inline клавиатуры из кнопок
 */
const createInlineKeyboard = (actions: any[]): TelegramReplyMarkup => {
	const buttons: TelegramInlineKeyboardButton[] = actions.map((action) => ({
		text: action.props.text,
		callback_data: action.props.action,
	}));

	return {
		inline_keyboard: [buttons],
	};
};
