import { setPortAdapter } from "@maxdev1/sotajs";
import { composeChatApp, startChatServiceUseCase, userInteractedOutPort } from "chat";
import { 
  composeApp as composeBotPersonaApp, 
  processUserInputUseCase, 
  startConversationUseCase, 
  componentRenderOutPort, 
  botPersonaDefinedOutPort, 
  defineBotPersonaUseCase
} from "bot-persona";
import { telegramPresenterAdapter } from "chat/src/infrastructure/platform/telegram.presenter";
import { jtbdQualifierBotDefinition } from "./jtbd-bot-definition"; // Выносим определение бота в отдельный файл

async function main() {
  console.log("🚀 Starting Showcase Telegram Bot...");

  // 1. Собираем оба контекста
  composeChatApp({ channel: 'telegram' });
  composeBotPersonaApp();

  // 2. Определяем, как контексты взаимодействуют друг с другом

  // Когда @chat ловит нажатие кнопки, он вызывает порт userInteractedOutPort.
  // Мы подписываемся на этот порт и вызываем use case из @bot-persona.
  setPortAdapter(userInteractedOutPort, async (interaction) => {
    console.log(`[Orchestrator]: Got interaction from @chat, routing to @bot-persona...`);
    await processUserInputUseCase(interaction);
  });

  // Когда @bot-persona хочет что-то отрендерить, он вызывает componentRenderOutPort.
  // Мы подписываемся на него и используем презентер из @chat для отображения в Telegram.
  setPortAdapter(componentRenderOutPort, telegramPresenterAdapter);

  // 3. Определяем и запускаем нашего бота

  // Перехватываем ID созданной личности бота, чтобы потом запустить диалог
  let botPersonaId: string;
  setPortAdapter(botPersonaDefinedOutPort, async (dto) => {
    console.log(`[Orchestrator]: Bot Persona "${dto.name}" defined with ID: ${dto.personaId}`)
    botPersonaId = dto.personaId;
  });

  // Определяем личность нашего JTBD-бота
  await defineBotPersonaUseCase(jtbdQualifierBotDefinition);

  if (!botPersonaId) {
    console.error("[Orchestrator]: Could not define Bot Persona. Shutting down.");
    return;
  }

  // TODO: Логику старта диалога нужно будет улучшить.
  // Сейчас мы просто стартуем один диалог для демонстрации.
  // В реальности, нужно стартовать диалог для каждого нового пользователя.
  const demoChatId = `telegram:${process.env.DEMO_CHAT_ID}`;
  if (!process.env.DEMO_CHAT_ID) {
    console.warn("[Orchestrator]: DEMO_CHAT_ID env variable is not set. Cannot start demo conversation.")
  } else {
    await startConversationUseCase({ botPersonaId, chatId: demoChatId });
  }

  // 4. Запускаем основной сервис прослушивания сообщений из Telegram
  await startChatServiceUseCase({ 
    channel: 'telegram', 
    config: { token: process.env.TELEGRAM_BOT_TOKEN } 
  });

  console.log(`✅ Showcase Telegram Bot is running. Send a message to your bot or press a button.`);
}

main().catch(console.error);