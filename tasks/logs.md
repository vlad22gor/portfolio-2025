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

- 2026-03-11: Реализован `QuantizedWave` для геометрического волнистого divider без PNG/SVG-ассетов и без `mask`.
  Причина: заменить повторяющиеся статические волнистые ресурсы на параметризуемый runtime с квантованием ширины по экваторным точкам.
  Файлы: `src/components/QuantizedWave.astro`, `src/styles/global.css`, `src/pages/index.astro`.
  Проверки: `npm run build` — успешно; `rg -n "data-quantized-wave" dist/index.html` подтверждает рендер divider с `data-wave-edge="equator"`.

- 2026-03-11: Доработан `QuantizedWave` под строгую геометрию из полуокружностей (`d=8`, `stroke=2`) без `mask`.
  Причина: привести divider к нативной и предсказуемой модели, где длина строится только количеством кружков и края всегда остаются в экваторе.
  Файлы: `src/components/QuantizedWave.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/lessons.md`.
  Проверки: `npm run build` — успешно; `rg -n "data-wave-diameter|data-wave-stroke|data-wave-phase" dist/index.html` подтверждает новые параметры divider; `rg -n "mask" src/components/QuantizedWave.astro` — совпадений нет.

- 2026-03-12: Реализован fixed desktop header из Figma (`header` + `header-button`) с route-active wave underline и единым breakpoint `1360`.
  Причина: внедрить новый top navigation по Figma, закрепить header сверху и убрать прежнюю mobile-адаптацию до отдельного этапа.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/lessons.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-12: Исправлен active-state header для статических URL с завершающим `/`.
  Причина: в SSG `Astro.url.pathname` возвращает `/cases/` и `/gallery/`, что ломало прямое сравнение с `/cases` и `/gallery`.
  Файлы: `src/components/SiteHeader.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; проверка `dist/cases/index.html` и `dist/gallery/index.html` подтверждает корректный `aria-current="page"` у нужного пункта.

- 2026-03-12: Доработан `header-button` под Figma-контракт (`5:5360`): top-aligned геометрия `h=40`, hug `label container` с `padding-inline: 8px`, и spring-hover для `selected` (`gap 3 -> 8`).
  Причина: убрать вертикические скачки лейбла между типами `default/selected` и привести hover-поведение selected-кнопки к ожидаемой пружинной анимации.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `package.json`, `package-lock.json`, `tasks/lessons.md`.
  Проверки: `npm run build` — успешно; проверка `dist` подтверждает новую структуру `header-button-content/label-container/wave-container` и корректный route-active на `/`, `/cases`, `/gallery`.

- 2026-03-12: Внедрён новый footer из Figma (`node 8:6137`) c full-bleed фоном, центрированной композицией `2026px` и обрезкой краёв на узких ширинах; добавлен sticky-bottom для коротких страниц.
  Причина: реализовать утверждённый дизайн footer и поведение «закреплён снизу» без `position: fixed`.
  Файлы: `src/components/SiteFooter.astro`, `src/styles/global.css`, `public/media/motifs/*.svg`.
  Проверки: `npm run build` — успешно; `rg -n "a thing of beauty|site-footer|motif-sunburst-rounded-12" dist/*/index.html dist/index.html` подтверждает новый footer на `/`, `/cases`, `/gallery`, `/fora`, `/kissa`.

- 2026-03-12: Добавлено игнорирование временного экспортного буфера `assets/` и обновлено правило lessons по потоку ассетов.
  Причина: хранить production-ассеты в `public/media/...`, а `assets/` использовать только как временный источник экспорта.
  Файлы: `.gitignore`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `git check-ignore -v assets/motifs/motif-sunburst-rounded-12.svg` показывает правило `.gitignore:30:/assets/`.

- 2026-03-12: Исправлено центрирование внутреннего трека footer при ширине окна меньше `2026px`.
  Причина: `margin-inline: auto` не центрировал переполняющий трек; контент смещался влево при обрезке.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173`) показывает `centerDelta: 0` на `/`, `/cases`, `/gallery`, `/fora`, `/kissa`; при viewport `1440x2200` для `/cases` `footerTouchesBottom: true`.

- 2026-03-12: Исправлена невидимая spring-анимация `gap` у `header-button` и добавлен режим `fit="cover"` для wave в header.
  Причина: `--header-button-gap` записывался в `px`, что конфликтовало с `calc(var(--header-button-gap) * 1px)`; wave считалась через floor и могла быть уже лейбла.
  Файлы: `src/components/SiteHeader.astro`, `src/components/QuantizedWave.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` по `dist/_astro/*.js` подтверждает запись `--header-button-gap` без `px` и наличие `data-wave-fit=\"cover\"` у header-wave.

