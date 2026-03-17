# Logs

- 2026-03-17: Для `/fora` исправлена секция `design system`: заголовки `description text` переведены на `text/default` без opacity-приглушения; PNG перенесены из source `assets` в runtime `public/media/cases/fora/design-system`; в секции убран `object-fit: contain`, чтобы убрать визуальный underscale карточек.
  Причина: глобальный `p { color: var(--text-secondary) }` делал title слишком светлым, а рендер PNG из `assets` + `contain` создавал эффект уменьшения.
  Файлы: `src/components/ForaDesignSystemSection.astro`, `public/media/cases/fora/design-system/design-system-image-summary.png`, `public/media/cases/fora/design-system/design-system-image-horizontal-cards.png`, `public/media/cases/fora/design-system/design-system-image-vertical-cards.png`, `public/media/cases/fora/design-system/design-system-image-sheet.png`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; dev-проверка `http://127.0.0.1:4322/fora` подтверждает `copy-title` computed color `rgba(0, 0, 0, 0.85)` и `opacity: 1`; network-запросы для design-system PNG идут с `/media/cases/fora/design-system/...` (без `/@fs/.../assets/images/fora/...` для этой секции).

- 2026-03-16: Реализована секция `feature cards` для `/fora` по Figma `42:1730` и добавлен reusable-компонент `FeatureCard` с API `mockSide + device`.
  Причина: заменить skeleton-блок `feature cards` на рабочую 1:1 секцию, переиспользовать `DeviceMockup`/`QuantizedPerimeter` и подготовить универсальный компонент под варианты `mock side`/`device`.
  Файлы: `src/components/FeatureCard.astro`, `src/components/ForaFeatureCardsSection.astro`, `src/pages/[slug].astro`, `src/styles/global.css`, `public/media/fora/feature-cards/flows/Fora-Delivery.webm`, `public/media/fora/feature-cards/flows/Fora-Catalogue.webm`, `public/media/fora/feature-cards/flows/Fora-Cart.webm`, `public/media/fora/feature-cards/posters/Fora-Delivery.png`, `public/media/fora/feature-cards/posters/Fora-Catalogue.png`, `public/media/fora/feature-cards/posters/Fora-Cart.png`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает рендер `<section class="fora-feature-cards-section">` и 3 карточек `fora-feature-card`; `rg -o '<video class="device-mockup__media"' dist/fora/index.html | wc -l` => `3`; `rg -o 'poster="/media/fora/feature-cards/posters/[^"]+"' dist/fora/index.html | wc -l` => `3`; все видео-пути указывают на `/media/fora/feature-cards/flows/{Fora-Delivery,Fora-Catalogue,Fora-Cart}.webm`.

- 2026-03-16: Для `/fora process` устранено дополнительное “расталкивание” карточек в рядах — зафиксирован точный межкарточный gap `24px`.
  Причина: базовый стиль `:is(.quantized-scallop, .quantized-perimeter)` задаёт `margin-inline: auto`, что влияло на flex-раскладку ticket rows.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; runtime `/fora` (`1360px`) подтверждает `rowStyleGaps = 24px/24px` и измеренные bbox-gap `24/24/24/24` (1-й ряд) и `24/24/24` (2-й ряд), `allGapsAre24=true`.

- 2026-03-16: Для `/fora process` выровнены по центру оба ticket rows и обновлены ticket color tokens на непрозрачные значения из Figma `2:5119`.
  Причина: второй ряд визуально был смещён вправо из-за ручного offset, а в дизайн-системе обновились оттенки `components/colors` без transparency.
  Файлы: `src/components/CaseProcessSection.astro`, `src/data/case-process/types.ts`, `src/data/case-process/fora.ts`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает `case-process-section` (без `fora-section-skeleton--process`), `6` steps, `5` arrows, `9` tickets и `9` `data-perimeter-step="36"`; runtime `/fora` (`1360px`) подтверждает центрирование обоих рядов (`center delta <= 1px`), размеры тикетов `144x144`, caption centered; регрессия `/kissa`: `case-process-section` отсутствует, `case-pager` сохранён.

- 2026-03-16: Реализована универсальная `process`-секция для `/fora` (`CaseProcessSection`) и вынесен отдельный data-конфиг `fora`.
  Причина: заменить `fora-section-skeleton--process` на рабочий блок по Figma `38:5218` с контрактом тикетов `QuantizedPerimeter step=36` и переиспользуемой структурой для других кейсов.
  Файлы: `src/components/CaseProcessSection.astro`, `src/data/case-process/types.ts`, `src/data/case-process/fora.ts`, `src/pages/[slug].astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает замену skeleton (`case-process-section` присутствует, `fora-section-skeleton--process` отсутствует), а также `6` шагов, `5` стрелок, `9` тикетов и `9` вхождений `data-perimeter-step="36"`; Playwright (`http://127.0.0.1:4176/fora`, `1360px`) подтверждает `section=816x1159`, offsets шагов `0/168/336/504/336/168`, row heights `48/72/96/72/72/72`, тикеты `144x144`, second-row offset `84`, caption `320px` и centered, icon colors по токенам (`green/blue/orange`), `data-perimeter-snap-mismatch` у process-тикетов `0`; регрессия `kissa` — `case-process-section` отсутствует, `case-pager` сохранён.

- 2026-03-16: Исправлена геометрия `intro screens` на `/fora`: секция зафиксирована по высоте, контент центрирован, боковые mockup остаются меньше центрального.
  Причина: требовалось убрать runaway/infinite height у `QuantizedPerimeter`-секции и синхронизировать композицию `38:4410` (центрирование + явный размерный контраст `left/right < center`).
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает `fora-intro-screens-section--phone` и 3 `device-mockup`; CSS-контракт фиксированной высоты подтверждён (`height/min-height/max-height = 432px`), центрирование через `.scallop-content { display:flex; justify-content:center; align-items:center; }`; Playwright (`http://127.0.0.1:4174/fora`, `1360x2200`) подтверждает `section=816x432`, `trackCenterOffset={x:0,y:0}`, `left/center/right=174x357 / 244x501 / 174x357`, `--device-scale=.713115/1/.713115`, `horizontalOverflow=false`.

- 2026-03-16: Реализована секция `intro screens (QuantizedPerimeter)` для `/fora` с reusable-вариациями `phone` и `tablet`.
  Причина: заменить `intro-screens` skeleton на рабочую секцию по Figma (`38:4410` для `phone`) и заранее заложить вторую вариацию (`50:2761`) через prop `variant`.
  Файлы: `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/pages/[slug].astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает рендер `QuantizedPerimeter` секции (`class="fora-intro-screens-section fora-intro-screens-section--phone"`), наличие `3` `DeviceMockup` в `phone`-композиции и использование ассетов `/fora-intro-delivery|category|map`; `rg` по компоненту/стилям подтверждает `tablet`-вариацию (`track 602x508`, позиции `x:0/153/391`, `y:73/0/73`, scale для боковых mockup) и ассеты `kissa-terminal|kissa-welcome|kissa-tray`; browser-проверка Playwright на `1360px` не выполнена из-за локального launcher-конфликта Chrome (`Opening in existing browser session`).

- 2026-03-16: Исправлено вертикальное выравнивание `results` в `/fora intro` через top-align всего нижнего контейнера.
  Причина: при `align-items: center` у `.fora-intro-bottom` правая колонка (`results`) центрировалась по высоте и визуально «уезжала» вниз.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; runtime-проверка `/fora` подтверждает одинаковый `top` у `.fora-intro-bottom-left` и `.fora-intro-column--results`.

- 2026-03-16: Актуализированы тексты `intro section` для `/fora` по Figma `37:4182` с исправлением переносных текстовых неточностей.
  Причина: требовалось синхронизировать фактический контент секции (`overview/scope/results`) с макетом и убрать устаревшие формулировки.
  Файлы: `src/pages/[slug].astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Figma MCP (`get_design_context` + `get_screenshot`) подтверждает источник текста `37:4182`.

- 2026-03-16: Исправлен расчёт budget в `QuantizedPerimeter` для fixed-size scallop-блоков (при `min==max` размер берётся из `root`, а не из `parent`).
  Причина: в `about` и `more cases` runtime брал завышенную `parent.clientHeight`, из-за чего ломалась квантизация периметра (`rows` уезжали в `145/31`) и визуально деформировались scallop-края.
  Файлы: `src/components/QuantizedPerimeter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4322/`) подтверждает `about` (`step=48`, `rows=24`, `cols=17`, `mismatch=false`) и `more cases` (`rows=9`, `cols=17`, `mismatch=false`), `footer` без регрессии (`rows=8`, `cols=30`, `mismatch=false`).

