# ИИ-сервер «Дарлу» (Cloudflare Worker)

Принимает рассказ о человеке, отправляет его в Claude вместе с каталогом и возвращает лучшие подарки.

1. Файл `worker.js` целиком вставляется в Cloudflare Worker (Workers & Pages → Create → Worker → Edit code).
2. В настройках Worker добавить секрет `ANTHROPIC_API_KEY` (Settings → Variables and Secrets → Secret).
3. Адрес Worker вписать в `docs/config.js` (`window.DARLU_API`).

После изменения каталога (`docs/products.js`) пересоберите файл: `python3 worker/build.py` и снова вставьте `worker.js` в Worker.
`template.js` это шаблон, `worker.js` собирается из него.
