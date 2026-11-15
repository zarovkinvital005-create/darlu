# ИИ-сервер «Дарлу» (Cloudflare Worker)

Принимает свободный рассказ о человеке и возвращает разбор в виде тегов: кому, повод, увлечения, характер, бюджет и 1–2 предложения «что я понял».
Подбор подарков по этим тегам делает сайт (`docs/voice.js`, `docs/catalog.js`).

- Код: `worker.js` (вставляется целиком в Cloudflare → Workers & Pages → darlu-ai → Edit code → Deploy).
- Модель: YandexGPT (`yandexgpt-lite`). В Settings → Variables and Secrets нужны: `YANDEX_API_KEY` (секрет) и `YANDEX_FOLDER_ID` (обычная переменная).
  Либо Claude: секрет `ANTHROPIC_API_KEY`.
- Адрес Worker вписан в `docs/config.js` (пусто = ИИ выключен, подбор по ключевым словам).
- Бесплатные модели Cloudflare Workers AI проверены и отключены: плохо понимают русский.