- 2026-03-16: Для `/fora` intro-divider переведён с clip-подгонки на сегментную длину (`count`), а в `QuantizedPerimeter` добавлена диагностика snap-mismatch; дополнительно стабилизирована геометрия `about me` под `step=48`.
  Причина: по фидбеку нельзя ограничивать divider через `overflow:hidden`; также scallop деформировался при фиксированной высоте `1151` (не кратна `48`) и требовалась защита от повторения таких кейсов.
  Файлы: `src/pages/[slug].astro`, `src/styles/global.css`, `src/components/QuantizedPerimeter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает `count={22/10/22}` в `/fora` intro и отсутствие clip в `.fora-intro-divider-wrap`; `dist/fora/index.html` содержит `data-wave-count="22"` (2 шт) и `data-wave-count="10"` (1 шт), `case-pager` отсутствует (`0`), `dist/kissa/index.html` сохраняет `case-pager` (`1`); `src/styles/global.css` подтверждает `about-me-section` `1152px` и компенсацию `quotes margin-top: 184px`; `QuantizedPerimeter` содержит `data-perimeter-snap-mismatch` + dev-warn `snap mismatch on fixed-height element`.

- 2026-03-16: Для `/fora` внедрён новый секционный layout: полностью сверстан `intro section` по Figma `37:4182` + добавлен пустой каркас следующих секций; `case-pager` удалён только для `/fora`, `/kissa` оставлен без изменений.
  Причина: начать посекционную вёрстку `cases/fora` с первого блока и сразу зафиксировать геометрию всей страницы под дальнейшее поэтапное наполнение.
  Файлы: `src/pages/[slug].astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` по `dist/fora/index.html` подтверждает `page-shell--case-detail page-shell--fora`, `fora-intro-section`, `3` divider-а `QuantizedWave medium` (`class="quantized-wave fora-intro-divider"`), `3` script-заголовка `type-description-large`, отсутствие `case-pager`; `rg` по `dist/kissa/index.html` подтверждает сохранение legacy-страницы и наличие `case-pager` (`1` вхождение).

- 2026-03-16: Для `final-cta-morph-v1` подтверждён spring-профиль и поднят порог repeat-триггера с `30%` до `50%`.
  Причина: параметры должны строго соответствовать Framer (`spring`, `0.6`, `0.1`), а при `amount: 0.3` реверс часто запускался слишком поздно и визуально терялся.
  Файлы: `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает `final-cta-morph-v1` с `amount:0.5` и `transition: { type:'spring', duration:0.6, bounce:0.1, delay:0 }`; Playwright подтверждает enter/leave repeat-морф и reduced-motion финал.

- 2026-03-16: Добавлен repeatable `inView` morph для `final cta` (`final-cta-morph-v1`) с порогом `30%`.
  Причина: требовалась отдельная двусторонняя анимация `title + motif` (`initial <-> final`) при пересечении viewport-порога, при сохранении существующего `appear-v1` на `divider/content`.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/FinalCtaSection.astro`, `src/styles/global.css`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает новый preset `final-cta-morph-v1` (`mode='element-repeat'`, `amount:0.3`, `duration:0.6`, `bounce:0.1`) и `data-motion-inview='final-cta-morph-v1'` на root `final-cta-section`; Playwright подтверждает enter/leave morph по CSS vars и реверс, а также сохранение `appear-v1` на `divider/content`.

- 2026-03-16: Добавлена inView-анимация main quote по словам и последовательный reveal закрывающей кавычки.
  Причина: требовалась Framer-like word-appear анимация для `.quotes-main-quote-text` и запуск `.quotes-mark--main-close` только после завершения текста.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/QuotesSection.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает новые пресеты `quotes-main-word-v1` (`mode='per-word'`, `wordDelay:0.075`) и `quotes-main-close-after-v1` (`mode='element-sequenced'`), а также связку `data-motion-sequence-source/data-motion-sequence-after` в `QuotesSection`; Playwright (`http://127.0.0.1:4321`) подтверждает sequence (`closeAfterTextMs ≈ 1520ms`, `wordsCount=16`) и reduced-motion финал (`allWordsVisible=true`, `closeOpacity=1`, `closeTransform=matrix(..., 0, 0)`).

- 2026-03-16: Для `about-arch-trim-v1` увеличен порог старта `inView` с `20%` до `30%`.
  Причина: по фидбеку требовался более поздний и читаемый старт trim-анимации арки.
  Файлы: `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает `amount: 0.3` в runtime и обновлённые значения `~30%` в docs/lessons.

- 2026-03-16: Исправлено направление trim-анимации `about` arch на визуальное `left -> right`.
  Причина: path был задан в обратном порядке точек (start справа), из-за чего при корректном `start -> end` эффект выглядел как `end -> start`.
  Файлы: `src/components/AboutMeQScallopSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает обновлённый path `M40 ... C ... 496 268` (start слева, end справа) при неизменном runtime-пресете `about-arch-trim-v1`.

- 2026-03-16: Добавлена `inView` trim-анимация для `about` arch (`start -> end`) со spring `0.6/0.3`.
  Причина: требовалось анимировать вектор арки в секции `about` через path-trim при входе в viewport.
  Файлы: `src/components/AboutMeQScallopSection.astro`, `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` по исходникам подтверждает preset `about-arch-trim-v1` (`mode='path-trim'`, `duration:0.6`, `bounce:0.3`) и разметку `data-motion-inview='about-arch-trim-v1'` + `data-motion-trim-path`; `rg` по `dist` подтверждает inline `<svg class='about-me-arch'>` и компиляцию runtime trim-анимации `strokeDashoffset: [totalLength, 0]`.

- 2026-03-15: Добавлена побуквенная `inView`-анимация для `design tools` bottom labels с row-stagger.
  Причина: требовался Framer-профиль `Rotate+Fade` для лейблов снизу в секции `design tools`, с шагом задержки между лейблами в строке слева направо.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/DesignToolsSection.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4326/`) подтверждает `9` label targets с `data-motion-inview='design-tools-label-char-v1'`, корректные `data-motion-row-index` и initial per-char state (`opacity:0`, `rotate(45deg)`) на split-символах; `dist`-проверка (`rg`) подтверждает presence нового preset/runtime-параметров (`mode='per-char'`, `charDelay=0.06`, `rowDelayStep=0.1`). Browser-проверка one-shot после scroll не выполнена из-за локального Playwright/Chrome launcher-конфликта (`Opening in existing browser session`).

- 2026-03-15: Исправлен сдвиг вправо у `final cta` divider после подключения глобального `inView`.
  Причина: `InViewMotionRuntime` перезаписывал `transform` inline и стирал базовый `translateX(-50%)`, который центрирует `.final-cta-divider-bleed`.
  Файлы: `src/components/InViewMotionRuntime.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4325/`) подтверждает композицию transform у divider (`matrix(...,-600,0) + translate3d(...)`) и центрирование `centeredDelta=0` до/после inView; `prefers-reduced-motion: reduce` — `animated=true`, финальный transform сохранён, `centeredDelta=0`.

- 2026-03-15: По пользовательским правкам донастроен `final CTA`: divider сделан full-width, фон секции убран, motif переведён в синий asset.
  Причина: требовалась визуальная правка блока под референс — full-width divider без фоновой плашки и синим мотивом при сохранении Y-контрактов.
  Файлы: `src/components/FinalCtaSection.astro`, `src/styles/global.css`, `public/media/motifs/motif-stack-orb-3-blue.svg`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173/`, `1360x2200`) подтверждает `hero=240`, `cases=1320`, `design=3024`, `about=3744`, `quotes=5112`, `finalCTA=6000`, `footer=7080`, `finalCTAHeight=894`, `data-wave-size=large`, `dividerRect=0..1360`, `ctaBg=transparent`, `motifSrc=/media/motifs/motif-stack-orb-3-blue.svg`, `horizontalOverflow=false`.

- 2026-03-15: Реализована секция `final cta section` на главной по Figma `29:1636` с divider `QuantizedWave large`; сохранён контракт `footer Y=7080`.
  Причина: добавить финальный CTA-блок перед футером и зафиксировать вертикальные контракты (`quotes=5112`, `final cta=6000`, `footer=7080`) без изменения визуала footer.
  Файлы: `src/components/FinalCtaSection.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173/`, `1360x2200`) подтверждает `hero=240`, `cases=1320`, `design=3024`, `about=3744`, `quotes=5112`, `finalCTA=6000`, `footer=7080`, `finalCTAHeight=894`, `data-wave-size=large`, `horizontalOverflow=false`. Для full-width внутри `main` использован breakout через внутренний `.final-cta-surface`; grid-track `main` остался `816px`.

- 2026-03-15: Divider-волны в `design tools` выровнены по правому краю, как текстовые лейблы.
  Причина: требовалось, чтобы волна в каждом span «заканчивалась справа», а не начиналась слева.
  Файлы: `src/components/DesignToolsSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "design-tools-wave-span-[1-5]|data-wave-fit=\"cover\"|data-wave-align=\"right\"" dist/index.html` подтверждает 5 span-классов, `fit=\"cover\"` и `align=\"right\"`; browser-check (`1360px`) подтверждает привязку правого края каждой волны к правой границе своего span, без деформации (`width = count * 8`).

