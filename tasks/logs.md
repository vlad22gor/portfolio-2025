# Logs

- 2026-03-11: Инициализированы `tasks/lessons.md` и `tasks/logs.md` по локальным правилам репозитория. Проверки: не применимо.
- 2026-03-11: Реализован базовый сетап портфолио на Astro + Tailwind под GitHub Pages.
  Причина: выполнить утверждённый план миграции с Framer на поддерживаемую Git-кодовую базу.
  Файлы: `astro.config.mjs`, `package.json`, `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/CaseCard.astro`, `src/data/cases.ts`, `src/data/gallery.ts`, `src/pages/index.astro`, `src/pages/cases.astro`, `src/pages/gallery.astro`, `src/pages/[slug].astro`, `src/styles/global.css`, `public/CNAME`, `public/robots.txt`, `public/media/*`, `.github/workflows/deploy.yml`, `tasks/setup-hosting.md`.
  Проверки: `npm run build` — успешно, сгенерированы маршруты `/`, `/cases`, `/gallery`, `/fora`, `/kissa`.
- 2026-03-11: Дополнил `README.md` инструкциями по локальному запуску, деплою и триггерам перехода на Cloudflare Pages.
  Причина: зафиксировать эксплуатационные шаги для запуска и поддержки проекта.
  Файлы: `README.md`.
  Проверки: `npm install` — успешно (up to date).
- 2026-03-11: Финальная верификация после всех правок.
  Проверки: `npm run build` — успешно, статические маршруты `/`, `/cases`, `/gallery`, `/fora`, `/kissa` собраны.
- 2026-03-11: Добавлен `public/sitemap.xml` и синхронизирован `public/robots.txt`.
  Причина: убрать ссылку на несуществующий sitemap и закрыть SEO-базу.
  Файлы: `public/sitemap.xml`, `public/robots.txt`.
  Проверки: `npm run build` — успешно.
- 2026-03-11: Создан публичный репозиторий `vlad22gor/portfolio-2025`, настроен `origin`, выполнен первый push ветки `main`.
  Причина: публикация проекта в GitHub для бесплатного GitHub Pages деплоя.
  Проверки: `git remote -v`, `git branch -vv`.

- 2026-03-11: Для нового репозитория включен GitHub Pages в режиме `workflow` через API, затем перезапущен workflow `Deploy Astro to GitHub Pages`.
  Причина: первый запуск упал с `404 Not Found` на шаге `actions/deploy-pages` из-за отключенного Pages.
  Проверки: `gh run watch` (run `22967774136`) — `success`; Pages URL: `https://vlad22gor.github.io/portfolio-2025/`.

- 2026-03-11: Реализован адаптивный reusable scallop-background для ключевых контейнеров без `PNG`.
  Причина: упростить поддержку нестандартного shape и сделать его управляемым через CSS-переменные.
  Файлы: `src/styles/global.css`, `src/components/CaseCard.astro`, `src/pages/index.astro`, `src/pages/gallery.astro`, `tasks/scallop-shape-requirements.md`.
  Проверки: `npm run build` — успешно; подтверждено наличие `scallop-surface` в целевых контейнерах и CSS (`mask`/`-webkit-mask` + fallback `@supports not`).

- 2026-03-11: Добавлен отдельный демонстрационный контейнер с scallop-фоном на главной странице и поднят локальный сервер для визуальной оценки.
  Причина: дать быстрый изолированный превью-блок с текущей реализацией shape на `localhost`.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`.
  Проверки: `npm run build` — успешно; `npm run dev -- --host 0.0.0.0 --port 4321` — сервер запущен, доступен `http://localhost:4321/`.

