import { createPort } from "@maxdev1/sotajs";
import type { ViewProps } from "../../../ui";
import type { MessageProps } from "../../../messenging";

export const renderMessagePort =
	createPort<
		(dto: {
			view: ViewProps;
			data?: Record<string, unknown>;
		}) => Promise<MessageProps>
	>();