- 2026-03-15: Усилена центровка заголовка `good people first` в секции `about me`.
  Причина: требовалось явно гарантировать центровку заголовка относительно секции и центральное выравнивание текста.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-15: Исправлена геометрия divider-волн в `design tools` без деформации path: расчёт count привязан к ширине конкретного grid-span, а не к общей строке.
  Причина: при вычислении от ширины `816` меньшие span-волны визуально ужимались по X; требовалась «хедерная» квантизация длины через удаление лишних кружков.
  Файлы: `src/components/QuantizedWave.astro`, `src/components/DesignToolsSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "design-tools-wave-span-[1-5]|Perplexity|data-wave-fit=\"cover\"" dist/index.html` подтверждает `fit=\"cover\"`, 5 span-классов и замену лейбла; Playwright (`http://127.0.0.1:4174/`, `1360x2200`) подтверждает для 5 divider-волн `data-wave-count-resolved = 17/38/59/80/101`, slot-width `144/312/480/648/816`, `waveWidth = count * 8`, `geometryScale=1` (без горизонтального растяжения path); регрессия header wave-rail не выявлена (`rail fit=cover-bleed`, fallback active fit=cover).

- 2026-03-15: Исправлено вертикальное выравнивание колонок `about me`: удалено глобальное смещение `.type-body + .type-body`, добавлен явный top-align сетки.
  Причина: правило для соседних `type-body` контейнеров опускало вторую колонку на `10px`; требовался старт обеих колонок по верхнему краю родителя.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "\\.type-body \\+ \\.type-body|\\.type-body p \\+ p|about-me-body|align-items: start|align-content: start" src/styles/global.css` подтверждает удаление проблемного правила, сохранение `p + p` и top-align в `about`.

- 2026-03-15: В правой колонке `about me` восстановлены два абзаца для визуализации глобального `type-body` paragraph spacing.
  Причина: при одном абзаце spacing `10px` не проявлялся визуально; требовалось показать интервал между параграфами по токену.
  Файлы: `src/components/AboutMeQScallopSection.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-15: Добавлен глобальный paragraph spacing для токена `type-body` (`10px`) и подключён в `about`/`quotes` без локальных дублей.
  Причина: в Figma style `body` зафиксирован `Paragraph spacing = 10`, которого не было в глобальной типографике.
  Файлы: `src/styles/global.css`, `src/components/AboutMeQScallopSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "type-body-paragraph-spacing|\\.type-body p \\+ p|\\.type-body \\+ \\.type-body" src/styles/global.css` подтверждает токен и глобальные правила; `rg -n "quotes-copy p \\+ p" src/styles/global.css` — совпадений нет.

- 2026-03-15: Исправлены divider-волны в `design tools section`: убрано сжатие, заданы span по колонкам `1->5` справа налево, и заменён лейбл `v0 ⁕ Lovable` на `Perplexity`.
  Причина: divider-волны использовали `design-tools-col-*` (только старт колонки), из-за чего все рендерились шириной одной колонки вместо `1/2/3/4/5`.
  Файлы: `src/components/DesignToolsSection.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -o "design-tools-wave-span-[1-5]" dist/index.html | sort | uniq -c` подтверждает по одному экземпляру каждого span-класса; `rg -n "Perplexity|design-tools-wave-span-[1-5]" dist/index.html` подтверждает замену лейбла и подключение новых классов волн; `rg -n "design-tools-wave-span-[1-5]" src/styles/global.css` подтверждает mapping `5/6`, `4/6`, `3/6`, `2/6`, `1/6`. Браузерная проверка Playwright на `1360px` не выполнена из-за локального launcher-конфликта Chrome (`Opening in existing browser session`).

- 2026-03-15: Реализована секция `quotes` на главной по Figma `26:2185` и синхронизирован порядок секций `/` под макет (`hero -> cases -> design -> about -> quotes`).
  Причина: добавить блок отзывов 1:1 по desktop-контракту (`816x654`, `Y=5112`) и устранить рассинхрон порядка секций относительно Figma.
  Файлы: `src/components/QuotesSection.astro`, `src/pages/index.astro`, `src/styles/global.css`, `public/media/home/quotes/quote-open-large.svg`, `public/media/home/quotes/quote-close-large.svg`, `public/media/home/quotes/quote-open-small.svg`, `public/media/home/quotes/quote-close-small.svg`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "quotes-section|Eugenia Vyshnytska|Egor Privalov|Ivan Shevchenko|more on linkedin|linkedin.com/in/vladhorovyy" dist/index.html` подтверждает DOM/контент/ссылку; Playwright (`http://127.0.0.1:4173/`, `1360x2200`) подтверждает Y-контракты в координатах `main`: `hero=240`, `cases=1320`, `design=3024`, `about=3744`, `quotes=5112`, `quotesHeight=654`, `horizontalOverflow=false`. Для точного попадания в Y скорректированы offsets с учётом `page-shell` `grid gap: 32px` (`about margin-top: 190px`, `quotes margin-top: 185px`).

- 2026-03-15: Убран лишний абзац в правой колонке текста секции `about me (QScallop)` — оставлен один объединённый абзац.
  Причина: пользователь подтвердил, что в блоке должен быть только один абзац вместо двух.
  Файлы: `src/components/AboutMeQScallopSection.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-15: Реализована секция `about me (QScallop)` на главной по Figma `28:3272` и подключена после `cases cards section`.
  Причина: добавить новый блок `About Me` с периметром `QuantizedPerimeter` и зафиксировать desktop-контракт по вертикали (`Y=3744`) в текущем layout.
  Файлы: `src/components/AboutMeQScallopSection.astro`, `src/pages/index.astro`, `src/styles/global.css`, `public/media/home/about-arch.svg`, `public/media/home/about-photo.jpg`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "about-me-section|meaningful visuals|data-perimeter-edge-pattern=\"scallop\"|data-perimeter-step=\"48\"" dist/index.html` подтверждает рендер секции, текстовый контракт и perimeter-атрибуты; `rg -n "about-arch.svg|about-photo.jpg" dist/index.html` подтверждает подключение ассетов из `public/media/home`; browser-проверка геометрии (`1360px`, фактический `Y`) не выполнена из-за локального launcher-конфликта Playwright/Chrome (`Opening in existing browser session`).

- 2026-03-15: Реализован `design tools section` на главной по Figma `28:3110` (desktop) с правым выравниванием label-ов по 5-колоночной сетке и divider-ами `QuantizedWave small`.
  Причина: добавить новый блок после `cases cards section` с упрощённой колонной моделью divider-ов и сохранить вертикальный контракт `Y≈3024` через локальный offset.
  Файлы: `src/components/DesignToolsSection.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -o "design-tools-label-row" dist/index.html | wc -l` => `5`; `rg -o "design-tools-divider-row" dist/index.html | wc -l` => `5`; `rg -n "design-tools-section|data-wave-size=\"small\"|v0 ⁕ Lovable" dist/index.html` подтверждает секцию, small-divider-рендер и текстовый контракт.

- 2026-03-15: Разделены длительности hover-анимации `CaseCard`: mouse-in `0.4`, mouse-out `0.6`.
  Причина: требовалось сохранить более быстрый вход и оставить более мягкий выход.
  Файлы: `src/components/CaseCard.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-15: Увеличен delay второго hover-ассета в `CaseCard` до `0.5s`.
  Причина: требуется более выраженный stagger между первым и вторым ассетом.
  Файлы: `src/components/CaseCard.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-15: Замедлена hover-анимация `CaseCard` (включая mouse-out): `duration` увеличен до `0.6`.
  Причина: выход из hover воспринимался слишком резким при `duration: 0.4`.
  Файлы: `src/components/CaseCard.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-15: Доработана `cases cards section` по последней Figma-правке: обновлены оффсеты description-стрелок, зафиксирован `Y=1320` на `/`, и добавлен `loader_light.webm` для кубика в `more is coming`.
  Причина: синхронизация с актуальным макетом (`26:2056` / `26:1898`) и требование анимированного кубика с сохранением статичного cover.
  Файлы: `src/components/CasesCardsSection.astro`, `src/styles/global.css`, `public/media/cases/section/loader_light.webm`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173/`, `1360x2200`) подтверждает `cases-cards-section y=1320`, стрелки `left(155,-12)` и `right(604,32)`, `cases-more-card=816x432`, `step=48`, `rows=9`, `cols=17`, `data-ready=true`, `noHorizontalScroll=true`; `video` на кубике: `source=/media/cases/section/loader_light.webm`, `poster=/media/cases/section/more-cases-cube.png`, `autoplay/loop/muted/playsInline=true`, `paused=false`, `currentTime>0`; regressions ok: footer `edges=top step=40 ready=true`, `CaseCard` hover `false->true->false`.

