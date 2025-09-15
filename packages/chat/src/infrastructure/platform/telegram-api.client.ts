const BASE_URL = "https://api.telegram.org/bot";

/**
 * Отправляет текстовое сообщение в указанный чат.
 */
export async function sendTelegramMessage(
	chatId: number,
	text: string,
	token: string,
): Promise<void> {
	console.log(`> Sending message to ${chatId}...`);
	const response = await fetch(`${BASE_URL}${token}/sendMessage`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ chat_id: chatId, text }),
	});

	if (!response.ok) {
		console.error(
			`Failed to send message: ${response.statusText}`,
			await response.json(),
		);
	}
}

/**
 * Получает обновления от Telegram с помощью long polling.
 */
export async function getTelegramUpdates(
	offset: number,
	token: string,
): Promise<any[]> {
	const response = await fetch(`${BASE_URL}${token}/getUpdates`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ offset, timeout: 30 }), // 30-секундный long polling
	});

	if (!response.ok) {
		console.error(`Failed to get updates: ${response.statusText}`);
		// В случае ошибки ждем 5 секунд перед повторной попыткой
		await new Promise((resolve) => setTimeout(resolve, 5000));
		return [];
	}

	const data: any = await response.json();
	return data.result || [];
}
