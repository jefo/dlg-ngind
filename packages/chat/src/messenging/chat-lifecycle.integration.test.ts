import { beforeEach, describe, expect, it, mock } from "bun:test";
import { resetDI, setPortAdapter } from "@maxdev1/sotajs";
import {
	startChatServiceUseCase,
	stopChatServiceUseCase,
	receiveIncomingMessageUseCase,
} from "./application/use-cases";
import {
	startListeningPort,
	stopListeningPort,
	serviceStartedOutPort,
	serviceStoppedOutPort,
	messageSentOutPort,
} from "./application/chat.application.ports";
import {
	findChatByIdPort,
	findPersonaByIdPort,
	saveChatPort,
	saveMessagePort,
	savePersonaPort,
} from "./domain/chat.domain.ports";
import type { PersonaEntityType } from "./domain/persona.entity";
import type { ChatEntityType } from "./domain/chat.entity";

describe("Chat Service Lifecycle Integration Test", () => {
	// Mocks for infrastructure/driven ports
	let mockStartListening: ReturnType<typeof mock>;
	let mockStopListening: ReturnType<typeof mock>;

	// Mocks for output/presentation ports
	let mockServiceStarted: ReturnType<typeof mock>;
	let mockServiceStopped: ReturnType<typeof mock>;
	let mockMessageSent: ReturnType<typeof mock>;

	// Mocks for persistence ports (in-memory DB)
	const memoryPersonas = new Map<string, PersonaEntityType>();
	const memoryChats = new Map<string, ChatEntityType>();
	let mockSavePersona: ReturnType<typeof mock>;
	let mockSaveChat: ReturnType<typeof mock>;

	beforeEach(() => {
		// Reset DI container and all mocks before each test
		resetDI();
		memoryPersonas.clear();
		memoryChats.clear();

		// Re-create mocks for each test to ensure isolation
		mockStartListening = mock(async () => {});
		mockStopListening = mock(async () => {});
		mockServiceStarted = mock(async () => {});
		mockServiceStopped = mock(async () => {});
		mockMessageSent = mock(async () => {});
		mockSavePersona = mock(async (p) => {
			memoryPersonas.set(p.id, p);
		});
		mockSaveChat = mock(async (c) => {
			memoryChats.set(c.id, c);
		});

		// --- Composition Root for the test ---
		// Bind lifecycle ports
		setPortAdapter(startListeningPort, mockStartListening);
		setPortAdapter(stopListeningPort, mockStopListening);

		// Bind output ports
		setPortAdapter(serviceStartedOutPort, mockServiceStarted);
		setPortAdapter(serviceStoppedOutPort, mockServiceStopped);
		setPortAdapter(messageSentOutPort, mockMessageSent);

		// Bind data ports
		setPortAdapter(
			findPersonaByIdPort,
			async (id) => memoryPersonas.get(id) || null,
		);
		setPortAdapter(findChatByIdPort, async (id) => memoryChats.get(id) || null);
		setPortAdapter(savePersonaPort, mockSavePersona);
		setPortAdapter(saveChatPort, mockSaveChat);
		setPortAdapter(
			saveMessagePort,
			mock(async () => {}),
		); // Don't need to check this for now
	});

	it("should start, process messages, and then stop the service", async () => {
		// === 1. Start the service ===
		const channelConfig = {
			channel: "test-channel",
			config: { token: "fake-token" },
		};
		await startChatServiceUseCase(channelConfig);

		// Assert: Check that the start process was orchestrated correctly
		expect(mockStartListening).toHaveBeenCalledTimes(1);
		expect(mockStartListening).toHaveBeenCalledWith(channelConfig);
		expect(mockServiceStarted).toHaveBeenCalledTimes(1);
		expect(mockServiceStarted).toHaveBeenCalledWith({
			channel: "test-channel",
		});

		// === 2. Simulate incoming messages (adapter's job) ===
		const message1 = {
			chatId: "test:chat1",
			personaId: "test:persona1",
			personaName: "Alice",
			text: "Hello world",
		};
		const message2 = {
			chatId: "test:chat1",
			personaId: "test:persona2",
			personaName: "Bob",
			text: "Hello Alice",
		};

		await receiveIncomingMessageUseCase(message1);
		await receiveIncomingMessageUseCase(message2);

		// Assert: Check that messages were processed
		expect(mockSavePersona).toHaveBeenCalledTimes(2); // Alice and Bob created
		expect(mockSaveChat).toHaveBeenCalledTimes(2); // 1. On creation, 2. on adding Bob
		expect(memoryChats.get("test:chat1")?.state.participantIds).toEqual([
			"test:persona1",
			"test:persona2",
		]);
		expect(mockMessageSent).toHaveBeenCalledTimes(2);

		// === 3. Stop the service ===
		await stopChatServiceUseCase({ channel: "test-channel" });

		// Assert: Check that the stop process was orchestrated correctly
		expect(mockStopListening).toHaveBeenCalledTimes(1);
		expect(mockStopListening).toHaveBeenCalledWith({ channel: "test-channel" });
		expect(mockServiceStopped).toHaveBeenCalledTimes(1);
		expect(mockServiceStopped).toHaveBeenCalledWith({
			channel: "test-channel",
		});
	});

	it("should throw a validation error for invalid input", async () => {
		// Arrange: Start the service to compose the app
		await startChatServiceUseCase({ channel: "test-channel", config: { token: "fake-token" } });

		// Act: Send an invalid payload (missing personaId)
		const invalidInput = {
			chatId: "test:chat1",
			personaName: "Alice",
			text: "Hello world",
		};

		// Assert: Check that the use case throws a Zod validation error
		await expect(async () => await receiveIncomingMessageUseCase(invalidInput)).toThrow();

		// Ensure no side effects occurred
		expect(mockSavePersona).not.toHaveBeenCalled();
		expect(mockSaveChat).not.toHaveBeenCalled();
	});
});
