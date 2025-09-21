import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import type { ViewDto } from "./ui.dto.ts";
import { telegramErrorOutPort, telegramOutPort } from "./view.ports.ts";
import { View } from "../../domain/view.aggregate.ts";

// DTO для входных данных use case
export interface RenderViewCommandInput {
	view: ViewDto;
	context: Record<string, unknown>;
	platform: "telegram" | "web";
}

/**
 * Use Case для рендеринга представлений
 *
 * Этот use case принимает представление и контекстные данные,
 * передает их в порт рендеринга и уведомляет о результате через выходные порты.
 * Также может передать результат в презентац
 * ионный слой для конкретной платформы.
 */
export const renderViewUseCase = async (
	input: RenderViewCommandInput,
): Promise<void> => {
	const view = View.create({
		name: input.view.name,
		layout: input.view.layout,
		components: input.view.components,
	});

	// TODO: create rendered view from template + context что бы отправить уже данные где темплейт наполнен данными
	try {
		// Если указана платформа, передаем результат в презентационный слой
		if (command.platform) {
			switch (command.platform) {
				case "telegram":
					const telegramPresenter = usePort(telegramOutPort);
					const telegramPresenterError = usePort(telegramErrorOutPort);

					try {
						await telegramPresenter({});
					} catch (error: any) {
						await telegramPresenterError({ message: error.message });
					}
					break;

				case "web":
					const webPresenter = usePort(webViewPresentationPort);
					const webPresenterError = usePort(webViewPresentationErrorPort);
					try {
						await webPresenter(renderedView);
					} catch (error: any) {
						await webPresenterError({ message: error.message });
					}
					break;
			}
		}
	} catch (error: any) {
		// Уведомление о неудаче
		await viewRenderingFailed({ message: error.message });

		// Если указана платформа, уведомляем презентационный слой об ошибке
		if (command.platform) {
			switch (command.platform) {
				case "telegram":
					const telegramPresenterError = usePort(
						telegramViewPresentationErrorPort,
					);
					await telegramPresenterError({ message: error.message });
					break;

				case "web":
					const webPresenterError = usePort(webViewPresentationErrorPort);
					await webPresenterError({ message: error.message });
					break;
			}
		}
	}
};
