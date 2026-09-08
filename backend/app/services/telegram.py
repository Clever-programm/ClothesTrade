import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/sendMessage"


async def send_telegram_message(text: str) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.info("Telegram notifications are not configured, skipping message")
        return

    url = TELEGRAM_API_URL.format(token=settings.telegram_bot_token)
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                url, json={"chat_id": settings.telegram_chat_id, "text": text}
            )
            response.raise_for_status()
    except httpx.HTTPError:
        logger.exception("Failed to send Telegram notification")
