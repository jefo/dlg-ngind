import { setPortAdapter } from "@maxdev1/sotajs";
import {
	startChatServiceUseCase,
	stopChatServiceUseCase,
	serviceStartedOutPort,
	serviceStoppedOutPort,
	serviceStartFailedOutPort,
} from "chat/src/index";
import { composeChatApp } from "chat";

async function main() {
	console.log("[GreeterBot]: Starting...");

	// 1. Compose the core application
	composeChatApp({ channel: "telegram" });

	// 2. Set up presentation-layer adapters for this specific app
	setPortAdapter(serviceStartedOutPort, async ({ channel }) => {
		console.log(
			`[GreeterBot]: Service for channel '${channel}' successfully started.`,
		);
	});
	setPortAdapter(serviceStoppedOutPort, async ({ channel }) => {
		console.log(
			`[GreeterBot]: Service for channel '${channel}' successfully stopped.`,
		);
	});
	setPortAdapter(serviceStartFailedOutPort, async ({ channel, reason }) => {
		console.error(
			`[GreeterBot]: Failed to start service for channel '${channel}'. Reason: ${reason}`,
		);
	});

	// 3. Get configuration from environment
	const channel = process.env.CHANNEL;
	const token = process.env.TELEGRAM_BOT_TOKEN;

	if (!channel || !token) {
		console.error(
			"Error: Please provide CHANNEL and TELEGRAM_BOT_TOKEN environment variables.",
		);
		console.error(
			"Example: CHANNEL=telegram TELEGRAM_BOT_TOKEN=your_token bun run entry.ts",
		);
		process.exit(1);
	}

	// 4. Start the service using the use case
	await startChatServiceUseCase({ channel, config: { token } });

	console.log("Application is running. Press Ctrl+C to stop.");

	// 5. Set up graceful shutdown
	process.on("SIGINT", async () => {
		console.log("\n[GreeterBot]: Gracefully shutting down...");
		await stopChatServiceUseCase({ channel });
		process.exit(0);
	});
}

main().catch((error) => {
	console.error("[GreeterBot]: Application failed to start:", error);
	process.exit(1);
});