- 2026-03-15: `CaseCard` сделан полностью кликабельным — root переведён на ссылку кейса.
  Причина: требование UX — переход по кейсу должен срабатывать по всей карточке, не только по title.
  Файлы: `src/components/CaseCard.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist`-проверка (`rg` по `dist/cases/index.html`, `dist/index.html`, `dist/preview/index.html`) подтверждает root-разметку `<a class=\"case-card\" href=\"/fora|/kissa\">` и отсутствие вложенного title-link; интерактивная Playwright-проверка не выполнена из-за launcher-конфликта Chrome (`Opening in existing browser session`).

- 2026-03-15: Повторно синхронизированы `kissa` hover-ассеты с последней коррекцией в Figma `20:1323`.
  Причина: пользователь обновил размеры и положения ассетов; требовалась повторная актуализация raw-данных без изменения runtime-компенсации.
  Файлы: `src/data/cases.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4175/cases`) подтверждает raw `kissa`: `704.1,-110,348x348` и `666,139.14,359x359`; при `delta=58` effective X: `646.1` и `608`.

- 2026-03-15: Синхронизированы `kissa` hover-ассеты с обновлёнными значениями из Figma `20:1323`.
  Причина: пользователь актуализировал положение и размеры ассетов; требовалось обновить данные карточки без изменения runtime-контрактов.
  Файлы: `src/data/cases.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4175/cases`) подтверждает raw `kissa` `targetX/Y/size`: `705,-116.68,358x358` и `671,141.32,369x369`, а также effective X после нормализации (`delta=58`): `647` и `613`.

- 2026-03-14: По запросу увеличена высота блока `more is coming (QScallop)` до `432px`.
  Причина: требуется новый фиксированный вертикальный размер секции без регрессии scallop-периметра.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173/`, `1360x2200`) подтверждает `cases-more-card=816x432`, `data-perimeter-step=48`, `rows=9`, `cols=17`, `computedHeight=432px`, `data-ready=true`, `noHorizontalScroll=true`; offsets стрелок сохранены (`left(155,-14)`, `right(604,34)`); footer-regression ok (`edges=top`, `step=40`, `ready=true`); `CaseCard` hover-regression ok (`data-hover-active false->true->false`, arrow opacity `0->1->0`).

- 2026-03-14: Исправлено системное смещение `kissa` hover-ассетов вправо (~58-60px) через runtime-нормализацию `targetX` для `coverSide='right'`.
  Причина: координаты ассетов были сняты из Figma-фрейма шириной `874`, тогда как фактическая карточка в рантайме имеет `816`, из-за чего правые ассеты уезжали вправо на дельту ширин.
  Файлы: `src/components/CaseCard.astro`, `src/data/cases.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4175/cases`) подтверждает `data-case-card-width-delta=58` у `kissa` и эффективные X `720->662`, `710->652` (для `fora` delta `0`, позиции без изменений).

- 2026-03-14: Доработан `CaseCard` под актуальный Figma `20:1323`: статичная высота карточки `432px` и обновлённые hover-ассеты по pre-rotation размерам.
  Причина: синхронизация с последними правками дизайна (новая высота карточки + точные позиции/размеры ассетов на hover).
  Файлы: `src/styles/global.css`, `src/data/cases.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174/cases`) подтверждает `case-card`/`cover-shell`/`content` высоту `432px` и новые `data-target-*` у ассетов (`fora`: `-149,-75,288x257` и `-148,143,252x340`; `kissa`: `720,-124,327x327` и `710,243,300x300`).

- 2026-03-14: Реализован `CaseCard v2.2` — внешний scallop-outline и перенос маски с контейнера на `cover-image`.
  Причина: контур обводки подрезался при container-clip и визуально уходил внутрь периметра; требовался внешний геометрический контур без blur.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `src/components/CaseCard.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174/cases`) подтверждает для cover: `data-perimeter-clip-content-to-shape=false`, `data-perimeter-export-shape-mask=true`, `data-perimeter-outline-mode=geometric`, `data-perimeter-outline-placement=outside`, у `.scallop-content` `mask-image=none/overflow=visible`, у `.case-card-cover-image` `mask-image!=none`, в outline-слое есть `path[stroke]` с `stroke-width=10` и `mask=url(#perimeter-outline-mask-*)`, без `feMorphology/feComposite`; hover-state по-прежнему активирует outline/arrow/assets (`data-hover-active false->true`).

- 2026-03-14: Исправлен «поплывший» scallop-периметр в `more card` через системную стабилизацию sizing в runtime `QuantizedPerimeter` (rectangle).
  Причина: budget геометрии зависел от `content.scroll*` и мог уходить в feedback-loop при auto-height родителе, что давало чрезмерно плотный/мелкий периметр.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/CasesCardsSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173/`, viewport `1360x2200`) подтверждает `more card`: `data-perimeter-edge-pattern=scallop`, `step=48`, `rows=8`, `cols=17`, `data-ready=true`, размер `816x408`; секция `cases-cards-section=816x1416`; `noHorizontalScroll=true`; offsets description-стрелок `left(155,-14)` и `right(604,34)`; footer-regression ok (`edges=top`, `step=40`, `ready=true`); `CaseCard` hover/mask ok (`data-hover-active false->true->false`, arrow/asset opacity 0->1->0, `clipContentToShape=true`, mask присутствует).

- 2026-03-14: Исправлен runaway-height у `more card` в `cases cards section`: контейнер `QuantizedPerimeter` зафиксирован по высоте `408px`.
  Причина: browser-check на desktop (`1360`) показал некорректную квантизацию высоты (`~570k px`) при `min-height` без фиксированной высоты, что растягивало секцию целиком.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4173/`) подтверждает `cases-cards-section 816x1416`, `cases-more-card 816x408`, `description` стрелки `left(155,-14)` и `right(604,34)`, `gap`-контракты `24/72`, `noHorizontalScroll=true`, `data-perimeter-edge-pattern=scallop`, hover-контракт `CaseCard` (`data-hover-active false -> true -> false`, arrow/asset opacity корректны).

- 2026-03-14: На главной странице внедрён новый `cases cards section` по Figma `26:1898` (2 `CaseCard`, description с absolute-стрелками, и статичный `more cases are coming` на `QuantizedPerimeter`).
  Причина: заменить прежний `Featured cases` блок на согласованную структуру 1:1 с переиспользованием существующих компонентов и QScallop-периметра.
  Файлы: `src/components/CasesCardsSection.astro`, `src/components/Badge.astro`, `src/pages/index.astro`, `src/styles/global.css`, `public/media/cases/section/*`.
  Проверки: `npm run build` — успешно; `rg -n "cases-cards-section|cases-cards-description|cases-more-card|data-perimeter-edge-pattern=\"scallop\"" dist/index.html` подтверждает новый DOM-контракт и scallop-perimeter у `more card`; браузерная проверка Playwright не выполнена из-за локального launcher-конфликта (`Opening in existing browser session`).

- 2026-03-14: Для `CaseCard` внедрён opt-in clip по scallop-форме (`clipContentToShape`) с генерацией runtime mask из фактического SVG-периметра.
  Причина: обложка кейса должна рендериться в границах scallop-контейнера, без подмены формы обычным прямоугольным `border-radius`.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `src/components/CaseCard.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174`) подтверждает для `CaseCard`: `data-perimeter-clip-content-to-shape=true`, наличие `--perimeter-content-mask`, `mask-image != none` у `.scallop-content`; для footer: `clip=false`, `mask-image=none`; при hover у cover `::after` — `opacity=1`, `maskImage!=none`, цвет обводки совпадает с case-токеном.

- 2026-03-14: В `/preview` добавлены новые компоненты `CaseCard` и `Badge` для живой проверки текущей реализации карточек кейсов.
  Причина: нужен отдельный playground-блок с уже внедрённым `CaseCard`/`Badge`, чтобы быстро проверять визуал и интеракции без перехода на `/` и `/cases`.
  Файлы: `src/pages/preview.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174`) подтверждает наличие секции `Case Card components`, рендер `Badge` (`Redesign`, `Startup`) и `CaseCard` для `fora/kissa`.

- 2026-03-14: Повторно выполнены браузерные интерактивные тесты `CaseCard` после закрытия блокирующей Chrome-сессии.
  Причина: ранее Playwright не запускался из-за открытого браузерного профиля, требовалась повторная верификация hover/focus поведения.
  Файлы: без изменений кода (runtime-проверка), `tasks/logs.md`.
  Проверки: Playwright (`http://127.0.0.1:4174`) на `/` и `/preview` — `hoverActive: false -> true -> false`, `case-card-arrow opacity: 0 -> 1 -> 0`, `hover asset opacity: 0 -> 1 -> 0`; keyboard focus на ссылке внутри карточки активирует `hoverActive: true`.

