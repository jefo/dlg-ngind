import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import {
	renderViewPort,
	viewRenderedOutPort,
	viewRenderingFailedOutPort,
} from "../../domain/ports.ts";

// DTO для входных данных use case
const RenderViewUseCaseInputSchema = z.object({
	view: z.record(z.string(), z.unknown()),
	context: z.record(z.string(), z.unknown()),
});

type RenderViewUseCaseInput = z.infer<typeof RenderViewUseCaseInputSchema>;

/**
 * Use Case для рендеринга представлений
 *
 * Этот use case принимает представление и контекстные данные,
 * передает их в порт рендеринга и уведомляет о результате через выходные порты.
 */
export const renderViewUseCase = async (
	input: RenderViewUseCaseInput,
): Promise<void> => {
	const command = RenderViewUseCaseInputSchema.parse(input);

	// Получение зависимостей
	const renderView = usePort(renderViewPort);
	const viewRendered = usePort(viewRenderedOutPort);
	const viewRenderingFailed = usePort(viewRenderingFailedOutPort);

	try {
		// Рендеринг представления
		const result = await renderView({
			view: command.view,
			context: command.context as Record<string, any>,
		});

		// Уведомление об успешном рендеринге
		await viewRendered(result);
	} catch (error: any) {
		// Уведомление о неудаче
		await viewRenderingFailed({ message: error.message });
	}
};
