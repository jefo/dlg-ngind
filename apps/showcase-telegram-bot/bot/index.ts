// apps/showcase-telegram-bot/bot/index.ts

import { formDefinition } from './form';
import { fsmDefinition } from './fsm';
import { viewDefinition } from './view';

/**
 * Собранное воедино определение нашего JTBD-бота.
 */
export const jtbdQualifierBotDefinition = {
  name: "JTBD Lead Qualifier Bot v1.1",
  formDefinition,
  fsmDefinition,
  viewDefinition,
};