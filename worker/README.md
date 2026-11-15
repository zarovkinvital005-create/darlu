# ИИ-сервер «Дарлу» (Cloudflare Worker)

Принимает свободный рассказ о человеке и возвращает разбор в виде тегов: кому, повод, увлечения, характер, бюджет и 1–2 предложения «что я понял».
Подбор подарков по этим тегам делает сайт (`docs/voice.js`, `docs/catalog.js`).

- Код: `worker.js` (вставляется целиком в Cloudflare → Workers & Pages → darlu-ai → Edit code → Deploy).
- ИИ: бесплатный Workers AI, привязка (binding) с именем `AI` в Settings → Bindings. Карта не нужна.
- По желанию: секрет `ANTHROPIC_API_KEY` (Settings → Variables and Secrets), тогда используется Claude.
- Адрес Worker прописан в `docs/config.js`.

## Состояние (14.11.2026)
Worker развёрнут и работает, но на сайте выключен (`docs/config.js` пуст): бесплатные модели Workers AI
(llama-3.3-70b, llama-4-scout, mistral-small) плохо разбирают русский рассказ и отвечают 8–16 секунд.
Чтобы включить ИИ, нужна платная модель: ключ Anthropic (секрет `ANTHROPIC_API_KEY`) или другой провайдер (например YandexGPT),
затем вписать адрес Worker в `docs/config.js`.
