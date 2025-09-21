import { createPort } from "@maxdev1/sotajs";
import type { ViewDto } from "./ui.dto";

export const telegramOutPort = createPort<(view: ViewDto) => Promise<void>>();
export const telegramErrorOutPort =
	createPort<(view: ViewDto) => Promise<void>>();

export const webOutPort = createPort<(view: ViewDto) => Promise<void>>();
export const webErrorOutPort = createPort<(view: ViewDto) => Promise<void>>();
