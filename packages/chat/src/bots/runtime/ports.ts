import { createPort } from "@maxdev1/sotajs";
import type { ComponentRenderDto } from "./dtos";

export const componentRenderOutPort =
	createPort<(dto: ComponentRenderDto) => Promise<void>>();
