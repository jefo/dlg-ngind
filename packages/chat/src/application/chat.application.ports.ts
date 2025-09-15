import { createPort } from "@maxdev1/sotajs";
import { z } from "zod";

// DTOs for application ports
export const MessageSentOutputSchema = z.object({
	messageId: z.string().uuid(),
	chatId: z.string(),
	senderId: z.string(),
	content: z.string(),
	timestamp: z.date(),
});

export type MessageSentOutput = z.infer<typeof MessageSentOutputSchema>;

// DTO for lifecycle ports
export const ServiceLifecycleInputSchema = z.object({
	channel: z.string(), // e.g., 'telegram', 'slack'
	config: z.any(), // Platform-specific config, e.g., { token: '...' }
});
export type ServiceLifecycleInput = z.infer<typeof ServiceLifecycleInputSchema>;


// === Driving Ports (called by the outside world) ===

// Port for sending a message (already exists, just for context)
// const sendMessageUseCase = ...

// Port for receiving a message (already exists, just for context)
// const receiveIncomingMessageUseCase = ...


// === Driven Ports (called by the application core) ===

export const startListeningPort = createPort<(input: ServiceLifecycleInput) => Promise<void>>();
export const stopListeningPort = createPort<(input: Pick<ServiceLifecycleInput, 'channel'>) => Promise<void>>();


// === Output Ports (for reporting results) ===

export const messageSentOutPort =
	createPort<(dto: MessageSentOutput) => Promise<void>>();

export const serviceStartedOutPort = createPort<(dto: { channel: string }) => Promise<void>>();
export const serviceStartFailedOutPort = createPort<(dto: { channel: string, reason: string }) => Promise<void>>();
export const serviceStoppedOutPort = createPort<(dto: { channel:string }) => Promise<void>>();
