import type { ServiceLifecycleInput } from "../../application";
import { receiveIncomingMessageUseCase } from "../../application/use-cases/receive-incoming-message.use-case";
import { getTelegramUpdates } from "./telegram-api.client";

// The state of our adapter. It holds the running process.
interface AdapterState {
	stop: () => void; // A function to stop the polling loop
	isRunning: boolean;
}

// We only support one running instance per adapter module.
let state: AdapterState | null = null;

/**
 * Transforms a raw Telegram update into our internal DTO.
 */
function handleTelegramUpdate(update: any) {
	const message = update.message;
	if (!message || !message.text) return;

	const payload = {
		chatId: `telegram:${message.chat.id}`,
		personaId: `telegram:${message.from.id}`,
		personaName: message.from.first_name || "User",
		text: message.text,
	};

	console.log(
		`< [Adapter]: Received message from ${message.from.first_name}. Routing to Core...`,
	);

	// The adapter acts as a "Driving Actor" and calls the application's use case.
	receiveIncomingMessageUseCase(payload).catch((err) => {
		console.error(
			`[Adapter]: Error processing message for chat ${payload.chatId}:`,
			err,
		);
	});
}

/**
 * The main polling loop for the Telegram adapter.
 */
async function runPollingLoop(
	token: string,
	controller: { isRunning: boolean },
) {
	console.log("[Adapter]: Starting Telegram polling...");
	let offset = 0;

	while (controller.isRunning) {
		try {
			const updates = await getTelegramUpdates(offset, token);
			for (const update of updates) {
				if (!controller.isRunning) break;
				offset = update.update_id + 1;
				handleTelegramUpdate(update);
			}
		} catch (error) {
			console.error("[Adapter]: Error in polling loop:", error);
			// Don't hammer the API on failure
			await new Promise((resolve) => setTimeout(resolve, 10000));
		}
	}
	console.log("[Adapter]: Telegram polling stopped.");
}

// --- Adapter Implementations ---

export const telegramStartListeningAdapter = async (
	input: ServiceLifecycleInput,
) => {
	if (state?.isRunning) {
		console.warn("[Adapter]: Telegram adapter is already running.");
		return;
	}

	const token = input.config?.token;
	if (typeof token !== "string" || !token) {
		throw new Error("Telegram adapter requires a 'token' in config.");
	}

	const controller = { isRunning: true };

	state = {
		isRunning: true,
		stop: () => {
			if (controller.isRunning) {
				console.log("[Adapter]: Stopping Telegram polling...");
				controller.isRunning = false;
			}
		},
	};

	// We don't await this, as it's a long-running process.
	runPollingLoop(token, controller);
};

export const telegramStopListeningAdapter = async () => {
	if (state?.isRunning) {
		state.stop();
		state = null;
	} else {
		console.warn("[Adapter]: Telegram adapter is not running.");
	}
};