- 2026-03-12: Footer переведён на `QScallop` через `QuantizedScallop` (`rectangle`, `step=40`, `bg=accent-blue`, `pad=80px 0`).
  Причина: контейнер футера в Figma помечен как `QScallop`; требуются реальные scallop-кружки по краям, а не плоский прямоугольник.
  Файлы: `src/components/SiteFooter.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright на `http://127.0.0.1:4173` подтверждает для `/`, `/cases`, `/gallery`, `/fora`, `/kissa`: `data-quantized-scallop=true`, `data-ready=true`, `data-scallop-step=40`, `data-scallop-shape=rectangle`, `noHorizontalScroll=true`, `centerDelta=0`, `footerAfterMain=true`; при viewport `1200x1009` горизонтального скролла нет на всех маршрутах.

- 2026-03-12: Исправлена геометрия `header-button`: ширина кнопки отвязана от wave, волна центрируется от `label container` и не клиппится контейнерами.
  Причина: на разных страницах ширина активной кнопки зависела от wave; underline визуально смещался влево и мог обрезаться.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-12: Зафиксирован inside-fit контракт для `QScallop` в документации как базовое правило.
  Причина: квантизация должна вписывать scallop-границы внутрь размеров контейнера из Figma (без роста формы наружу).
  Файлы: `tasks/figma-scallop-mapping.md`, `tasks/scallop-shape-requirements.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `rg -n "inside-fit|height = rows \* d|ceil" tasks/figma-scallop-mapping.md tasks/scallop-shape-requirements.md tasks/lessons.md` — подтверждено наличие inside-fit правил и отсутствие `ceil` как основного правила для `rectangle`.
  TODO: выполнить отдельную задачу синхронизации runtime `QuantizedScallop` с inside-fit контрактом (в т.ч. обработка кейса `designSize < d`).

- 2026-03-12: Исправлено схлопывание ширины wave в `header-button` (одинаково короткая линия на всех страницах).
  Причина: в overlay-режиме измеряемый родитель wave мог иметь `clientWidth <= 1`, из-за чего `fit=cover` всегда давал `1` кружок.
  Файлы: `src/styles/global.css`, `src/components/QuantizedWave.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; по коду `.header-button-wave` теперь имеет `width: 100%`, а `QuantizedWave` использует fallback до ближайшего предка с `clientWidth > 1`.

- 2026-03-12: Обновлён footer под inside-fit правило `QScallop`: уменьшен вертикальный `pad` в `QuantizedScallop` с `80px` до `78px`.
  Причина: исключить рост квантизованной высоты до `360` при `d=40` и удержать внешнюю scallop-границу внутри Figma-контейнера `324px`.
  Файлы: `src/components/SiteFooter.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173`) для `/`, `/cases`, `/gallery`, `/fora`, `/kissa` показывает `data-ready=true`, `step=40`, `scallopH=320`, `insideFitVsDesign=true`, `deltaFromDesign=4`, `noHorizontalScroll=true`, `centerDelta=0`.

- 2026-03-12: Реализовано исключение footer `QScallop`: квантация только по верхней грани (`rectangleEdges="top"`).
  Причина: для футера требуется scallop только сверху, при прямых нижней/боковых гранях, без влияния на остальные `QuantizedScallop` кейсы.
  Файлы: `src/components/QuantizedScallop.astro`, `src/components/SiteFooter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173`) на `/`, `/cases`, `/gallery`, `/fora`, `/kissa` подтверждает `data-scallop-rectangle-edges=top`, `data-ready=true`, `step=40`, `scallopH=320`, `insideFitVs324=true`, `noHorizontalScroll=true`, `centerDelta=0`, отсутствие нижних/боковых scallop-кругов (`hasBottomCircles=false`, `hasInteriorSideRows=false`); регрессия main demo отсутствует (`edges=all`, `hasTop=true`, `hasBottom=true`, `hasSideRows=true`).

- 2026-03-12: Убран клиппинг концов wave в `header-button` на уровне SVG viewport.
  Причина: края stroke у `QuantizedWave` резались границами `wave-frame`; визуально это выглядело как обрезка на верхнем уровне кнопки.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; по коду `QuantizedWave` в header снова `align="center"`, а `.quantized-wave .wave-frame` имеет `overflow: visible`.

