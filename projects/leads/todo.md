Отлично — сделаю TypeScript DSL для описания диалоговых flow, которое поддерживает три уровня детализации (High → Mid → Deep), вдохновлённое BPMN / state-machines / XState, но оптимизированное под твой «текстовый холст» (developer-first DSL).

Я дам:

понятную типизацию и примеры кода;

Fluent/Declarative API для написания сценариев;

правила вложенности (High → Mid → Deep) и как они композируются;

примитивы (Nodes, Transitions, Conditions, Actions, Slots, Scoring, Hooks);

краткую стратегию трансформации DSL → исполняемая машина (например, XState).

# Концепция (в двух словах)

High-level — эпизод/сцена в воронке (например: Intro, Qualify, BookCall). Это композиция mid-level блоков.

Mid-level — логический блок / шаг (например: Segmentation, NeedProbe). Может содержать вложенные deep-level ветки.

Deep-level — атомарные интеракции: вопрос/ответ, intent routing, slot filling, micro-dialogs, fallback handling. Обычно преобразуется в состояния конечного автомата.

Всё сериализуемо в JSON и валидируется (zod/ajv). DSL — одновременно UI (текстовый холст) и API для разработчика.

# API / Типы (TypeScript)