- 2026-03-14: Реализован новый `CaseCard` по Figma для `fora/kissa` с reusable `Badge`, hover-ассетами на spring-анимации и instant-переключением обводки/стрелки; карточки переведены в layout "одна в строке".
  Причина: внедрить согласованный дизайн карточек и унифицировать hover-логику для существующих кейсов с разными ассетами/позициями/цветом обводки.
  Файлы: `src/components/Badge.astro`, `src/components/CaseCard.astro`, `src/data/cases.ts`, `src/styles/global.css`, `public/media/cases/*`, `public/media/icons/cases/*`.
  Проверки: `npm run build` — успешно; `rg -n "step = 48|step={40}|cardHover|data-hover-active"` подтверждает глобальный дефолт `step=48` в `Quantized*`, явный override `footer step={40}` и подключение нового hover-контракта карточек.

- 2026-03-14: Обновлён глобальный дефолт scallop-диаметра (`step`) с `40` на `48` в runtime-компонентах.
  Причина: новые сетки и кейс-карточки собраны под `d=48`; явные локальные значения сохранены без изменений.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "step = 48|step={40}" src/components` — подтверждено.

- 2026-03-14: Для home зафиксирован вертикальный offset секции hero как `Y=240` через отдельный модификатор layout-контейнера.
  Причина: закрепить согласованный контракт вертикального ритма по Figma для первого блока без влияния на другие страницы.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-14: Зафиксирован контракт по вертикальному ритму секций через координату `Y` из Figma (для `home hero` — `Y=240`), без единого глобального `gap`.
  Причина: в макете секции стоят по сетке ритма с разными интервалами, единый auto-layout gap приводит к расхождениям.
  Файлы: `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: не запускались (docs-only изменение).

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

- 2026-03-14: Добавлен тестовый hover-morph периметр на главной (`scallop -> totem`) и расширен runtime `QuantizedPerimeter` под геометрический spring-morph.
  Причина: проверить интерактивный morph-переход между двумя типами квантации без дублирования компонентов и без локальных костылей на странице.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "Morph test|Scallop -> Totem|data-perimeter-hover-morph|scallop-preview-morph" src/pages/index.astro src/components/QuantizedPerimeter.astro src/styles/global.css` подтверждает новый API/разметку/стили; `rg -n "Morph test|Scallop -> Totem|data-perimeter-hover-morph|data-perimeter-morph-progress" dist/index.html` подтверждает рендер и dataset-контракт в сборке.

- 2026-03-14: Исправлен morph-пайплайн `QuantizedPerimeter` на реальный переход `true scallop -> totem` через совместимые cubic-сегменты.
  Причина: предыдущая реализация визуально была похожа на анимацию параметров smooth-wave и не давала характерный scallop-cusp на старте.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/pages/index.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "appendScallopWaveSegments|buildPerimeterSegments|interpolatePathModels|True Scallop -> Totem" src/components/QuantizedPerimeter.astro src/pages/index.astro` подтверждает новый сегментный morph-пайплайн и обновлённый demo-copy.

- 2026-03-14: Выполнена финальная итерация morph-архитектуры `scallop -> totem` с изоляцией только для `hoverMorph` режима.
  Причина: устранить эффект «анти-scallop» (вырез внутрь) и обеспечить масштабируемую основу под новые типы edge-pattern.
  Файлы: `src/components/QuantizedPerimeter.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "morphPatternAdapters|buildMorphPerimeterSegments|validateMorphModels|perimeterMorphGate|renderRectangleTotem" src/components/QuantizedPerimeter.astro` подтверждает adapter-слой, канонический morph-пайплайн с наружными нормалями, quality-gate и fallback, а также сохранение отдельного standalone-рендера `renderRectangleTotem` вне morph-режима.

- 2026-03-14: Демонтирован межтиповой morph (`scallop -> totem`) и внедрена инфраструктура single-type param animation в `QuantizedPerimeter` (v1: `totem-first`).
  Причина: межтиповой morph оставался визуально нестабильным и усложнял runtime; требовалась надёжная база для hover/focus-анимации параметров внутри одного паттерна.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/pages/index.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "buildMorphPerimeterSegments|renderRectangleMorph|morphPatternAdapters|validateMorphModels|interpolatePathModels|perimeterMorphGate|data-perimeter-morph-gate" src/components/QuantizedPerimeter.astro src/pages/index.astro dist/index.html || true` — совпадений нет (inter-type ветка удалена); `rg -n "Totem param hover|Param animation test|hoverMorphTo=|True Scallop -> Totem|true scallop" src/pages/index.astro` подтверждает обновлённый demo-copy и отсутствие `hoverMorphTo` в вызове demo.

- 2026-03-14: Добавлены 4 compare-preview варианта single-type hover-анимации `totem` (`Light/Medium/Radical/Negative`) и расширен API дельтами hover-параметров.
  Причина: нужно сравнить силу и направление анимации в рамках одного типа, включая «отрицательный» сценарий (амплитуда вниз, tension вверх), без возврата к inter-type morph.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/pages/index.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "hoverWaveAmplitudeDelta|hoverWaveTensionDelta|resolveHoverParams: \(baseParams, dataset\)|Negative|Radical|Medium|Light" src/components/QuantizedPerimeter.astro src/pages/index.astro` подтверждает новый API и 4 preview-варианта; `rg -n "scallop-preview-morph \\.scallop-content|outline: 1px dashed|transition: outline-color" src/styles/global.css || true` — совпадений нет (пунктирная inner-обводка удалена).

- 2026-03-14: Добавлены именованные пресеты hover-анимации `totem` (`default`, `strong`) и обновлён каталог preview до двух целевых вариантов.
  Причина: зафиксировать понравившиеся сценарии (бывшие `medium` и `radical`) как стабильные пресеты и убрать лишние сравнения (`light/negative`) из главного каталога.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/pages/index.astro`, `docs/quantized-shapes-and-animation-presets.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "hoverMorphPreset|data-perimeter-hover-morph-preset|perimeterHoverMorphPreset|default' \| 'strong|resolveHoverParams: \(baseParams, dataset\)" src/components/QuantizedPerimeter.astro` подтверждает пресетный API и runtime; `rg -n "<h2>Default</h2>|<h2>Strong</h2>|hoverMorphPreset=\"default\"|hoverMorphPreset=\"strong\"|Light|Radical|Negative|Medium" src/pages/index.astro` подтверждает 2 preview-карточки; `docs/quantized-shapes-and-animation-presets.md` добавлен с описанием shape-типов и правил пресетов.

- 2026-03-14: Добавлена hover-анимация для `scallop` с пресетами `default` и `strong`, плюс новые preview-карточки на главной.
  Причина: расширить single-type preset-модель на `scallop` по аналогии с `totem`, сохранив единый API `hoverMorphPreset` и baseline-демо без регрессий.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/pages/index.astro`, `docs/quantized-shapes-and-animation-presets.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "supportsParamAnimation: true|scallopRadiusScale|renderRectangleScallop\(|hoverMorphPreset === 'strong'|Scallop hover default|Scallop hover strong" src/components/QuantizedPerimeter.astro src/pages/index.astro` подтверждает runtime/preset-поддержку scallop и новые preview; `rg -n "Scallop Hover Presets|scallopRadiusScale|Hover Presets By Pattern" docs/quantized-shapes-and-animation-presets.md` подтверждает документацию.

- 2026-03-14: Расширен `QuantizedWave` новыми size-пресетами и trim-reveal API без изменения поведения header wave-rail.
  Причина: нужен переиспользуемый контракт размеров (`small/medium/large`) и отдельный режим path-reveal для scroll-анимаций без конфликта с текущим trim-сегментом в хедере.
  Файлы: `src/components/QuantizedWave.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в `QuantizedWave` добавлены пропсы `size`, `trimMode`, `trimProgress`, `trimDirection`, размерные пресеты (`small=8/2`, `medium=28/4`, `large=40/10`) и runtime-логика reveal (`stroke-dasharray/stroke-dashoffset`) только для `trimMode='reveal'` (в `none` dash-стили не трогаются).

- 2026-03-14: Добавлен наглядный preview трёх размеров `QuantizedWave` на главной странице.
  Причина: нужен быстрый визуальный референс для новых пресетов `small`, `medium`, `large` прямо в каталоге на `/`.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в `index` добавлен блок `Quantized wave sizes` с тремя карточками (`size='small'|'medium'|'large'`), в CSS добавлены стили `wave-size-preview-*` для равномерной сетки и читаемой подписи параметров.

- 2026-03-14: Скорректированы size-пресеты `QuantizedWave` по диаметру (`d`) и обновлены подписи в preview.
  Причина: исходно `medium/large` были заведены как радиусы по ошибке; требовалось зафиксировать значения как диаметры: `medium d=14`, `large d=20`.
  Файлы: `src/components/QuantizedWave.astro`, `src/pages/index.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; size map обновлён (`small=8/2`, `medium=14/4`, `large=20/10`), подписи в блоке `Quantized wave sizes` переведены в формат `d N, stroke M`.

