import { describe, it, expect } from "bun:test";
import { randomUUID } from "crypto";
import { Conversation } from "./conversaton.aggregate";
import { createFormFromDefinition } from "../../desing/domain";
import { MessageSchema } from "../../desing/domain/ui/message.entity";

// --- Мок-данные для теста ---

const greeterBotDefinition = {
	name: "Greeter Bot",
	fsmDefinition: {
		initialStateId: "ask_name",
		states: [{ id: "ask_name" }, { id: "greet_user" }],
		transitions: [
			{
				from: "ask_name",
				event: "SUBMIT_NAME",
				to: "greet_user",
				assign: { userName: "payload.name" },
			},
		],
	},
	viewDefinition: {
		nodes: [
			{
				id: "ask_name",
				components: [
					{
						id: "message-1",
						text: "Как тебя зовут?",
					},
				],
			},
			{
				id: "greet_user",
				components: [
					{
						id: "message-2",
						text: "Приятно познакомиться, context.userName!",
					},
				],
			},
		],
	},
	formDefinition: {
		id: "greeter-form",
		name: "Greeter Form",
		fields: [
			{
				id: "user-name-field",
				name: "userName",
				type: "string" as const,
				label: "User Name",
			},
		],
	},
};

describe("Conversation Aggregate", () => {
	it("should handle component-based view structure correctly", () => {
		// --- Arrange ---
		const now = new Date();
		const form = createFormFromDefinition(
			greeterBotDefinition.formDefinition,
			randomUUID(),
		);

		const conversation = Conversation.create({
			id: randomUUID(),
			botPersonaId: randomUUID(),
			chatId: "test-chat",
			status: "active",
			currentStateId: "ask_name",
			form: form.state,
			fsmDefinition: greeterBotDefinition.fsmDefinition,
			viewDefinition: greeterBotDefinition.viewDefinition,
			createdAt: now,
			updatedAt: now,
		});

		// --- Act ---
		conversation.actions.applyEvent({
			event: "SUBMIT_NAME",
			payload: { name: "Тестер" },
		});

		// --- Assert ---
		const finalView = conversation.currentView;

		// 1. Проверяем, что состояние FSM изменилось
		expect(conversation.state.currentStateId).toBe("greet_user");

		// 2. Проверяем, что данные сохранились в состоянии формы
		const formState = conversation.state.form.formState;
		const nameFieldValue = Object.values(formState).find(f => f.value === "Тестер");
		expect(nameFieldValue).toBeDefined();

		// 3. Проверяем, что у нас есть компоненты в представлении
		expect(finalView?.components).toBeDefined();
		expect(finalView?.components.length).toBeGreaterThan(0);
		
		// 4. Проверяем, что первый компонент - это сообщение
		const firstComponent = finalView?.components[0];
		expect(firstComponent?.id).toBe("message-2");
	});
});
