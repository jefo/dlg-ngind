import { usePort } from "@maxdev1/sotajs";
import {
	ServiceLifecycleInputSchema,
	startListeningPort,
	serviceStartedOutPort,
	serviceStartFailedOutPort,
} from "../chat.application.ports";

export const startChatServiceUseCase = async (input: unknown) => {
	try {
		const validInput = ServiceLifecycleInputSchema.parse(input);

		const startListening = usePort(startListeningPort);
		const serviceStarted = usePort(serviceStartedOutPort);

		await startListening(validInput);

		await serviceStarted({ channel: validInput.channel });
	} catch (error: any) {
		const serviceStartFailed = usePort(serviceStartFailedOutPort);
		// We might not have the channel if parsing fails, so we handle that.
		const channel = ServiceLifecycleInputSchema.safeParse(input).success
			? ServiceLifecycleInputSchema.parse(input).channel
			: "unknown";

		await serviceStartFailed({
			channel,
			reason: error.message || "An unexpected error occurred.",
		});
	}
};
