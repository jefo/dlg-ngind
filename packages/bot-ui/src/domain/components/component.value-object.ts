import { z } from 'zod';
import { createValueObject } from '@maxdev1/sotajs';

// Объект-значение для UI компонента
const ComponentSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
});

export const Component = createValueObject(ComponentSchema);