- 2026-03-12: Уменьшена длина header-wave на `-1` кружок в режиме `fit="cover"`.
  Причина: текущая волна визуально выглядела длиннее ожидаемого в header-button.
  Файлы: `src/components/QuantizedWave.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в ветке `fit=cover` применяется `ceil(width / d) - 1` с безопасным clamp (`>= minCircles`, `>= 1`).

- 2026-03-12: Убраны видимые боковые просветы футера и добавлена визуальная компенсация по вертикали.
  Причина: при inside-fit по ширине у `QScallop` оставались боковые зазоры на некоторых viewport; нужно скрыть их без нарушения top-only scallop и inside-fit.
  Файлы: `src/styles/global.css`, `src/components/SiteFooter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174`) на `/`, `/cases`, `/gallery`, `/fora`, `/kissa` при viewport `1366`, `1512`, `1728` подтверждает `footerBg=rgb(140, 191, 219)`, `data-scallop-rectangle-edges=top`, `data-ready=true`, `step=40`, `scallopH=320`, `insideFitVs324=true`, `noHorizontalScroll=true`, `centerDelta=0`, отсутствие нижних/боковых scallop-кругов (`hasBottomCircles=false`, `hasInteriorSideRows=false`); регрессия demo отсутствует (`edges=all`, `hasTop=true`, `hasBottom=true`, `hasSideRows=true`).

- 2026-03-12: Устранён route-transition layout shift (видимое дёрганье header/контента) через стабилизацию scrollbar gutter на root.
  Причина: при переходах между страницами менялось наличие вертикального скролла, из-за чего пересчитывалась viewport-ширина и центрированные контейнеры с fixed-header смещались.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в CSS добавлены `html { scrollbar-gutter: stable both-edges; }` и fallback `@supports not (scrollbar-gutter: stable) { html { overflow-y: scroll; } }`.

- 2026-03-12: Восстановлена видимость верхних scallop-кругов у футера после заливки боковых зазоров.
  Причина: сплошной фон на `.site-footer` делал top-only scallop визуально плоским; кружки терялись на верхней грани.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174`) при viewport `1366`, `1512`, `1728` подтверждает `::before top=20px`, `::before background=rgb(140, 191, 219)`, `hasTopCircles=true`, `hasBottomCircles=false`, `insideFitVs324=true`, `noHorizontalScroll=true`.

- 2026-03-12: Добавлена hover-анимация rotate `0 ↔ 180` для footer motifs с profile-based spring (`slow`/`fast`).
  Причина: внедрить интеракцию по ховеру без изменения геометрии footer (top-only scallop, inside-fit, padding `84/72`).
  Файлы: `src/components/SiteFooter.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в коде настроены профили `slow` (`duration: 1.35`, `bounce: 0.25`) для `motif-sunburst-rounded-12` и `motif-scallop-disc-20`, `fast` (`duration: 1.05`, `bounce: 0.25`) для остальных motif; добавлен `prefers-reduced-motion` fallback и остановка предыдущего animation control через `WeakMap`.

- 2026-03-12: Реализован переход на Astro `ClientRouter` и стабилизация route-transition без микродёрганий хедера.
  Причина: убрать full-reload jank при клике в fixed-header, сохранить стабильную геометрию active-wave и обеспечить корректный re-mount runtime-компонентов после soft navigation.
  Файлы: `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/QuantizedWave.astro`, `src/components/QuantizedScallop.astro`, `src/pages/index.astro`, `src/pages/cases.astro`, `src/pages/gallery.astro`, `src/pages/[slug].astro`, `src/styles/global.css`, `public/fonts/GT-America-Regular.woff2`, `public/fonts/GT-America-Medium.woff2`, `public/fonts/Caveat-VariableFont_wght.woff2`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "ClientRouter|transition:persist|astro:page-load|data-astro-prefetch|woff2" src` подтверждает включённые переходы, idempotent runtime и загрузку `woff2`; `rg -n "transition:name=\"page-content\"" src/pages` подтверждает единый transition-anchor main-контента на всех маршрутах.

- 2026-03-12: Добавлена документация подхода `Astro Client Router` для переиспользования в будущих проектах.
  Причина: зафиксировать устойчивый шаблон устранения route-transition микродёрганий (переходы, idempotent runtime, preload/woff2, чеклист валидации).
  Файлы: `docs/astro-client-router-stability.md`, `tasks/logs.md`.
  Проверки: `test -f docs/astro-client-router-stability.md` — успешно; `rg -n \"ClientRouter|astro:page-load|transition:persist|CLS\" docs/astro-client-router-stability.md` — ключевые секции присутствуют.

- 2026-03-12: Реализован альтернативный `header`-вариант `wave-rail` (цельная базовая волна + бегущий активный сегмент с spring-перемещением).
  Причина: протестировать сценарий, где underline не телепортируется под новый таб, а пружинно перемещается по треку, включая optimistic start на `pointerdown`.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; ручная проверка через Playwright + `PUBLIC_HEADER_WAVE_VARIANT=wave-rail` подтверждает `data-wave-variant=wave-rail`, `data-wave-rail-ready=true`, optimistic-сдвиг сегмента до смены URL на `pointerdown`, корректный reconcile `active`/`aria-current` после перехода на `/cases`.