- 2026-03-11: Внедрён квантованный demo-контейнер `QuantizedScallop` (SVG + ResizeObserver) без артефактов углов.
  Причина: убрать дефекты в углах и реализовать подстройку размеров контейнера под целое число кругов (ширина `floor`, высота `ceil`).
  Файлы: `src/components/QuantizedScallop.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/scallop-shape-requirements.md`.
  Проверки: `npm run build` — успешно; `curl http://localhost:4321/` подтверждает рендер `data-quantized-scallop` на главной.

- 2026-03-11: Внедрены Figma-токены цвета и типографики, добавлены локальные `@font-face` и utility-классы `type-*`, обновлены color-алиасы без массового рефакторинга верстки.
  Причина: унифицировать дизайн-контракт проекта с Figma и зафиксировать требование кернинга `-2%` для `t1`/`t1-compact`.
  Файлы: `src/styles/global.css`, `public/fonts/GT-America-Regular.OTF`, `public/fonts/GT-America-Medium.OTF`, `public/fonts/Caveat-VariableFont_wght.ttf`.
  Проверки: `npm run build` — успешно; `curl -I http://127.0.0.1:4321/fonts/...` для 3 файлов — `200 OK`; Playwright computed styles — `body` использует `GT America`, `.type-t1`/`.type-t1-compact` показывают `letter-spacing` `-2.24px`/`-2.04px` (эквивалент `-0.02em`), `.type-description` использует `Caveat` c `font-weight: 450`.

- 2026-03-11: Реализован Quantized Scallop v2 с дефолтным `d=40` и новой формой `circle`.
  Причина: добавить нативную поддержку двух форм с единым API, устойчивым runtime и без corner-артефактов.
  Файлы: `src/components/QuantizedScallop.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/scallop-shape-requirements.md`, `tasks/lessons.md`.
  Проверки: `npm run build` — успешно; на главной рендерятся оба demo-блока (`rectangle` и `circle`) через `data-scallop-shape`.

- 2026-03-11: Разведены demo-контейнеры в независимые layout-слоты, чтобы формы не влияли на размеры друг друга.
  Причина: убрать визуальную деформацию секции demos из-за общего ряда с сильно разными высотами блоков.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`.
  Проверки: `npm run build` — успешно; `curl http://localhost:4321/` подтверждает структуру `scallop-preview-slot-rect` и `scallop-preview-slot-circle`.

- 2026-03-11: Расширена документация по Figma-инференсу для Quantized Scallop.
  Причина: зафиксировать ваше правило, что `pad` берётся из padding контейнера, а `shape` определяется по corner radius (`9999` -> `circle`, иначе `rectangle`).
  Файлы: `tasks/scallop-shape-requirements.md`, `tasks/figma-scallop-mapping.md`, `tasks/lessons.md`.
  Проверки: не запускались (изменения только в документации).

- 2026-03-11: Обновлён `.gitignore` для исключения локальных директорий `docs/`, `tasks/`, `fonts/`, `public/fonts/`.
  Причина: убрать из Git артефакты и локальные материалы, которые вы отметили как ненужные для GitHub.
  Файлы: `.gitignore`.
  Проверки: `git status --short` — новые untracked файлы из этих директорий перестали попадать в список.

- 2026-03-11: Скорректирован `.gitignore`: `public/fonts/` возвращён в отслеживание.
  Причина: обеспечить загрузку кастомных шрифтов на GitHub Pages.
  Файлы: `.gitignore`.
  Проверки: `git check-ignore -v public/fonts/GT-America-Regular.OTF` — совпадений нет (директория больше не игнорируется).

- 2026-03-11: Уточнены правила `.gitignore` до корневых (`/docs/`, `/tasks/`, `/fonts/`), чтобы `public/fonts/` не попадал под `fonts/`.
  Причина: предыдущее правило `fonts/` матчило любой сегмент `fonts` в пути, включая `public/fonts/`.
  Файлы: `.gitignore`.
  Проверки: `git check-ignore -v fonts/Caveat/OFL.txt` — игнорируется; `git check-ignore -v public/fonts/GT-America-Regular.OTF` — не игнорируется.
