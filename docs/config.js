/* Адрес ИИ-сервера (Cloudflare Worker darlu-ai, модель YandexGPT).
   Он разбирает свободный рассказ о человеке в теги; если сервер недоступен, сайт подбирает подарки по ключевым словам.
   Пустая строка выключает ИИ. */
window.DARLU_API = 'https://darlu-ai.vitalyzarovkin0.workers.dev';