- 2026-03-12: `wave-rail` переключён в дефолтный режим `SiteHeader`.
  Причина: по запросу включить новый альтернативный header как основной вариант без обязательного env-флага.
  Файлы: `src/components/SiteHeader.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-12: `wave-rail` переведён на модель одной волны с `path trim` вместо двух слоёв (`base + active`).
  Причина: убрать дублирование/пересвет волны и получить ожидаемое поведение «одна большая волна, видим только сегмент под активным табом».
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4321`) подтверждает в rail ровно одну волну (`wavesInRail=1`), наличие trim-стилей у единственного `path` (`strokeDasharray`/`strokeDashoffset`), optimistic-сдвиг сегмента на `pointerdown` до смены URL и корректный `active`/`aria-current` после перехода на `/cases`.

- 2026-03-12: Исправлена центровка trim-сегмента для `gallery` в `wave-rail` через full-span rail-wave и trim относительно реальной геометрии волны.
  Причина: при короткой rail-волне (`cover` с `ceil-1`) правый таб визуально смещался влево, так как сегмент не помещался в доступную длину path.
  Файлы: `src/components/QuantizedWave.astro`, `src/components/SiteHeader.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; Playwright (`http://127.0.0.1:4321`) подтверждает `waveW=248 >= railW-1`, `centerDelta=0` для `/`, `/cases`, `/gallery`, optimistic trim-движение на `pointerdown` до смены URL.

- 2026-03-12: Усилен bounce trim-анимации в `wave-rail` для заметного визуального переразгона.
  Причина: при прежних spring-параметрах движение выглядело слишком затухшим и почти без видимого bounce.
  Файлы: `src/components/SiteHeader.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; для `x` и `width` trim установлены `stiffness: 300`, `damping: 18`, `mass: 0.75`.

- 2026-03-12: Для trim-анимации `wave-rail` задана явная длительность `0.35s`.
  Причина: требуется контролируемое время анимации вместо полностью физического расчёта spring-параметров.
  Файлы: `src/components/SiteHeader.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; для `x` и `width` используется `type: spring` + `duration: 0.35`.

- 2026-03-12: Стабилизирована trim-анимация `wave-rail` при soft navigation (`Instant nav`) и увеличена длительность до `~1.05s`.
  Причина: устранить ощущение слишком быстрой/жёсткой анимации и микродёрганье в середине пути при `ClientRouter` переходе.
  Файлы: `src/components/SiteHeader.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; Playwright (`http://127.0.0.1:4321`) подтверждает сокращение layout-чтений для trim за переход (`railRect/waveRect/pathLen: 54/54/54 -> 2/2/2`), settle-время pointerdown-only около `963ms`, и снижение скачка `--wave-segment-x` в навигационном сценарии (`maxJump: 91.474 -> 35.307`).

- 2026-03-12: Добавлен симметричный overscan path для `wave-rail` (`cover-bleed`, `bleedCircles=2`) для корректного bounce на правом крае `gallery`.
  Причина: при `gallery` trim-сегмент упирался в конец path, поэтому правый край визуально терял bounce.
  Файлы: `src/components/QuantizedWave.astro`, `src/components/SiteHeader.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; Playwright (`http://127.0.0.1:4321`) подтверждает `waveW=280` при `railW≈247.96`, `waveOffset=-16`, центрирование сегмента без дрейфа для `/`, `/cases`, `/gallery` (`centerDelta=0`), правый запас у `gallery` (`rightSlackLocal≈16.08`), сохранение low-cost trim-цикла (`railRect/waveRect/pathLen: 2/2/2`) и отсутствие клипа trim при движении к `gallery` (`stuckWhileXIncreases=0`).

- 2026-03-12: Возвращён hover/focus-эффект для `wave-rail` через вертикальный offset общей rail-волны.
  Причина: в текущей архитектуре `wave-rail` gap у кнопки всегда обнулялся, поэтому старая hover-анимация `gap` не могла срабатывать.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; Playwright (`http://127.0.0.1:4321`) подтверждает: на активной кнопке `--wave-rail-hover-offset` анимируется примерно `0 -> 4.9` по `pointerenter/focus` и возвращается к `~0` по `pointerleave/blur`, на неактивной кнопке offset не меняется (`0`), `astro:page-load` сбрасывает offset в `0`, `pointerdown` trim и hover-offset работают параллельно без конфликта.

- 2026-03-12: Добавлена визуальная компенсация `wave-rail` — базовый сдвиг волны вверх на `4px` в idle и hover состояниях.
  Причина: приблизить позиционирование rail-волны к дизайну без изменения trim-логики и без влияния на `classic`.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; runtime-проверка через Playwright MCP не выполнена из-за ошибки запуска браузера (`Opening in existing browser session`).