- 2026-03-14: Актуализированы color/typography токены по Figma (`2:5119`, `2:5278`) без изменения API имён токенов.
  Причина: синхронизировать проектные design tokens с текущим token spec в Figma и убрать расхождения по размерам/весам/opsz/кернингу.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg`-проверка подтверждает наличие новых значений (`--color-accent-gray`, `t1=108/120/600`, `t1-compact=85/100/600`, `body line-height=24`, `label-large weight=600`, `opsz=14` для всех DM Sans) и отсутствие старых значений (`t1 112/128`, `t1-compact 102/128`, `t2 56`, `body 22`, старые `opsz`, `-0.03em`).

- 2026-03-14: Актуализирована горизонтальная страничная сетка: `5-col` по умолчанию и `8-col` для `/gallery`.
  Причина: привести ширину контентного контейнера `main.page-shell` к согласованному ритму (`816` для общих страниц, `1224` для gallery) без изменения header/footer и внутренних карточных сеток.
  Файлы: `src/styles/global.css`, `src/pages/gallery.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `rg -n "layout-grid-5|layout-grid-8|page-shell--gallery" src/styles/global.css src/pages/gallery.astro` подтверждает токены `144/24/816`, `132/24/1224` и класс-модификатор; `npm run build` — успешно; Playwright (`http://127.0.0.1:4174`) при viewport `1360x1100` показывает `pageShellWidth=816` для `/`, `/cases`, `/fora` и `pageShellWidth=1224` для `/gallery` (без горизонтального скролла); при viewport `800x1000` горизонтального скролла нет на `/`, `/cases`, `/gallery`.

- 2026-03-14: Перенесён preview-контент с `/` на новую временную страницу `/preview`, добавлена ссылка в хедер и active-state для нового роута.
  Причина: разгрузить home и вынести demo-блоки в отдельное временное пространство для превью.
  Файлы: `src/pages/index.astro`, `src/pages/preview.astro`, `src/components/SiteHeader.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в output сгенерирован новый маршрут `/preview/index.html`, ошибок сборки нет.

- 2026-03-14: Реализован новый `home hero` по Figma `27:2684` (текстовые ряды + абсолютные PNG + CTA).
  Причина: заменить текущий плейсхолдерный первый блок на 1:1 desktop-композицию из Figma с сохранением текущего button API и маршрутов.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`, `public/media/home/coin-wheel.png`, `public/media/home/mockup-red.png`, `public/media/home/mockup-path.png`, `public/media/home/cube.png`, `public/media/home/ternimal.png`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `curl` по `http://127.0.0.1:4173/media/home/{coin-wheel,mockup-red,mockup-path,cube,ternimal}.png` — `200`; `curl http://127.0.0.1:4173/` — `200`; `rg -n "home-hero|/media/home" dist/index.html` подтверждает рендер hero и подключение новых ассетов; визуальный smoke-check через Playwright MCP не выполнен из-за ошибки запуска Chrome persistent context (`Opening in existing browser session`).

- 2026-03-14: Исправлена формула масштабирования `home-hero` и восстановлен автоматический visual smoke-check через Playwright MCP.
  Причина: после восстановления MCP выявилось схлопывание hero (неверная единица в `--home-hero-scale`), из-за чего блок рендерился сильно меньше макета.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright MCP `browser_navigate` снова работает (без `Transport closed`); при viewport `1512x1800` и `1360x1800` метрики `home-hero-media` = `816x720`, `hasHorizontalScroll=false`; скриншоты: `tmp/playwright-home-1512-final.png`, `tmp/playwright-home-1360-final.png`.

- 2026-03-14: Исправлено позиционирование `coin wheel` в home hero по обновлённому Figma (без промежуточного контейнера).
  Причина: после обновления макета `coin wheel` стал самостоятельным слоем; прежняя связка `coin container + inner offset` могла сбивать позицию/интерпретацию размера.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Figma `27:2684` подтверждает `coin wheel x=578 y=-26 w=265 h=265`; Playwright на `http://127.0.0.1:4321/` подтверждает `coinOffsetFromHero {left: 578, top: -26}` и `hasHorizontalScroll=false`; скриншоты: `tmp/playwright-home-coin-fix-1512.png`, `tmp/playwright-home-coin-fix-1360.png`.

- 2026-03-14: Устранён drift `coin wheel` при soft-navigation (`/ -> /cases -> /`) в dev с `ClientRouter`.
  Причина: при HMR/prefetch в dev мог подхватываться stale CSS-снимок с устаревшей геометрией coin; позиция сбивалась после возврата на home.
  Файлы: `src/pages/index.astro`, `src/components/SiteHeader.astro`, `src/styles/global.css`, `tasks/logs.md`, `tasks/lessons.md`.
  Проверки: `npm run build` — успешно; Playwright dev (`http://127.0.0.1:4322/`) 5 циклов `home -> cases -> home` — `offsetLeft=578`, `offsetTop=-26`, `leftComputed=578px`, `hasHorizontalScroll=false` на каждом цикле; Playwright preview (`http://127.0.0.1:4173/`) до/после цикла `home -> cases -> home` — те же значения без регрессии.

- 2026-03-14: Доработан `CaseCard` по hover/layering-контракту: `kissa` с правой обложкой, ассеты за карточкой, stagger-delay и масочная обводка по scallop-периметру.
  Причина: исправить рассинхрон с Figma в геометрии/слоях карточки и удержать единый hover-механизм без slug-хардкода.
  Файлы: `src/data/cases.ts`, `src/components/CaseCard.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в `dist/index.html` и `dist/cases/index.html` подтверждены `data-cover-side="right"` для `kissa`, правый порядок `text -> cover`, и `--case-card-asset-z` для hover-ассетов.

- 2026-03-14: Внедрён `CaseCard v2.1`: нижний hover-ассет выше верхнего, spring `0.4/0.2`, и новая scallop-обводка через opt-in outline API `QuantizedPerimeter`.
  Причина: устранить оставшийся дефект обводки и синхронизировать stacking/motion-контракт с актуальным Figma.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `src/components/CaseCard.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174/cases`) подтвердил `data-perimeter-outline-enabled=true`, `outline opacity 0 -> 1` при hover, z-order ассетов `top=1 / bottom=2`, delay `0 / 0.15`; скриншоты `tmp/case-fora-hover-v21.png`, `tmp/case-kissa-hover-v21.png`.

- 2026-03-14: Переведена scallop-обводка `CaseCard` на геометричный контур без blur (`outlineMode='geometric'`), с fallback `alpha` для других форм/паттернов.
  Причина: filter-based ring давал мягкие/неровные края; требовалась ровная векторная обводка по периметру scallop.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `src/components/CaseCard.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright (`http://127.0.0.1:4174/cases`) подтвердил для cover `data-perimeter-outline-mode='geometric'`, наличие `path` с `vector-effect='non-scaling-stroke'` и отсутствие `feMorphology/feComposite` в outline-слое; screenshot 100%: `tmp/case-fora-outline-geometric-100.png`; дополнительный zoom-стресс скрин через CSS-scale (approx 200%): `tmp/case-fora-outline-geometric-200-sim.png`.

- 2026-03-14: Для типографического токена `description` добавлен lowercase-трансформ.
  Причина: по уточнению пользователя `description` должен рендериться в нижнем регистре на уровне токена, а не локальных переопределений.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "type-description-text-transform|text-transform: var\(--type-description-text-transform\)" src/styles/global.css` подтверждает токен и его применение в `.type-description`.

- 2026-03-15: Обновлён stagger-delay второго hover-ассета в `CaseCard` до `0.08s`.
  Причина: синхронизировать скорость появления второго ассета с актуальным motion-контрактом карточек.
  Файлы: `src/components/CaseCard.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; сборка маршрутов `/`, `/cases`, `/preview`, `/gallery`, `/fora`, `/kissa` выполнена без ошибок.

- 2026-03-15: Откреплён `SiteHeader` от viewport и убрана компенсация fixed-хедера в основном контейнере.
  Причина: хедер должен прокручиваться вместе со страницей (как футер), без лишней пустой полосы перед контентом.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run astro -- check` в текущем окружении зависал без вывода (несколько запусков), процесс остановлен через `pkill -f "astro check"`; Playwright smoke (`http://127.0.0.1:4325`) для `/`, `/cases`, `/gallery`, `/preview` подтвердил `position: static`, `headerMovedWithScroll=true`, `mainPaddingTop=36px` на `/cases|/gallery|/preview` и `240px` на `/` (контракт `page-shell--home`), soft-nav `/ -> /cases -> /gallery` сохраняет `aria-current` (`activeId=gallery`) и `wave-rail`.

