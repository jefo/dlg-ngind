import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import {
	ServiceLifecycleInputSchema,
	stopListeningPort,
	serviceStoppedOutPort,
} from "./chat.application.ports";

// For stopping, we only need the channel, not the full config.
const StopServiceInputSchema = ServiceLifecycleInputSchema.pick({ channel: true });

export const stopChatServiceUseCase = async (input: unknown) => {
    // A bit of defensive programming to ensure we can report errors correctly.
    let channel = "unknown";
	try {
		const validInput = StopServiceInputSchema.parse(input);
        channel = validInput.channel;

		const stopListening = usePort(stopListeningPort);
		const serviceStopped = usePort(serviceStoppedOutPort);

		await stopListening(validInput);

		await serviceStopped({ channel: validInput.channel });

	} catch (error: any) {
		// This is a simplified error handling for stop.
        // In a real app, we might want a dedicated failed port.
		console.error(`[stopChatServiceUseCase] Failed to stop service for channel ${channel}:`, error);
	}
};