- 2026-03-12: Исправлен `wave-rail` после soft navigation: base-offset теперь стабилен, hover корректно определяется на активном табе, rail не мигает fallback-волной.
  Причина: `wave-rail` терял визуальную консистентность из-за опоры на `active`-класс и сброса `data-wave-rail-ready` при временной неготовности trim-метрик.
  Файлы: `src/components/SiteHeader.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно.

- 2026-03-12: Для `wave-rail` убран ложный hover от `focus`/app-refocus: offset теперь активируется только pointer-наведением активного route-таба.
  Причина: после кликов и `Command+Tab` hover-состояние включалось без реального наведения из-за связки `focus` + optimistic active-state.
  Файлы: `src/components/SiteHeader.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно.

- 2026-03-12: Снижен подлаг `wave-rail` при route-transition без смены архитектуры (`Astro ClientRouter` сохранён).
  Причина: при soft navigation на `astro:page-load` выполнялся массовый `scheduleAll()` для `QuantizedWave/QuantizedScallop`, что создавало лишнюю main-thread нагрузку параллельно анимации хедера.
  Файлы: `src/components/SiteHeader.astro`, `src/components/QuantizedWave.astro`, `src/components/QuantizedScallop.astro`, `src/components/CaseCard.astro`, `src/pages/gallery.astro`, `src/pages/[slug].astro`, `src/components/SiteFooter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; prefetch у хедера переключён на `data-astro-prefetch="viewport"`; для non-LCP изображений добавлен `decoding="async"`, для hero-кейса оставлен eager (`loading="eager"`, `fetchpriority="high"`).

- 2026-03-12: Обновлена документация по стабильным переходам Astro Client Router с учётом последних оптимизаций wave-header.
  Причина: зафиксировать принятый production-паттерн (ранний prefetch top-nav, mount-only на `astro:page-load`, разделение lazy/eager загрузки медиа) без распыления по новым md-файлам.
  Файлы: `docs/astro-client-router-stability.md`, `README.md`, `tasks/logs.md`.
  Проверки: docs-only изменение; верифицированы diff и структура секций (`prefetch`, `mountNewRoots`, `lazy/eager media`) в `docs/astro-client-router-stability.md`.

- 2026-03-12: Выполнена миграция sans-типографики `GT America` -> variable `DM Sans` с axis-токенами (`opsz`, `wght`) и обновлённым отрицательным кернингом для `t1`/`t1-compact` до `-3%`.
  Причина: перейти на бесплатный variable-шрифт и дать ручной контроль начертаний через axis для визуальной подстройки рендеринга.
  Файлы: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `public/fonts/DMSans-VariableFont_opsz,wght.ttf`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `curl -I http://127.0.0.1:4321/fonts/DMSans-VariableFont_opsz,wght.ttf` — `200 OK`; `rg -n "GT America|GT-America" src public` — совпадений нет; `rg -n "tracking-tight-2pct" src/styles/global.css` — совпадений нет; Playwright computed-styles check не выполнен из-за блокера запуска браузера (`Opening in existing browser session`).

- 2026-03-12: Стабилизирован `wave-rail` после догрузки шрифтов и добавлен защитный hidden-dash для rail-path.
  Причина: убрать фликер fallback-шрифта/метрик при route-switch и исключить появление полной волны до/после пересчёта trim.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-12: Глобально подключён `Agentation MCP` для `Codex App` и добавлен runbook для рабочего процесса с аннотациями.
  Причина: внедрить MCP-only сценарий для текущего Astro-стека (без React-toolbar) и зафиксировать повторяемую операционную инструкцию.
  Файлы: `~/.codex/config.toml`, `~/.codex/config.toml.bak.20260312-181756`, `~/.codex/docs/agentation-codex.md`, `tasks/logs.md`.
  Проверки: `npx -y add-mcp --agent codex --global --yes --name agentation "npx -y agentation-mcp server"` — успешно; `npx -y agentation-mcp doctor` — успешно; `rg -n "mcp_servers.agentation|agentation-mcp" ~/.codex/config.toml` — секция найдена; health-check `curl http://localhost:4747/health` — `{"status":"ok","mode":"local"}`; fallback-check `npx -y agentation-mcp server --port 8080` + `curl http://localhost:8080/health` — `{"status":"ok","mode":"local"}`.

