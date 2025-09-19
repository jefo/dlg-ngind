import { describe, it, expect } from "bun:test";
import { telegramViewPresentationAdapter } from "../src/presentation/telegram/telegram.presenter.adapter.ts";
import type { RenderedView } from "../src/application/dto/ui.dto.ts";

describe("Telegram View Presentation Adapter", () => {
	it("should format a simple message component", async () => {
		const renderedView: RenderedView = {
			id: "test-view",
			name: "Test View",
			layout: "vertical",
			components: [
				{
					id: "msg1",
					type: "message",
					props: {
						text: "Hello, world!",
						variant: "info",
					},
				},
			],
		};

		// Проверяем, что адаптер не выбрасывает ошибок
		await expect(
			telegramViewPresentationAdapter(renderedView),
		).resolves.toBeUndefined();
	});

	it("should format a product card component", async () => {
		const renderedView: RenderedView = {
			id: "product-view",
			name: "Product View",
			layout: "vertical",
			components: [
				{
					id: "product1",
					type: "product-card",
					props: {
						title: "Test Product",
						description: "This is a test product",
						price: 999,
						currency: "RUB",
						imageUrl: "https://example.com/image.jpg",
					},
				},
			],
		};

		// Проверяем, что адаптер не выбрасывает ошибок
		await expect(
			telegramViewPresentationAdapter(renderedView),
		).resolves.toBeUndefined();
	});

	it("should format a bot product card component", async () => {
		const renderedView: RenderedView = {
			id: "bot-view",
			name: "Bot View",
			layout: "vertical",
			components: [
				{
					id: "bot1",
					type: "bot-product-card",
					props: {
						modelName: "Test Bot",
						features: ["Feature 1", "Feature 2"],
						price: 1999,
						currency: "RUB",
						integrations: ["Telegram", "Slack"],
					},
				},
			],
		};

		// Проверяем, что адаптер не выбрасывает ошибок
		await expect(
			telegramViewPresentationAdapter(renderedView),
		).resolves.toBeUndefined();
	});

	it("should handle multiple components", async () => {
		const renderedView: RenderedView = {
			id: "multi-view",
			name: "Multi Component View",
			layout: "vertical",
			components: [
				{
					id: "msg1",
					type: "message",
					props: {
						text: "Welcome!",
						variant: "success",
					},
				},
				{
					id: "btn1",
					type: "button",
					props: {
						text: "Get Started",
						action: "start",
					},
				},
				{
					id: "product1",
					type: "product-card",
					props: {
						title: "Product",
						price: 599,
					},
				},
			],
		};

		// Проверяем, что адаптер не выбрасывает ошибок
		await expect(
			telegramViewPresentationAdapter(renderedView),
		).resolves.toBeUndefined();
	});

	it("should handle invalid component types gracefully", async () => {
		const renderedView: RenderedView = {
			id: "error-view",
			name: "Error View",
			layout: "vertical",
			components: [
				{
					id: "invalid1",
					type: "invalid-component",
					props: {
						text: "This component type does not exist",
					},
				},
			],
		};

		// Адаптер должен корректно обрабатывать неизвестные типы компонентов
		await expect(
			telegramViewPresentationAdapter(renderedView),
		).resolves.toBeUndefined();
	});
});
