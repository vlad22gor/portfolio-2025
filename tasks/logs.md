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