- 2026-03-12: Реализована интеграция Agentation для Astro в режиме `dev-only` через React island с сохранением текущего runtime (`ClientRouter`, wave/scallop scripts).
  Причина: повысить полезность UX-итераций (visual annotations + MCP workflow), не затрагивая production-поведение и не ломая существующие route transitions.
  Файлы: `package.json`, `package-lock.json`, `astro.config.mjs`, `src/components/dev/AgentationToolbar.tsx`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `.env.example`, `README.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n 'id="agentation-dev-root"|/agentation' dist/*.html dist/*/index.html` — совпадений нет (toolbar отсутствует в prod HTML); `npm run dev -- --host 127.0.0.1 --port 4331` + `curl` — `id="agentation-dev-root"` отсутствует (toolbar выключен по умолчанию); `npm run dev:annotate -- --host 127.0.0.1 --port 4332` + `curl` — `id="agentation-dev-root"` присутствует и endpoint `http://localhost:4747` проброшен; Playwright (soft-nav через dispatch click по header links) на `http://127.0.0.1:4336` подтверждает `hasDevRoot=true` на `/`, `/cases`, `/gallery`; Agentation MCP E2E-check — создана тестовая annotation через `POST /sessions/:id/annotations`, подтверждён pending через `agentation_get_all_pending`, затем выполнены `agentation_acknowledge` и `agentation_resolve` (pending вернулся к `0`).

- 2026-03-12: Добавлен dev-helper hotkey для Agentation: `Alt+Shift+B` переключает `Block page interactions`.
  Причина: ускорить UX-проверки без ручного открытия настроек Agentation на каждом цикле.
  Файлы: `src/components/dev/AgentationToolbar.tsx`, `README.md`, `tasks/logs.md`.
  Проверки: Playwright на `http://127.0.0.1:4337` подтвердил переключение чекбокса `Block page interactions` (`checked: false -> true`) по `Alt+Shift+B`; в консоли появился лог `[Agentation] Block page interactions ...`; `npm run build` — успешно.

- 2026-03-12: Зафиксирован постоянный runbook запуска Agentation для будущих сессий.
  Причина: убрать неопределённость по командам запуска и разделить режимы `annotate`/обычный `dev`.
  Файлы: `tasks/agentation-workflow.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `test -f tasks/agentation-workflow.md` — успешно; `rg -n "dev:annotate|agentation-mcp server|Alt \\+ Shift \\+ B" tasks/agentation-workflow.md tasks/lessons.md` — успешно.

- 2026-03-12: Исправлен фон `scallop-content` в preview-блоке по аннотации Agentation.
  Причина: пользователь запросил `bg default darkened` для `.scallop-preview-grid > .scallop-preview-slot > .quantized-scallop > .scallop-content`.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4321`) computed style для `.scallop-preview-grid .quantized-scallop .scallop-content` = `rgb(207, 206, 196)` (соответствует `--color-bg-darkened`).

- 2026-03-12: Стабилизирован `wave-rail` при route-transition с приоритетом «stability first».
  Причина: волна периодически пропадала после soft navigation из-за гонки между sticky-ready, trim-метриками и скрытым dash-path.
  Файлы: `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; `rg -n "stroke-dasharray:\\s*0 1|loadingdone|railTrimRetryWindowMs|scheduleRailTrimSync|shouldKeepOptimisticMotion" src/components/SiteHeader.astro src/styles/global.css` подтверждает: hidden-dash удалён, `loadingdone` переведён на лёгкий re-trim, retry сделан time-based (`1000ms`), optimistic reconcile теперь запускает `applyStateTrim + scheduleTrimRetry`; массовая runtime-проверка 50–100 переходов не выполнена из-за блокера Playwright MCP (`Opening in existing browser session`).

- 2026-03-12: В `SiteHeader` добавлена отложенная soft-navigation для внутренних кликов хедера (`2x RAF + fallback 120ms`) с отменой pending-перехода при повторном тапе.
  Причина: развести по времени optimistic `wave-rail` анимацию и запуск `ClientRouter` навигации, чтобы снизить main-thread подлаг в момент тапа.
  Файлы: `src/components/SiteHeader.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; проверка diff подтверждает импорт `navigate` из `astro:transitions/client`, перехват internal click c `preventDefault/stopPropagation`, запуск `navigate()` через отложенный контроллер и очистку pending-таймеров на `beforeunload/pagehide`.

