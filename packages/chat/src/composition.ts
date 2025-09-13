import { setPortAdapter, resetDI } from "@maxdev1/sotajs";

// Import all ports
import {
	findPersonaByIdPort,
	savePersonaPort,
	findChatByIdPort,
	saveChatPort,
	saveMessagePort,
} from "./chat.domain.ports";

import { messageSentOutPort } from "./chat.application.ports";

// Import all adapters
import {
	inMemorySavePersonaAdapter,
	inMemoryFindPersonaByIdAdapter,
	inMemorySaveChatAdapter,
	inMemoryFindChatByIdAdapter,
	inMemorySaveMessageAdapter,
} from "./infrastructure/persistence/in-memory.adapters";

/**
 * Function to set up all chat package ports with their implementations (adapters).
 * This is the composition root for the chat context.
 */
export function composeChatApp() {
	// Clear the container before composition (important for tests)
	resetDI();

	// --- Bind data ports ---
	setPortAdapter(findPersonaByIdPort, inMemoryFindPersonaByIdAdapter);
	setPortAdapter(savePersonaPort, inMemorySavePersonaAdapter);
	setPortAdapter(findChatByIdPort, inMemoryFindChatByIdAdapter);
	setPortAdapter(saveChatPort, inMemorySaveChatAdapter);
	setPortAdapter(saveMessagePort, inMemorySaveMessageAdapter);

	// --- Bind output ports ---
	// For now, we'll use a simple console adapter for messageSentOutPort
	setPortAdapter(messageSentOutPort, async (dto) => {
		console.log(`[MessageSent]: ${dto.content} to chat ${dto.chatId}`);
		return Promise.resolve();
	});
}

/**
 * Function to compose both bot-persona and chat contexts together.
 * This should be used when both contexts need to work together.
 */
export function composeFullApp() {
	resetDI();

	// Import and call bot-persona composition
	// Note: This assumes bot-persona package is available
	import("bot-persona/src/composition")
		.then(({ composeApp }) => {
			composeApp();
		})
		.catch(() => {
			console.warn(
				"Bot-persona composition not available, only setting up chat context",
			);
		});

	// Setup chat context
	composeChatApp();
}
