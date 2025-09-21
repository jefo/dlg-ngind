import { describe, it, expect, spyOn, beforeEach } from "bun:test";
import { renderViewUseCase } from "../application/use-cases/render-view.use-case.ts";
import { setPortAdapter, resetDI } from "@maxdev1/sotajs";
import {
	renderViewPort,
	viewRenderedOutPort,
	viewRenderingFailedOutPort,
} from "../domain/ports.ts";

describe("Render View Use Case", () => {
	beforeEach(() => {
		resetDI();
	});

	it("should render a view successfully", async () => {
		// Мокаем порты
		const renderViewMock = spyOn(
			{
				render: async () => ({
					id: "view1",
					name: "test",
					layout: "vertical",
					components: [],
				}),
			},
			"render",
		);
		const viewRenderedMock = spyOn({ notify: async () => {} }, "notify");
		const viewRenderingFailedMock = spyOn({ notify: async () => {} }, "notify");

		setPortAdapter(renderViewPort, renderViewMock as any);
		setPortAdapter(viewRenderedOutPort, viewRenderedMock as any);
		setPortAdapter(viewRenderingFailedOutPort, viewRenderingFailedMock as any);

		// Выполняем use case
		await renderViewUseCase({
			view: { id: "view1", name: "test", layout: "vertical", components: [] },
			context: {},
		});

		// Проверяем вызовы
		expect(renderViewMock).toHaveBeenCalledTimes(1);
		expect(viewRenderedMock).toHaveBeenCalledTimes(1);
		expect(viewRenderingFailedMock).toHaveBeenCalledTimes(0);
	});

	it("should handle rendering failure", async () => {
		// Мокаем порты с ошибкой
		const renderViewMock = spyOn(
			{
				render: async () => {
					throw new Error("Render failed");
				},
			},
			"render",
		);
		const viewRenderedMock = spyOn({ notify: async () => {} }, "notify");
		const viewRenderingFailedMock = spyOn({ notify: async () => {} }, "notify");

		setPortAdapter(renderViewPort, renderViewMock as any);
		setPortAdapter(viewRenderedOutPort, viewRenderedMock as any);
		setPortAdapter(viewRenderingFailedOutPort, viewRenderingFailedMock as any);

		// Выполняем use case
		await renderViewUseCase({
			view: { id: "view1", name: "test", layout: "vertical", components: [] },
			context: {},
		});

		// Проверяем вызовы
		expect(renderViewMock).toHaveBeenCalledTimes(1);
		expect(viewRenderedMock).toHaveBeenCalledTimes(0);
		expect(viewRenderingFailedMock).toHaveBeenCalledTimes(1);
	});
});