- 2026-03-12: Исправлен проскок волны на длинных tab-hop: навигация переведена на адаптивный delay-gate (`120..260ms`) вместо раннего старта по `2x RAF`.
  Причина: при длинном перемещении rail-сегмента подгруз страницы начиналась слишком рано (около пары кадров), из-за чего swap приходился на середину движения волны.
  Файлы: `src/components/SiteHeader.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; проверка diff подтверждает: расчет `ratio` по дистанции центров сегмента (`current` -> `target`) относительно ширины трека, задержка `delayMs = clamp(120..260)`, `navigate()` вызывается только по `setTimeout(delayMs)`, keyboard-click (`event.detail===0`) не задерживается, cleanup pending-навигации сохранен (`beforeunload/pagehide`).

- 2026-03-12: Для сглаживания длинного tab-hop увеличен максимум adaptive delay до `320ms` и включён глобальный prefetch (`prefetchAll + defaultStrategy='load'`) с исключением кейс-деталок.
  Причина: немного не хватало задержки для визуально цельного хода/баунса волны; дополнительно нужно снизить риск сетевой задержки на top-level переходах без prefetch `/fora` и `/kissa`.
  Файлы: `src/components/SiteHeader.astro`, `astro.config.mjs`, `src/components/CaseCard.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "let f=!0,h=\\\"load\\\"" dist/_astro/index*.js` подтверждает prefetch runtime (`prefetchAll=true`, `defaultStrategy='load'`); `rg -o 'href=\"/fora\"[^>]*>' dist/index.html dist/cases/index.html` и аналогично для `/kissa` подтверждают `data-astro-prefetch=\"false\"`; delay-limit в хедере поднят до `320ms`.

- 2026-03-12: Обновлён `tasks/lessons.md` по новой устойчивой стратегии `wave-rail` (`120..320ms` + global prefetch `load` с opt-out для `/fora` и `/kissa`).
  Причина: пользователь подтвердил корректировку требования по задержке, нужно закрепить новое правило без противоречий.
  Файлы: `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: docs-only изменение; `rg -n \"120..320ms|prefetchAll|data-astro-prefetch='false'\" tasks/lessons.md` — успешно.

- 2026-03-13: Добавлен reusable `Button` из Figma `12:1029` с поддержкой `icon-left/right`, hover `opacity: 0.9` и pressed spring `scale: 0.9`; интегрирован в hero секцию.
  Причина: реализовать компонентный контракт кнопок по актуальному Figma-handoff, включая `bordered-icon-left` и токенизированное окрашивание SVG-стрелок без отдельных hover-ассетов.
  Файлы: `src/components/Button.astro`, `src/pages/index.astro`, `public/media/icons/button/arrow-button-left.svg`, `public/media/icons/button/arrow-button-right.svg`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-13: Скорректирован `pressed` scale у `Button` с `0.9` до `0.95`.
  Причина: пользователь уточнил более мягкую амплитуду нажатия.
  Файлы: `src/components/Button.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-13: Исправлен показ полной `wave-rail` после route-transition.
  Причина: при re-render в `QuantizedWave` path пересоздавался через `svg.innerHTML`, из-за чего inline trim стили терялись и временами показывалась вся волна.
  Файлы: `src/components/QuantizedWave.astro`, `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; `rg -n "quantized-wave:rendered|emitWaveRendered|handleWaveRendered|stroke-dasharray:\\s*0 1|waveRailReady = 'false'" src/components/QuantizedWave.astro src/components/SiteHeader.astro src/styles/global.css` подтверждает: добавлен event после реального re-render path, `SiteHeader` подписан на event и запускает immediate re-trim/retry, hidden-dash для rail-path восстановлен, при истечении retry-окна rail переводится в `data-wave-rail-ready='false'` (controlled fallback).

- 2026-03-13: Зафиксирован контракт `wave-rail = rail-only` и устранён дрейф центровки на крайних табах.
  Причина: повторяемость бага возникала из-за переключения между rail и button-fallback, плюс trim по start-координате давал визуальный перекос на `gallery`.
  Файлы: `src/components/SiteHeader.astro`, `src/components/QuantizedWave.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `PUBLIC_HEADER_WAVE_VARIANT=classic npm run build` — успешно; `rg -n "lastGoodTrim|hasEverReady|applyCachedTrim|windowsLeft|centerLen|quantized-wave:rendered|site-nav-track\\[data-wave-variant='wave-rail'\\] \\.header-button-wave-container" src/components/SiteHeader.astro src/components/QuantizedWave.astro src/styles/global.css` подтверждает: добавлены `lastGoodTrim/hasEverReady`, timeout-recovery через cached trim, trim считает `startLen` от `centerLen`, fallback-подкнопочная волна отключена для `wave-rail` независимо от `ready`.

- 2026-03-14: Выполнен rollback неполной perimeter-ветки на главной и восстановлена стабильная сборка.
  Причина: `src/pages/index.astro` содержал orphan-import `QuantizedPerimeter` при отсутствии `src/components/QuantizedPerimeter.astro`, что ломало `astro build` после кросс-девайс синхронизации незакомиченных правок.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "QuantizedPerimeter" src` — совпадений нет; `.astro.bak.1773417960/` удалена (в `git status` отсутствует).

