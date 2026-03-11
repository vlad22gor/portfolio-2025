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