- 2026-03-15: Убрана лишняя верхняя дистанция у `home hero` после открепления хедера.
  Причина: при `SiteHeader position: static` высота хедера стала участвовать в потоке, и `page-shell--home: 240px` давал визуально завышенный `Y` (`header + 240`).
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает формулу `page-shell--home { padding-top: calc(240px - var(--site-header-height)); }` и токены `--site-header-top-padding=56`, `--site-header-button-height=40`, `--site-header-height=calc(...)`; `rg` по `src/pages/index.astro` подтверждает порядок `<SiteHeader />` перед `<main class="page-shell page-shell--home">` (источник дополнительного вертикального сдвига при статичном хедере).

- 2026-03-15: Убран скачок `home hero` на reload за счёт стабилизации layout-контракта `wave-rail` fallback в хедере.
  Причина: при `data-wave-rail-ready=false` активная кнопка временно меняла вертикальную геометрию (`--header-button-gap` и `height` fallback-контейнера), что с `SiteHeader position: static` сдвигало весь контент.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "data-wave-variant='wave-rail'.*header-button|header-button-wave-container" src/styles/global.css` подтверждает новые селекторы: gap=0 для `wave-rail` независимо от `ready`, `height:0` для active fallback-контейнера в `wave-rail`, и `ready=true`-правило только с `opacity:0`; Playwright smoke не выполнен из-за локального launcher-конфликта Chrome (`Opening in existing browser session`).

- 2026-03-15: Зафиксирован размер `Badge` и сохранена визуальная Y-компенсация по лейблу.
  Причина: `min-height: 22px` не гарантировал строгое внешнее `22px`; требовался детерминированный размер с оптическим смещением текста вниз на `1px`.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "case-badge|box-sizing: border-box|height: 22px|padding: 1px 8px 0" src/styles/global.css` подтверждает контракт (`height=22`, `box-sizing=border-box`, `padding-top=1`, `padding-bottom=0`).

- 2026-03-15: Убрано наложение «второй волны» в `Header` после reload для `wave-rail`.
  Причина: конфликт специфичности CSS — правило показа fallback-волны активной кнопки перекрывало скрытие при `data-wave-rail-ready='true'`, из-за чего fallback оставался видимым вместе с rail-волной.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg` подтверждает новые фазовые селекторы: fallback-показ только для `:not([data-wave-rail-ready='true'])`, а в `ready=true` fallback скрывается с `opacity: 0` и `visibility: hidden` (включая `.header-button.active .header-button-wave-container` для равной/большей специфичности).

- 2026-03-15: Добавлены appear-анимации для `home hero` (labels, assets, coin rotate, CTA inView one-shot).
  Причина: реализовать motion-контракт hero из Figma/ТЗ: stagger для 6 строк, индивидуальные задержки ассетов, `coin wheel` с `rotate 360`, и `text+button` по триггеру `Layer in View` без replay.
  Файлы: `src/pages/index.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `git diff -- src/pages/index.astro` подтверждает runtime `__homeHeroAppearRuntime` с `animate + inView`, параметры `duration/bounce/ease`, stagger `index * 0.1`, asset-delays (`red 0.05`, `cube 0.1`, `ternimal 0.2`, `path 0.3`) и `amount: 0` для CTA; `rg -n "__homeHeroAppearRuntime|homeHeroCtaAnimated|amount:0|rotate\\(360deg\\)|home-hero-asset--mockup-red" dist/_astro -g"*.js"` подтверждает, что runtime и ключевые параметры попали в собранный бандл; browser smoke-check через Playwright MCP не выполнен из-за launcher-конфликта Chrome (`Opening in existing browser session`).

- 2026-03-15: Вынесен глобальный `inView`-паттерн `appear-v1` и подключён через `BaseLayout`.
  Причина: унифицировать scroll-enter анимации секций/блоков по проекту через фиксированный data-attribute контракт без локальных override.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "data-motion-inview=\\\"appear-v1\\\"|import \\{ animate \\} from 'motion'|import \\{ animate, inView \\} from 'motion'" src/pages/index.astro` подтверждает перевод CTA на data-attribute и удаление локального `inView` из hero runtime; `rg -n "__inViewAppearRuntime|data-motion-inview=\\\"appear-v1\\\"|amount:0|\\[0\\.44,0,0\\.56,1\\]|duration:\\.4" dist/_astro -g"*.js"` подтверждает глобальный preset-runtime в собранном бандле.

- 2026-03-15: Расширено применение `appear-v1` на 9 целевых блоков home и добавлен интерфейсный opt-in для reusable компонентов.
  Причина: закрепить единый scroll-enter паттерн на секциях/блоках home без локальных override и без побочных эффектов на `/cases` и `/preview`.
  Файлы: `src/components/CaseCard.astro`, `src/components/QuantizedPerimeter.astro`, `src/components/CasesCardsSection.astro`, `src/components/DesignToolsSection.astro`, `src/components/AboutMeQScallopSection.astro`, `src/components/QuotesSection.astro`, `src/components/FinalCtaSection.astro`, `docs/inview-appear-v1.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -o "data-motion-inview=\\\"appear-v1\\\"" dist/index.html | wc -l` = `10` (9 новых целей + hero CTA); `rg -o "<a class=\\\"case-card[^\\\"]*\\\"[^>]*data-motion-inview=\\\"appear-v1\\\"" dist/index.html | wc -l` = `2`; `rg -o "<a class=\\\"case-card[^\\\"]*\\\"[^>]*data-motion-inview=\\\"appear-v1\\\"" dist/cases/index.html dist/preview/index.html | wc -l` = `0` (регрессии reusable карточек нет).

- 2026-03-15: Добавлены отдельные `inView`-пресеты для стрелок `cases-cards-description` (left/right) с фиксированными offset/scale/delay.
  Причина: нужны отдельные motion-профили стрелок при сохранении текущего `appear-v1` на parent `cases-cards-description`.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/CasesCardsSection.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n "cases-arrow-left-v1|cases-arrow-right-v1|delay: 0.3|delay: 0.4|translate3d\\(0px, -25px, 0px\\)|translate3d\\(0px, 25px, 0px\\)" src/components/InViewMotionRuntime.astro` подтверждает параметры пресетов; `rg -n "data-motion-inview=\\\"cases-arrow-left-v1\\\"|data-motion-inview=\\\"cases-arrow-right-v1\\\"|data-motion-inview=\\\"appear-v1\\\"" dist/index.html` подтверждает атрибуты у стрелок и parent description на `/`.

- 2026-03-16: Убран лишний нижний trigger реверса у `final-cta-morph-v1` (repeat только при возврате вверх).
  Причина: в `element-repeat` реверс был привязан к `leave` cleanup и срабатывал на любом выходе из порога, включая прокрутку вниз к футеру.
  Файлы: `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в runtime подтверждены `amount: 0.7`, `transition.type: 'spring'`, `duration: 0.6`, `bounce: 0.1`; на `leave` добавлен guard `scrollDirection === 'up'`, поэтому нижний `leave` при скролле вниз игнорируется.

- 2026-03-16: Для `final-cta-morph-v1` убрана «вторая верхняя граница» при скролле вверх через direction-aware threshold state machine.
  Причина: cleanup-based `inView`-реверс на `leave` давал лишний откат/повтор при проходе верхней границы viewport.
  Файлы: `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; runtime переведён на `IntersectionObserver` c `intersectionRatio`, реверс/прямой ход триггерятся только на `cross-up(0.7)` (`down -> final`, `up -> initial`), все `cross-down` игнорируются.

- 2026-03-16: Для `final-cta-morph-v1` заменён ratio-based trigger на single viewport-line trigger (70%).
  Причина: `intersectionRatio` создавал две физические точки срабатывания порога и давал ранний `final -> initial` при подъёме от футера.
  Файлы: `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; runtime теперь использует line-cross detector по `element.getBoundingClientRect().top` относительно `window.innerHeight * 0.7`: вниз (`top > line -> top <= line`) -> `initial -> final`, вверх (`top <= line -> top > line`) -> `final -> initial`; лишних `intersectionRatio leave`-триггеров нет.

- 2026-03-16: Скорректирована семантика `amount` для line-trigger в `final-cta-morph-v1` (entry progress вместо абсолютной Y-линии).
  Причина: формула `line = window.innerHeight * amount` при `amount=0.7` давала визуальный триггер около 30% входа секции; ожидание — около 70% входа.
  Файлы: `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; trigger line считается как `window.innerHeight * (1 - amount)` (для `0.7` это `30vh` сверху), логика single-boundary down/up сохранена.