- 2026-03-14: Реализован `QuantizedPerimeter v1` с новым edge-pattern `totem`, а `QuantizedScallop` переведён в backward-compatible wrapper.
  Причина: расширить систему квантованных форм новыми краевыми паттернами без регрессии существующих `rectangle/circle` сценариев и закрепить масштабируемую архитектуру.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/scallop-shape-requirements.md`, `tasks/figma-scallop-mapping.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "data-quantized-perimeter|data-perimeter-edge-pattern=\"totem\"|data-perimeter-edges=\"top\"|data-scallop-rectangle-edges=\"top\"|data-scallop-shape=\"circle\"" dist/index.html dist/*/index.html` подтверждает рендер `scallop(all/top)`, `totem(all/top)` и совместимость `data-scallop-*`; `rg -n "QuantizedPerimeter|edgePattern=\"totem\"|rectangleEdges=\"top\"|shape=\"circle\"" src/pages/index.astro src/components/SiteFooter.astro src/components/QuantizedScallop.astro` подтверждает API-контракт и сохранение footer top-only.

- 2026-03-14: Исправлена невидимость краевых шейпов в demo-каталоге (`scallop`/`totem`) на localhost.
  Причина: `.scallop-preview .scallop-content` имел сплошной фон, который перекрывал SVG-подложку edge-shape и визуально давал прямоугольник.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "\.scallop-preview \.scallop-content\s*\{|background:\s*transparent" src/styles/global.css` подтверждает прозрачный фон контентного слоя; правило в lessons обновлено под root-слой `--scallop-bg`.

- 2026-03-14: Возвращена заливка demo-карточек с сохранением edge-shape через системный фикс CSS-переменных.
  Причина: `--scallop-bg` и `--scallop-pad` задавались inline-дефолтом в `QuantizedPerimeter/QuantizedScallop`, из-за чего класс `.scallop-preview` не мог переопределить цвет поверхности; после прозрачного `.scallop-content` форма визуально сливалась с фоном страницы.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; проверка `dist/index.html` через `node` подтверждает для preview-карточек inline-style только с `--scallop-line-clamp` (без `--scallop-bg`), а у footer сохранены явные `--scallop-bg: var(--color-accent-blue)` и `--scallop-pad: 84px 0 72px`.

- 2026-03-14: Смягчён `totem`-периметр: убраны острые стыки между соседними волнами через C1-гладкую геометрию.
  Причина: в текущем `totem`-профиле стыки строились как независимые cubic-сегменты и давали визуальные «иголки»; требовалась мягкая волна, ближе к референсу.
  Файлы: `src/components/QuantizedPerimeter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; численная проверка join-касательных для top-edge (дефолт `step=40`, `waveAmplitudeRatio=0.28`, `waveTension=0.5`) даёт `minCos=1` при целевом пороге `>=0.95`; `rg -n "data-quantized-perimeter|data-perimeter-edge-pattern=\"totem\"|data-perimeter-edges=\"top\"|data-scallop-rectangle-edges=\"top\"|data-scallop-shape=\"circle\"" dist/index.html dist/*/index.html` подтверждает сохранение runtime/dataset-контракта для `totem`, `top-only` и `circle`.

- 2026-03-14: Выполнен `totem v2` тюнинг под более геометричный профиль: выше волна и уже «талия» при мягких скруглениях.
  Причина: по фидбеку нужно усилить высоту волны и сузить форму относительно предыдущей мягкой версии без изменения API.
  Файлы: `src/components/QuantizedPerimeter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; численная проверка стыков даёт `minCos=1.0` (цель `>=0.95`); сравнение baseline/new по дефолту (`step=40`, `waveAmplitudeRatio=0.28`, `waveTension=0.5`) подтверждает направление тюнинга: `depth` увеличен (`9.632 -> 11.2`), эффективная ширина по edge-handles уменьшена (`12.4 -> 8.4`); `rg -n "data-perimeter-edge-pattern=\"totem\"|data-perimeter-edges=\"top\"|data-scallop-shape=\"circle\"" dist/index.html dist/*/index.html` подтверждает сохранение dataset-контракта.

- 2026-03-14: Реализован `totem v3` corner-aware рендер для округлых углов без вытяжки (`cornerInset + corner-bridge`).
  Причина: у прямоугольного totem-периметра углы выглядели как «сосулька»; требовались симметричные и более круглые переходы между гранями без изменения API.
  Файлы: `src/components/QuantizedPerimeter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; геометрическая проверка `minCos` на смежных cubic-стыках для `edges='all'` и `edges='top'` даёт `1.0` (порог `>=0.95`); для `edges='all'` подтверждено отсутствие прохода path через точные вершины прямоугольника (`hasHardCornerAll=false`), что валидирует работу `cornerInset`; `rg -n "data-perimeter-edge-pattern=\"totem\"|data-perimeter-edges=\"top\"|data-scallop-shape=\"circle\"" dist/index.html dist/*/index.html` подтверждает сохранение dataset-контракта и отсутствие регрессий `circle`.
