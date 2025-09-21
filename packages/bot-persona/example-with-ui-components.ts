import { id } from "zod/locales";
import { BotPersona } from "./src/desing/domain/bot-persona.aggregate";
import {
	MessageComponent,
	ButtonComponent,
	BotProductCardComponent,
} from "./src/ui/domain";

// Пример создания BotPersona с использованием новых компонентов из bot-ui
async function createBotPersonaWithUIComponents() {
	console.log("=== Создание BotPersona с новыми UI компонентами ===\n");

	try {
		// Создание компонентов
		const welcomeMessage = MessageComponent.create({
			id: "welcome-msg",
			type: "message",
			props: {
				text: "Добро пожаловать в наш сервис! Выберите интересующий вас бот.",
				variant: "info",
			},
		});

		const viewBotsButton = ButtonComponent.create({
			id: "view-bots-btn",
			type: "button",
			props: {
				text: "Просмотреть ботов",
				action: "view_bots",
			},
		});

		const salesAssistantBotCard = BotProductCardComponent.create({
			id: "sales-assistant-card",
			type: "bot-product-card",
			props: {
				modelName: "Sales Assistant Pro",
				features: [
					"Автоматическая квалификация лида",
					"Интеграция с CRM",
					"Многоканальная поддержка",
				],
				price: 29900,
				currency: "RUB",
				integrations: ["Telegram", "WhatsApp", "Slack", "CRM Systems"],
				actionText: "Подробнее",
				action: "view_bot_details",
			},
		});

		// Создание BotPersona
		const botPersona = BotPersona.create({
			id: "bot-persona-001",
			name: "Витрина ботов",
			fsmDefinition: {
				initialStateId: "welcome",
				states: [
					{ id: "welcome", type: "normal" },
					{ id: "bots-list", type: "normal" },
					{ id: "bot-details", type: "normal" },
				],
				transitions: [
					{
						event: "view_bots",
						from: "welcome",
						to: "bots-list",
					},
					{
						event: "view_bot_details",
						from: "bots-list",
						to: "bot-details",
					},
				],
			},
			viewDefinition: {
				id: "view-001",
				nodes: [
					{
						id: "welcome",
						components: [welcomeMessage.props, viewBotsButton.props],
					},
					{
						id: "bots-list",
						components: [salesAssistantBotCard.props],
					},
					{
						id: "bot-details",
						components: [salesAssistantBotCard.props],
					},
				],
			},
			formDefinition: {
				id: "form-001",
				name: "name",
				fields: [],
			},
		});

		console.log("✅ BotPersona успешно создана с новыми UI компонентами:");
		console.log(JSON.stringify(botPersona.state, null, 2));

		return botPersona;
	} catch (error: any) {
		console.error("❌ Ошибка при создании BotPersona:", error.message);
		throw error;
	}
}

// Запуск примера
createBotPersonaWithUIComponents().catch(console.error);