- 2026-03-16: Реализована страница `/cases` как 1:1 композиция секций из home (`cases cards` + `final cta`) с сохранением текущих анимаций.
  Причина: по макету Figma `37:2302` страница `cases` должна переиспользовать эти же секции и motion runtime без дублирования верстки.
  Файлы: `src/pages/cases.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `src/components/SiteHeader.astro` проверен без изменений (`href: '/cases'` и активное состояние по `pathname === '/cases'` уже реализованы); для `/cases` добавлен `page-shell--cases` и page-specific отступы только на уровне страницы (`.page-shell--cases`, `.page-shell--cases > .final-cta-section`), секции и их `data-motion-*` пресеты не менялись.

- 2026-03-16: Исправлены full-bleed артефакты краёв у `final cta` divider и футера через нативный viewport clipping.
  Причина: большая волна и футер визуально оставляли боковые артефакты (в т.ч. 1–2px полосы у футера) из-за отсутствия явного viewport-клипа/bleed-контракта при `scrollbar-gutter`.
  Файлы: `src/components/FinalCtaSection.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `final cta` переключён на `QuantizedWave fit='cover-bleed' bleedCircles={2}` без изменений runtime; для `.final-cta-divider-bleed` и `.site-footer` добавлен `overflow-x: clip` с fallback `overflow-x: hidden`, а футер переведён на viewport-bleed (`left: 50%`, `width: 100vw`, `translateX(-50%)`) с сохранением текущей `QScallop`-геометрии и `::before` fill-слоя.

- 2026-03-16: Добавлен системный режим `fit='cover'` для rectangle в `QuantizedPerimeter` и включён в футере.
  Причина: при ширинах viewport, не кратных `step`, rectangle-периметр в inside-fit (`floor(width/step)`) оставлял боковые зазоры и визуально выглядел как «срез по квантизации», а не по viewport clipping.
  Файлы: `src/components/QuantizedPerimeter.astro`, `src/components/QuantizedScallop.astro`, `src/components/SiteFooter.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; Playwright-метрики на `/cases` после фикса:
  `1234px -> footer/scallop/frame = 1234/1234/1234, cols=31, leftGap=0, rightGap=0`,
  `1281px -> 1281/1281/1281, cols=33, leftGap=0, rightGap=0`,
  `1367px -> 1367/1367/1367, cols=35, leftGap=0, rightGap=0`.

- 2026-03-16: Реализован `DeviceMockup v1` как отдельный reusable-компонент (без интеграции в страницы/данные).
  Причина: нужен стабильный контракт для слоя `Screen`, чтобы передавать только `png`/`video`-контент при двух типах девайсов.
  Файлы: `src/components/DeviceMockup.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run astro -- check` — не пройдено из-за уже существующих ошибок типизации в проекте (`Result (26 files): 378 errors, 0 warnings, 2 hints`); `npm run astro -- check 2>&1 | rg -n "DeviceMockup|Result \\("` показывает только summary-строку без диагностик по `DeviceMockup`; `rg -n "assets/devices|device\\?:|screenKind:|phone:|tablet:|screenKind === 'video'|autoplay|muted|loop|playsinline|poster=" src/components/DeviceMockup.astro` подтверждает импорт shell из `assets/devices`, оба device-пресета и video-атрибуты.

- 2026-03-16: Актуализированы color/type токены по Figma `2:5119` и `2:5278` с жёсткой миграцией классов без legacy-алиасов.
  Причина: синхронизировать дизайн-токены проекта с новым token spec (`ticket/bg`, `t1-tight`, новый `t5`, `t6`, `description-medium/large`) и убрать использование устаревших `type-t5`/`type-description` в разметке.
  Файлы: `src/styles/global.css`, `src/components/DesignToolsSection.astro`, `src/components/CasesCardsSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `rg -n -- "--color-ticket-bg-(orange|blue)-(critical|high|medium|low|muted)" src/styles/global.css` подтверждает 10 новых color tokens; `rg -n -P -- "\btype-t5\b(?!-)" src/components src/pages src/layouts` и `rg -n -P -- "\btype-description\b(?!-)" ...` — совпадений нет; `rg -n -- "\.type-t1-tight\s*\{|\.type-t6\s*\{|\.type-description-medium\s*\{|\.type-description-large\s*\{" src/styles/global.css` подтверждает новые utility-классы; `metrics-grid strong` переведён на `--type-t6-*`; Playwright smoke-check (`http://127.0.0.1:4178/`) прошёл: computed styles `design-tools-label type-t6 => 20/24/600`, `cases-cards-description-label type-description-medium => 20/22/450/lowercase`, скриншоты `tmp/smoke-home-tokens-2026-03-16.png`, `tmp/smoke-cases-description-2026-03-16.png`, `tmp/smoke-design-tools-2026-03-16.png`.

- 2026-03-16: Реализована универсальная секция `challenge` для `/fora` и подключена вместо `skeleton`-блока.
  Причина: сверстать Figma-блок `38:4625` с переиспользуемым API компонента, сохранив desktop 1:1 контракт и безопасный mobile fallback без горизонтального скролла (верхние текстовые колонки встают в вертикальный стек на узких экранах).
  Файлы: `src/components/CaseChallengeSection.astro`, `src/pages/[slug].astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в `/fora` подключён `CaseChallengeSection` с props-конфигом (title/columns/screen/notes), данные и координаты перенесены из Figma, ассеты берутся из `/assets` (`fora-challenge-mock.png` + 4 svg-стрелки); для Fora-варианта добавлен page-level отступ `margin-top: 216px`.

- 2026-03-16: Исправлена загрузка SVG-стрелок в секции `challenge` на `/fora`.
  Причина: Astro сериализовал импортированные SVG (из `assets`) в строку функции внутри `img src`, из-за чего браузер показывал broken images.
  Файлы: `src/pages/[slug].astro`, `public/media/cases/fora/challenge/arrow-top-left.svg`, `public/media/cases/fora/challenge/arrow-top-right.svg`, `public/media/cases/fora/challenge/arrow-bottom-left.svg`, `public/media/cases/fora/challenge/arrow-bottom-right.svg`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; проверка `dist/fora/index.html`: `src="(...args)=>"` у `case-challenge-arrow` отсутствует (`0`), валидных ссылок на `/media/cases/fora/challenge/arrow-*.svg` — `4`, ссылок `/_astro/fora-challenge-arrow*` — `0`.

- 2026-03-16: Реализована секция `design system` для `/fora` по Figma `49:2438` и подключена вместо `skeleton`.
  Причина: заменить временную заглушку на production-верстку с ассетами из `/assets` и соблюсти desktop-контракт (`816x800`, `margin-top: 268px`) с in-view анимацией.
  Файлы: `src/components/ForaDesignSystemSection.astro`, `src/pages/[slug].astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в `/fora` компонент `ForaDesignSystemSection` подключён после `ForaFeatureCardsSection`, центральный заголовок исправлен на `app design system`, подключены 4 PNG (`design system-image-*`) и 3 SVG-стрелки (`design system-arrow-*`) из `assets`.

- 2026-03-16: Исправлена сериализация `img src` для SVG-стрелок в `ForaDesignSystemSection`.
  Причина: прямой импорт SVG из `assets` в `.astro` давал функцию в `src` (`src="(...args)=>"`), из-за чего стрелки не рендерились.
  Файлы: `src/components/ForaDesignSystemSection.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` содержит валидные `/_astro/design%20system-arrow-*.svg` пути и не содержит `src="(...args)=>"` для стрелок секции.

- 2026-03-16: Стабилизирован dev-runtime для `/` и `/fora` (Vite/Astro overlay + prefetch/runtime ошибки).
  Причина: в `ForaDesignSystemSection` стрелки рендерились как `file:///...` (браузер блокировал local resource), а prefetch-конфиг провоцировал нестабильность virtual modules в dev (`__PREFETCH_*`, `Outdated Optimize Dep`).
  Файлы: `src/components/ForaDesignSystemSection.astro`, `astro.config.mjs`, `public/media/cases/fora/design-system/arrow-top.svg`, `public/media/cases/fora/design-system/arrow-bottom-left.svg`, `public/media/cases/fora/design-system/arrow-bottom-right.svg`, `tasks/logs.md`.
  Проверки: `npm run dev -- --host 127.0.0.1 --port 4324` + Playwright (`/` и `/fora`) — ошибок в консоли нет (`Not allowed to load local resource`, `ReferenceError: __PREFETCH_PREFETCH_ALL__`, `Outdated Optimize Dep` не воспроизводятся); `browser_network_requests` показывает только `200/206` без `504`; `npm run build` — успешно.

- 2026-03-17: Подтверждён и устранён источник повторной ошибки `TypeError ... (reading 'call')` на `localhost:4321` через перезапуск dev-инстанса и актуальный runtime-контекст.
  Причина: на `127.0.0.1:4321` работал stale `astro dev` процесс, который отдавал `500` (`/fora` -> `TypeError`), тогда как свежий инстанс на другом порту рендерился корректно; после restart на том же `4321` ошибка исчезла.
  Файлы: `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `lsof -iTCP:4321` показал активный старый процесс; Playwright до restart: `/fora` с `Page Title: TypeError`; после `kill -TERM` + fresh `npm run dev -- --host 127.0.0.1 --port 4321` Playwright на `/fora` и `browser_console_messages(level:error)` — без ошибок, `Page Title: Fora supermarket app redesign - Vlad Horovyy`.
