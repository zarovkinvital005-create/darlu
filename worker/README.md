# ИИ-сервер «Дарлу» (Cloudflare Worker)

Принимает свободный рассказ о человеке и возвращает разбор в виде тегов: кому, повод, увлечения, характер, бюджет и 1–2 предложения «что я понял».
Подбор подарков по этим тегам делает сайт (`docs/voice.js`, `docs/catalog.js`).

- Адрес: https://darlu-ai.vitalyzarovkin0.workers.dev (вписан в `docs/config.js`; пустая строка выключает ИИ).
- Модель: YandexGPT (`yandexgpt-lite`). В Cloudflare → Workers & Pages → darlu-ai → Settings → Variables and Secrets:
  `YANDEX_API_KEY` (секрет, API-ключ сервисного аккаунта darlu-ai, область yc.ai.languageModels.execute) и `YANDEX_FOLDER_ID` (каталог default).
- Запасной вариант: секрет `ANTHROPIC_API_KEY` (Claude), используется, если нет ключей Яндекса.
- Обновление кода: открыть Edit code, вставить `worker.js` целиком, Deploy.
  Копировать в буфер на macOS ТОЛЬКО так: `LC_ALL=en_US.UTF-8 pbcopy < worker/worker.js`, иначе русские слова портятся.
- Бесплатные модели Cloudflare Workers AI проверены и не годятся (плохо понимают русский).
