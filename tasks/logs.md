# Logs

- 2026-03-19: Исправлен `dark-flash` при soft-nav: тема больше не теряется на swap, а `FloatingThemeButton` не откатывается в `light`.
  Причина: во время `ClientRouter`-swap root-атрибуты `<html>` временно пересоздаются; из-за отсутствия `data-theme` происходил краткий откат на light-токены, что визуально проявлялось как мигание header-кнопок и FAB.
  Файлы: `src/layouts/BaseLayout.astro`, `src/components/FloatingThemeButton.astro`, `tests/smoke/theme-tokens.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в theme-bootstrap добавлен `astro:before-swap` хук, который копирует текущую тему в `event.newDocument.documentElement.dataset.theme` до swap; (2) сохранён существующий `applyTheme` на initial load + `astro:page-load` как safety net; (3) в FAB-runtime добавлен устойчивый `readTheme`: при временно отсутствующем `data-theme` используется `localStorage('vh-theme')`, затем `cachedTheme` (без немедленного fallback в `light`); (4) добавлен smoke-регрессионный тест `dark soft navigation keeps html theme and floating button state stable`, который покадрово проверяет отсутствие промежуточных состояний `htmlTheme !== 'dark'` и `floatingState !== 'dark'` при переходе по header.
  Проверки: (1) `npx playwright test tests/smoke/theme-tokens.spec.ts -g "dark soft navigation keeps html theme and floating button state stable"` — успешно (`1/1`); (2) `npx playwright test tests/smoke/theme-tokens.spec.ts tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`15/15`); (3) `npm run build` — успешно.

- 2026-03-19: Внедрены компонентные токены `button/*`, `ink/bg`, `divider/bg` и выполнен полный sync color-коллекций с Figma (`83:19088` light, `83:19089` dark).
  Причина: по задаче нужно перевести кнопки/глифы/divider на компонентные токены, синхронизировать светлую/тёмную коллекции 1:1 с Figma и сохранить backward compatibility для существующего API иконок.
  Файлы: `src/styles/global.css`, `src/components/Button.astro`, `src/components/ThemedSvgIcon.astro`, `src/components/QuantizedWave.astro`, `tests/smoke/theme-tokens.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в theme-токены добавлены `--color-button-bg/text/arrow/border`, `--color-ink-bg`, `--color-divider-bg`; `--color-icon-accent` оставлен как alias на `--color-ink-bg`; (2) dark-коллекция синхронизирована по Figma, включая `accent/*` (`#79b0e2`); (3) `Button` переведён на `button/*` во всех вариантах/состояниях (`default`, `bordered`, `bordered-icon`); (4) `ThemedSvgIcon` переключён на `ink/bg` как основной fallback; (5) дефолтный цвет `QuantizedWave` переключён на `divider/bg` (включая глобальный стиль и runtime default props), локальный override в `final-cta` также переведён на `divider/bg`; (6) smoke-тест `theme-tokens` расширен проверками новых токенов, alias-резолва, wave/divider-цветов на `/`, `/fora`, `/gallery` и `Button`-вариантов.
  Проверки: (1) `npm run build` — успешно; (2) `npm run verify:svg-icons` — успешно; (3) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`6/6`).

- 2026-03-18: Обновлено значение light-режима у компонентного токена `--color-footer-bg` по актуальному Figma-контракту.
  Причина: в Figma `colors/footer/bg` (node `85:19520`) light-значение изменилось на `#8cbfdb`; dark (node `85:19569`) остаётся `#224b7d`.
  Файлы: `src/styles/global.css`, `tests/smoke/theme-tokens.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) `--color-footer-bg` в `:root/html[data-theme='light']` обновлён `#dbdad1 -> #8cbfdb`; (2) в smoke-тесте обновлены ожидания `footerBg` и computed-цветов футера для light (`rgb(140, 191, 219)`); dark-ожидания сохранены без изменений.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`5/5`).

- 2026-03-18: Для теста убран Y-offset лейбла в `Badge`.
  Причина: по запросу нужно временно отключить вертикальный offset текста в бейдже.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в `.case-badge__label` удалён `transform: translateY(0.5px)`; (2) правило в `tasks/lessons.md` обновлено на “без Y-offset”.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`4/4`).

- 2026-03-18: Для `Badge` убран верхний padding и добавлен `offsetY=0.5px` для лейбла.
  Причина: по фидбеку нужно убрать `padding-top` у бейджа и сохранить визуальную вертикальную компенсацию текста через отдельный offset.
  Файлы: `src/components/Badge.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в `Badge` лейбл обёрнут в `.case-badge__label`; (2) у `.case-badge` padding изменён с `1px 8px 0` на `0 8px`; (3) для `.case-badge__label` добавлен `transform: translateY(0.5px)`; (4) устойчивое правило в `tasks/lessons.md` обновлено под новый контракт.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`4/4`).

- 2026-03-18: `Badge` расширен типом `outlined`; добавлен глобальный dark-override без потери light tone-цветов.
  Причина: по задаче нужно внедрить Figma-вариант `outlined` (`85:19574`) и поведение темы: в dark все badge по умолчанию становятся outlined, при возврате в light восстанавливаются исходные tone-оверрайды.
  Файлы: `src/components/Badge.astro`, `src/styles/global.css`, `tests/smoke/theme-tokens.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в `Badge` добавлен prop `type?: 'default'|'outlined'` (default=`default`) и атрибут `data-badge-type`; tone API сохранён без breaking changes; (2) добавлен класс `.case-badge--outlined`; (3) в `global.css` добавлен dark-theme override `html[data-theme='dark'] .case-badge[data-badge-type='default']` с `background: transparent` и `border: 1.2px solid var(--color-text-secondary)`; (4) в smoke добавлен тест `badge uses outlined in dark for default type and restores tone in light`, включая проверку explicit outlined в обеих темах; (5) обновлено устойчивое правило в `tasks/lessons.md`.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`4/4`).

- 2026-03-18: Добавлен компонентный токен `--color-footer-bg` и футер переведён на него в обоих фоновых слоях.
  Причина: по Figma-контракту `footer bg` должен иметь отдельный публичный токен (`light #dbdad1`, `dark #224b7d`) и не зависеть от `--color-accent-blue`.
  Файлы: `src/styles/global.css`, `src/components/SiteFooter.astro`, `tests/smoke/theme-tokens.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) в light/dark theme-блоки добавлен `--color-footer-bg`; (2) в `SiteFooter` `QuantizedScallop bg` переключён на `var(--color-footer-bg)`; (3) `.site-footer::before` переведён на `background: var(--color-footer-bg)`; (4) smoke-тест расширен: `readThemeTokens()` читает `footerBg`, добавлены ожидания для light/dark, плюс проверка фактического цвета `footer::before` и `.site-footer .quantized-scallop .scallop-frame`.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`3/3`).

- 2026-03-18: Уточнён визуальный контракт `FloatingThemeButton`: tap-scale `0.9`, tokenized motif color и dark offset `-1.5px`.
  Причина: по фидбеку нужно усилить press-анимацию, убрать зависимость от встроенного цвета SVG и компенсировать визуальный центр мотива в dark-теме.
  Файлы: `src/components/FloatingThemeButton.astro`, `src/styles/global.css`, `tests/smoke/theme-tokens.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в runtime FAB `pressIn` изменён `0.96 -> 0.9`; (2) иконки `sun/moon` переведены с `<img>` на CSS mask (`mask-image/-webkit-mask-image`) и окрашиваются через новый токен `--color-button-floating-motif`; (3) токен `--color-button-floating-motif` добавлен в light/dark коллекции и привязан к `--color-accent-blue`; (4) введён `--floating-theme-icon-offset-x` (`0px` default, `-1.5px` для `data-theme-state='dark'`) и скомпонован в transform обеих icon-state веток; (5) smoke-тест расширен проверками press scale до `0.9`, соответствия цвета активного мотива токену акцента и dark translateX `-1.5px`; (6) `tasks/lessons.md` обновлён под новый устойчивый контракт FAB.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`3/3`).

- 2026-03-18: Реализован глобальный `floating theme FAB` (desktop-only) с анимированным SVG-toggle и персистентной сменой темы.
  Причина: по задаче нужно добавить компонент `floating button` из Figma `83:19192`, переключение `light/dark` по tap и сохранить состояние темы между переходами/перезагрузками.
  Файлы: `src/layouts/BaseLayout.astro`, `src/components/FloatingThemeButton.astro`, `src/styles/global.css`, `tests/smoke/theme-tokens.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) в `BaseLayout` убран статичный `data-theme="light"` и добавлен ранний inline-bootstrap темы (`vh-theme` из `localStorage`, fallback `prefers-color-scheme`) + re-apply на `astro:page-load`, чтобы `data-theme` не терялся на soft-nav; (2) добавлен новый `FloatingThemeButton` в `.site-desktop-shell` с `transition:persist`, idempotent runtime (`window`-singleton), `aria-pressed/aria-label` sync, toggle `html[data-theme]` и запись в `localStorage['vh-theme']`; (3) в `global.css` добавлены стили FAB (64x64, radius 40, shadow `2px 4px 15px 2px rgba(0,0,0,0.1)`, fixed `right/bottom 32px`, hover overlay, focus-visible, crossfade blur+scale для `sun/moon` и reduced-motion fallback); (4) smoke `theme-tokens.spec.ts` расширен проверками bootstrap-приоритета (`system` vs `localStorage`), клика по FAB, персистентности темы на soft/hard nav и скрытия FAB в mobile temporary mode.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`3/3`); (3) `npm run test:smoke` — `18/19` (один интермиттентный фейл в pre-navigation тайминге `case switcher`); (4) повторный запуск `npx playwright test tests/smoke/case-details.spec.ts -g "case switcher next"` — успешно (`1/1`).

- 2026-03-18: Расширены color tokens и добавлены light/dark коллекции без UI-тоггла.
  Причина: по задаче нужно синхронизировать цветовые токены с Figma (`83:19088` light, `83:19089` dark), добавить недостающие `button-floating` токены и ввести инфраструктурный theme-контракт через `data-theme`.
  Файлы: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `tests/smoke/theme-tokens.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в `global.css` color tokens вынесены в коллекции `:root, html[data-theme='light']` и `html[data-theme='dark']` с сохранением публичного API имён (`--color-text-*`, `--color-bg-*`, `--color-accent-*`, `--color-ticket-*`); (2) добавлены новые токены `--color-button-floating-bg` и `--color-button-floating-overlay` для обеих тем; (3) в dark оставлен `--color-accent-orange: #79b0e2` строго по текущему Figma; (4) в `BaseLayout` задан явный default `<html data-theme="light">`; (5) добавлен smoke `theme-tokens.spec.ts`, проверяющий значения light/dark для `text/default`, `bg/default`, `ticket/orange/critical`, `button-floating/bg`, переключение через `document.documentElement.dataset.theme` и отсутствие новых runtime ошибок при смене темы.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke -- tests/smoke/theme-tokens.spec.ts` — успешно (`1/1`); (3) dev-runtime проверка — `npm run dev -- --host 127.0.0.1 --port 4321` + `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4321 PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:smoke -- tests/smoke/theme-tokens.spec.ts` — успешно (`1/1`), runtime ошибок при переключении `data-theme` не зафиксировано.

- 2026-03-18: Введён двухскоростной stagger для in-view (`default 0.1`, `dynamic 0.08`) и переключены целевые секции на dynamic-вариант.
  Причина: по задаче нужно разделить ритм `appear-stagger` на два режима, оставить `appear-stagger-v1` дефолтным и ускорить только `intro`, `artifact photos` и tickets в case-details.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/data/case-details/types.ts`, `src/components/QuantizedPerimeter.astro`, `src/components/case-details/CaseDetailIntroSection.astro`, `src/components/KissaArtifactPhotosSection.astro`, `src/components/CaseProcessSection.astro`, `src/components/CaseChallengeSection.astro`, `src/data/case-details/fora.ts`, `src/data/case-details/kissa.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в runtime `appear-stagger-v1.childDelay` изменён `0.08 -> 0.1`; (2) добавлен новый preset `appear-stagger-dynamic-v1` с тем же контрактом и `childDelay: 0.08`; (3) добавлен `process-tickets-row-stagger-dynamic-v1` (`childDelay: 0.08`), при этом старый `process-tickets-row-stagger-v1` сохранён для `/gallery`; (4) `InViewPreset` расширен значением `appear-stagger-dynamic-v1`; (5) guard-ветки компонентов (`CaseDetailIntroSection`, `KissaArtifactPhotosSection`, `CaseProcessSection`, `CaseChallengeSection`, `QuantizedPerimeter`) обновлены для нового preset; (6) в case-details конфиге `intro` (`/fora`, `/kissa`) и `artifactPhotos` (`/kissa`) переключены на `inViewPreset: 'appear-stagger-dynamic-v1'`; (7) в `CaseProcessSection` tickets row переведён на `process-tickets-row-stagger-dynamic-v1` только для case-details (`safeVariant='fora'`), `GalleryRowsSection` оставлен на `process-tickets-row-stagger-v1`.
  Проверки: (1) статические `rg` подтверждают контракт: `appear-stagger-dynamic-v1` применяется в `intro` и `artifact photos`, `CasesCardsSection` остаётся на `appear-stagger-v1`, `CaseProcessSection` использует `process-tickets-row-stagger-dynamic-v1`, `GalleryRowsSection` остаётся на `process-tickets-row-stagger-v1`; (2) `npx playwright test tests/smoke/case-details.spec.ts` — успешно (`3/3`); (3) `npx playwright test tests/smoke/gallery.spec.ts -g \"row-stagger\"` — успешно (`1/1`); (4) `npm run build` — успешно.

- 2026-03-18: Добавлен stagger `appear` для тройки в `cases cards section` на `/` (`fora card -> description -> kissa card`) без двойной анимации карточек.
  Причина: по фидбеку нужно анимировать три элемента блока cases последовательно, сохранив текущие arrow-пресеты и отдельную анимацию `more cases` карточки.
  Файлы: `src/components/CasesCardsSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) `.cases-cards-list` переведён на `data-motion-inview='appear-stagger-v1'`; (2) `CaseCard` для `fora` и `kissa` обёрнуты в stage-узлы с индексами `0` и `2`, `description` получил индекс `1`; (3) у `CaseCard` внутри этого блока убран локальный `inViewPreset='appear-v1'`, у `description` убран локальный `data-motion-inview='appear-v1'`; (4) пресеты стрелок `cases-arrow-left-v1/right-v1` оставлены без изменений, `more cases` карточка остаётся на `appear-v1`.
  Проверки: (1) DOM-проверка через Playwright (`http://127.0.0.1:4321/`) подтверждает контракт: `cases-cards-list=data-motion-inview('appear-stagger-v1')`, `stageIndexes=['0','1','2']`, у двух `.case-card` `data-motion-inview=null`, у `description` `data-motion-inview=null`, стрелки на `cases-arrow-left-v1/right-v1`, `moreCardInview='appear-v1'`; (2) `npx playwright test tests/smoke/case-details.spec.ts` — успешно (`3/3`).

- 2026-03-18: Убран лишний staged-reveal в case-details; `stagger` оставлен только в `intro` и `artifact photos`, локальный dev-сервер переподнят.
  Причина: по фидбеку пользователя новые stagger-анимации в `intro screens/challenge/process/feature cards` создавали визуальный шум.
  Файлы: `src/data/case-details/fora.ts`, `src/data/case-details/kissa.ts`, `src/components/CaseChallengeSection.astro`, `src/components/CaseProcessSection.astro`, `src/components/FeatureCard.astro`, `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/components/case-details/CaseDetailSections.astro`, `src/components/case-details/CaseDetailIntroSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в конфигах кейсов возвращены `introScreens/challenge/process` на `inViewPreset: 'appear-v1'`; `intro` и `kissa artifactPhotos` оставлены на `appear-stagger-v1`; (2) убраны stage-атрибуты и stagger-wiring из `CaseChallengeSection`, `CaseProcessSection`, `FeatureCard`; (3) удалена sequence/stagger-цепочка из `IntroScreensQuantizedPerimeterSection` и связки в `CaseDetailSections`, при этом сохранён фикс геометрии `.fora-intro-screens-surface` (`432px`); (4) `tasks/lessons.md` синхронизирован под новое устойчивое правило: stagger в case-details только для `intro` + `artifact photos`.
  Проверки: (1) `rg -n "appear-stagger-v1" src` — в применении секций остаются только `intro` и `artifact photos` (остальные вхождения в runtime/типы/гварды); (2) `npx playwright test tests/smoke/case-details.spec.ts` — успешно (`3/3`); (3) dev-сервер перезапущен вручную и слушает `http://127.0.0.1:4321/` (`lsof` подтверждает LISTEN).

- 2026-03-18: Исправлена деформация `QuantizedPerimeter` в `intro screens` (`/fora`, `/kissa`) и добавлена регрессия в smoke.
  Причина: периметр `intro screens` снапился в `96px` по высоте (`rows=2`) и рендерил `viewBox 816x96` при фактическом размере `816x432`, из-за чего scallop-лопасти визуально растягивались.
  Файлы: `src/styles/global.css`, `tests/smoke/case-details.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) у `.fora-intro-screens-surface` заменён процентный size-контракт на явный фиксированный `height/min-height/max-height = 432px`, чтобы budget для `QuantizedPerimeter` был детерминированным; (2) в `case-details` smoke добавлен helper `assertIntroScreensPerimeterIntegrity` и проверки для `/fora` (phone) и `/kissa` (tablet): `rows=9`, `snapMismatch != true`, `|rectHeight - viewBoxHeight| <= 1`.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/case-details.spec.ts` — успешно (`3/3`); (3) runtime-проверка Playwright (`http://127.0.0.1:4321`): `/fora` и `/kissa` дают `rows='9'`, `mismatch='false'`, `rectHeight=432`, `viewBoxHeight=432`, `delta=0`.

- 2026-03-18: Доработаны stagger/inView цепочки для `intro screens`, `challenge` и `feature cards` + синхронизирована motion-документация.
  Причина: по фидбеку требовалось исправить три дефекта поведения: (1) продолжение цепочки `intro -> intro screens`, (2) отдельный inView-триггер `screen with descriptions` в `challenge`, (3) вернуть `appear` на весь `feature card` и оставить отдельный stagger текста.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/case-details/CaseDetailSections.astro`, `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/components/CaseChallengeSection.astro`, `src/components/FeatureCard.astro`, `src/styles/global.css`, `docs/inview-presets-reference.md`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в runtime добавлена sequence-поддержка для `appear-v1` (`data-motion-sequence-after/source`) с `motion:sequence-complete` и в reduced-motion ветке; (2) для `intro`/`intro screens` внедрена явная цепочка `intro(source) -> intro screens surface(appear-v1, after intro, source) -> intro screens mockups(appear-stagger-v1, after surface)` на обоих кейсах через shared `CaseDetailSections`; (3) в `challenge` убран единый root-trigger, top-блок и scene-блок переведены на независимые inView-root, порядок scene-групп сохранён `top-right -> top-left -> bottom-right -> bottom-left`; (4) в `feature card` root переведён на `appear-v1`, текстовый блок — отдельный `appear-stagger-v1` (`badge/title/subtitle`); (5) обновлены `docs` под sequence-контракт staged/element режимов, intro-chain и split-trigger `challenge`; (6) обновлены устойчивые правила в `tasks/lessons.md`.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/case-details.spec.ts` — успешно (`3/3`); (3) runtime-check Playwright (`/fora`, viewport `1440x2200`) подтверждает порядок intro-chain по таймингам: `anim:intro (208.7ms) -> seq:fora-intro-complete-v1 (934.4ms) -> anim:intro-surface (934.8ms) -> seq:fora-intro-screens-surface-complete-v1 (1349.0ms) -> anim:intro-track (1349.3ms)`; (4) runtime-check `challenge` подтверждает split-trigger: `topAnimated=true` при первом входе и `sceneAnimated=false` до входа scene, затем `sceneAnimated=true`; (5) runtime-check `feature card` подтверждает `cardInView='appear-v1'`, `textInView='appear-stagger-v1'`, индексы `['0','1','2']`; (6) runtime-check reduced-motion (`/kissa`) подтверждает финальные состояния и отсутствие блокировки цепочки (`intro/surface/track data-motion-inview-animated='true'`, `firstMockOpacity='1'`); (7) локальный dev-сервер перезапущен и доступен на `http://127.0.0.1:4321/`.

- 2026-03-18: Откат последних правок по фиксу микровспышки на `/` по запросу.
  Причина: предложенный фикс не дал ожидаемого эффекта.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Что сделано: удалены добавленные в последнем проходе изменения (`html background` в `global.css`, условие `html:not([data-astro-transition])` для `home-hero[pending]`, defer-монтаж `mountHeroWhenReady` и helper `isAstroTransitionActive` в `index.astro`, а также соответствующая запись в логе).
  Проверки: `rg` не находит маркеры откатываемого патча (`isAstroTransitionActive`, `homeHeroAppearMountScheduled`, `html:not([data-astro-transition])`, `Устранён источник микровспышки`).

- 2026-03-18: Устранена микровспышка при переходе на `/` с сохранением hero-анимации на каждый вход.
  Причина: при soft navigation на `home` runtime сначала показывал hero, затем принудительно сбрасывал элементы в `opacity: 0`, что давало краткий `visible -> hidden -> visible` эффект.
  Файлы: `src/pages/index.astro`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `tasks/logs.md`.
  Что сделано: (1) введён DOM-state контракт `data-home-hero-appear='pending|running|done'` и SSR-state `pending` у `.home-hero`; (2) добавлен pre-arm CSS для `pending` (initial opacity/transform для `.home-hero-line` и `.home-hero-asset`, включая coin-variant), чтобы первый кадр сразу был в начальном состоянии; (3) runtime `home-hero` переведён на state-машину `pending -> running -> done` с завершением по `Promise.allSettled(control.finished)`; (4) анимация снова запускается keyframes `0 -> 1` на каждом входе; (5) добавлен `noscript` fallback-override, чтобы при отключённом JS hero не оставался скрытым.
  Проверки: (1) `npm run build` — успешно; (2) headless Playwright probe для `/cases -> /`, `/gallery -> /`, `/kissa -> /` подтверждает отсутствие паттерна `first opacity = 1`, затем падение к `0` (`hasFlashPattern=false` во всех трёх сценариях) и наличие анимации (`hasAnimation=true`); (3) hard-load `/` подтверждает активную hero-анимацию (`state=running`, `lineOpacity` растёт до `1`); (4) `prefers-reduced-motion: reduce` на soft-nav и hard-load приводит к `state=done`, `linesMin=1`, `assetsMin=1`; (5) `javascriptEnabled=false` подтверждает `noscript` fallback (`lineOpacity=1`, `assetOpacity=1`, transform без смещений).

- 2026-03-18: Для `TemporaryAdaptiveNotice` добавлен staged inView-reveal на базе `appear-v1` с фиксированным шагом задержки `+0.1` (`screens -> title -> subtitle -> button`).
  Причина: по задаче нужно было анимировать временный mobile/tablet-экран последовательным reveal в 4 шага, не вводя локальные override и не меняя API `Button`.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/TemporaryAdaptiveNotice.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) добавлен preset `temporary-adaptive-stagger-v1` (`mode='stagger-children'`, `childSelector='[data-temp-stage-item]'`, `childDelay=0.1`, transform/transition как у `appear-v1`); (2) в `TemporaryAdaptiveNotice` на контент-контейнер добавлен `data-motion-inview='temporary-adaptive-stagger-v1'`; (3) размечены 4 stage-элемента с индексами `0/1/2/3`, для кнопки добавлена отдельная wrapper-обёртка; (4) в `tasks/lessons.md` зафиксирован устойчивый контракт нового preset.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke -- tests/smoke/temporary-adaptive.spec.ts` — успешно (`8/8`); (3) статическая проверка `rg` подтверждает наличие preset-а, `data-temp-stage-item` и корректных `data-motion-stagger-index` в разметке.

- 2026-03-18: Глобально добавлено crisp text сглаживание для `body` (`-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`).
  Причина: на macOS текст местами визуально утяжелялся; требовалось унифицировать рендеринг и сделать гарнитуру чуть «чище» без изменения токенов веса/размера.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: (1) код — в `src/styles/global.css` подтверждены обе директивы в блоке `body`; (2) сборка — `npm run build` успешно, в `dist` обе директивы присутствуют в итоговом CSS (`body{...-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale...}`); (3) runtime — через headless Playwright проверены `/`, `/fora`, `/gallery`: `getComputedStyle(document.body).getPropertyValue('-webkit-font-smoothing') === 'antialiased'` на всех трёх страницах.

- 2026-03-18: Убран double-overscan у `webm` в `phone+small` для `TemporaryAdaptiveNotice`.
  Причина: после ввода `screen` overscan (`+1px`) для `phone/small` видео-ветка продолжала применять дополнительный `video-bleed -1px`, из-за чего суммарный overscan становился двойным и `screen` визуально «разъезжался» только на `webm`.
  Файлы: `src/components/DeviceMockup.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в `DeviceMockup` добавлен bleed-бюджет на уровне пресета (`videoBleedPxBySize`); (2) для `phone+small` выставлен `videoBleedPx=0`, для остальных конфигураций сохранён `1`; (3) `video-bleed` переведён на CSS var `--video-bleed-px` вместо жёсткого `-1px`; (4) в temporary smoke добавлены assert'ы для `video-bleed inset == 0px` у `phone+small` и проверка aperture-покрытия без лишнего вылеза (`within + noExcess`), замер сделан с временным отключением `item`-rotation, чтобы исключить bbox-артефакт.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke -- tests/smoke/temporary-adaptive.spec.ts` — успешно (`8/8`); (3) `npm run test:smoke` — успешно (`13/13`).

- 2026-03-18: Для `phone+small` в `DeviceMockup` уменьшен `screen radius` до `12` и добавлена системная компенсация AA-просвета по периметру.
  Причина: по фидбеку в temporary adaptive радиус экрана был великоват, а пиксельный просвет наблюдался со всех сторон; нужно было закрыть это на уровне геометрии `screen`, а не route-специфичными стилями.
  Файлы: `src/components/DeviceMockup.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) для `phone.sizes.small.screen` выставлен `radius: 12`; (2) для `phone+small` добавлен симметричный overscan `1px` в геометрии `screen` (`x/y -1`, `width/height +2`); (3) calibration marker обновлён на `data-device-screen-calibration='aperture-small-v2-aa'`; (4) в temporary smoke добавлены проверки `border-radius ~12px` и aperture-alignment по shell alpha (`withinX/withinY`), сохранены strict `screenGapTop/Bottom <= 0.2`.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke -- tests/smoke/temporary-adaptive.spec.ts` — успешно; (3) `npm run test:smoke` — успешно.

- 2026-03-18: Переведён `TemporaryAdaptiveNotice` на явный `DeviceMockup size='small'` и добавлена AA-aware aperture-калибровка `phone/small`.
  Причина: убрать зависимость от `scale` в временном mobile/tablet-режиме и системно закрыть риск top/bottom просветов через калиброванную aperture-геометрию.
  Файлы: `src/components/DeviceMockup.astro`, `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) `DeviceMockup` расширен до `size='small'`, добавлен `phone.sizes.small` (`142.74x293.085`) на `frameFromAperture(...)`; (2) добавлен marker `data-device-screen-calibration='aperture-small-v1-aa'` для `phone+small`; (3) `TemporaryAdaptiveNotice` переведён на `size='small'` без `scale`, удалены scale-константы (`DEVICE_MOCKUP_SCALE`, `fixedDeviceScale`, `--temporary-device-scale`), gap трека зафиксирован явно (`23.4px`) и fallback-gap в runtime читается из CSS `gap`; (4) smoke-тест обновлён: assert `data-device-size='small'`, отсутствие inline `--device-scale`, новый calibration marker, сохранены проверки `screenGapTop/Bottom <= 0.2`, autoplay/reduced-motion/drag/arc.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke -- tests/smoke/temporary-adaptive.spec.ts` — успешно (`8/8`); (3) `npm run test:smoke` — успешно (`13/13`).

- 2026-03-17: Починен scale-regression в `intro screens (QuantizedPerimeter)` для `phone` и `tablet` после доработки `DeviceMockup`.
  Причина: `DeviceMockup` всегда инлайнил `--device-scale: 1`, из-за чего слетали секционные scale-контракты боковых mockup; дополнительно scale был размазан между inline/CSS и не имел устойчивого приоритета.
  Файлы: `src/components/DeviceMockup.astro`, `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/styles/global.css`, `tests/smoke/case-details.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke -- tests/smoke/case-details.spec.ts` — успешно (`3/3`); runtime-замер Playwright (`1360px`) подтверждает контракт intro screens: `/fora` `174x357.266 / 244x501 / 174x357.266` (`scale 0.7131147541 / 1 / 0.7131147541`), `/kissa` `211x362.109 / 296x508 / 211x362.109` (`scale 0.7128378378 / 1 / 0.7128378378`).

- 2026-03-17: Для `DeviceMockup phone compact` введена AA-aware aperture-калибровка (`aperture-compact-v2-aa`) для устранения боковых seam-линий.
  Причина: прозрачная aperture-калибровка (`v1`) не покрывала полу-прозрачную AA-кайму shell, из-за чего по левому/правому краю оставался заметный «пиксель».
  Файлы: `src/components/DeviceMockup.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`5/5`). В smoke `/gallery` обновлён маркер на `aperture-compact-v2-aa` и добавлена проверка покрытия `aaAwareHole` (transparent-hole, расширенный на `1px` по X/Y).

- 2026-03-17: Для `DeviceMockup phone compact` добавлена aperture-калибровка `screen` (устранение правого «гуляющего» пикселя в gallery/webm).
  Причина: после фикса низа оставался дрейф справа — `screen` всё ещё немного расходился с реальным прозрачным окном `Shell-phone`.
  Файлы: `src/components/DeviceMockup.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`5/5`). В smoke `/gallery` добавлены проверки `data-device-screen-calibration='aperture-compact-v1'` и aperture-alignment для карточки `51:5269` (alpha-анализ shell PNG + сравнение границ `screen` с transparent hole по X/Y).

- 2026-03-17: Исправлен белый нижний seam и микроподрез shell в `DeviceMockup compact` (gallery webm cards).
  Причина: `shell` в compact рендерился с `object-fit: cover` и давал микрокроп из-за несовпадения ratio; video anti-seam через `transform: scale(...)` создавал субпиксельный дрейф на rounded-краях.
  Файлы: `src/components/DeviceMockup.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`5/5`); smoke `/gallery` подтверждает `object-fit: fill` на `.device-mockup__shell`, наличие `data-device-video-bleed` wrapper и `transform: none` у video.

- 2026-03-17: Переведён `/gallery` с `scale` на явный `DeviceMockup size='compact'` (без gallery-скейла).
  Причина: стабилизировать посадку screen в shell и убрать субпиксельный дрейф от scale-пайплайна в gallery.
  Файлы: `src/components/DeviceMockup.astro`, `src/components/GalleryCard.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`5/5`); smoke `/gallery` подтверждает `data-device-size='compact'` и размеры `phone ~216x443`, `tablet ~258x443`.

- 2026-03-17: Исправлен масштаб `DeviceMockup` в `/gallery` под Figma-контракт (`phone 216x443`, `tablet 258x442`) через prop `scale` в компоненте.
  Причина: gallery-override через CSS не применялся стабильно (в runtime `--device-scale` оставался `1`), из-за чего девайсы были визуально крупнее макета.
  Файлы: `src/components/DeviceMockup.astro`, `src/components/GalleryCard.astro`, `src/styles/global.css`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`4/4`), включая size-assert для gallery (`phone ~216x443`, `tablet ~258x442`, `--device-scale != 1`).

- 2026-03-17: Для gallery-карточки `51:5287` (`cube`) подключён `loader_light.webm` с autoplay/loop (muted, playsinline) вместо статичного изображения.
  Причина: по фидбеку этот узел из Figma должен быть motion-контентом, как на других секциях с `loader_light`.
  Файлы: `src/components/GalleryCardIllustration.astro`, `public/media/gallery/illustrations/loader-light.webm`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`4/4`, включая проверку autoplay для `.gallery-card-illustration--cube video`).

- 2026-03-17: Перенесено управление скруглением `phone`-экрана на уровень `DeviceMockup`; gallery переведена на рендер через `DeviceMockup` без локального screen/shell override.
  Причина: по фидбеку радиус должен задаваться централизованно в компоненте mockup, а не gallery-специфичными стилями.
  Файлы: `src/components/DeviceMockup.astro`, `src/components/GalleryCard.astro`, `src/styles/global.css`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`4/4`).

- 2026-03-17: Уточнено скругление `phone` screen-wrap в `/gallery` до `20px` (вместо `35px`).
  Причина: по фидбеку нужно ещё уменьшить радиус для более плотного совпадения с shell без зазоров.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-17: Подкорректировано скругление `phone` screen-wrap в `/gallery` с `40px` до `35px`.
  Причина: при `40px` визуально появлялся избыточный зазор по углам экрана; требовался более плотный фит без вылезания контента за shell.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно.

- 2026-03-17: Реализован пакет доработок `/gallery`: device-screen clipping для `phone`, autoplay `webm` в mockup-карточках, critical load для device-карточек первых двух рядов, row-based inView-stagger и изоляция route-transition от shared `page-content`.
  Причина: привести `/gallery` к согласованному поведению с остальными страницами (autoplay flow-видео, предсказуемый first paint для верхних рядов, мягкий вход по рядам без scale-морфа между разными сетками).
  Файлы: `src/data/gallery.ts`, `src/components/GalleryCard.astro`, `src/components/GalleryRowsSection.astro`, `src/styles/global.css`, `src/pages/gallery.astro`, `tests/smoke/gallery.spec.ts`, `public/media/gallery/flows/{r1-c2-phone,r2-c3-tablet,r3-c2-phone,r3-c4-phone,r4-c1-phone,r5-c1-phone,r6-c1-phone}.webm`, `public/media/gallery/posters/{r1-c2-phone,r2-c3-tablet,r3-c2-phone,r3-c4-phone,r4-c1-phone,r5-c1-phone,r6-c1-phone}.png`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно (включая автогенерацию poster-файлов для новых `gallery/flows`); `npm run test:smoke` — успешно (`4/4`, включая новый `tests/smoke/gallery.spec.ts`); проверка `dist/gallery/index.html` подтверждает `7` `<video class="gallery-card-device__screen">`, `5` `data-gallery-card-priority="critical"` (device-карточки первых двух рядов), `6` row-stagger триггеров `process-tickets-row-stagger-v1` и `21` `data-motion-stagger-item`; runtime-проверка из smoke подтверждает разные `data-astro-transition-scope` для `/cases` и `/gallery` (изоляция transition-пула).

- 2026-03-17: Продолжена замена `gallery` ассетов на оригиналы из `/assets` (без Figma-копий) — перегенерированы 7 `screen`-PNG из исходных `.webm`.
  Причина: процесс миграции прервался; часть `public/media/gallery/screens/*` не совпадала ни с одним source-файлом в `/assets/gallery/static` и оставалась промежуточным экспортом.
  Файлы: `public/media/gallery/screens/r1-c2-phone.png`, `public/media/gallery/screens/r2-c3-tablet.png`, `public/media/gallery/screens/r3-c2-phone.png`, `public/media/gallery/screens/r3-c4-phone.png`, `public/media/gallery/screens/r4-c1-phone.png`, `public/media/gallery/screens/r5-c1-phone.png`, `public/media/gallery/screens/r6-c1-phone.png`, `tasks/logs.md`.
  Проверки: (1) source-верификация — каждый из 7 PNG побайтно совпадает с кадром, заново извлечённым из `assets/gallery/{Scenic-Path,Portal,Echo-Journal,Lights,Red-Lights,Fora,Zeely}-Gallery.webm` (для `r5-c1` с `scale=389:848`); (2) `rg -n "figma.com/api/mcp/asset|/@fs/.*/assets/gallery" src public` — совпадений нет; (3) `npm run build` — успешно.

- 2026-03-17: Исправлено «перемешивание» слоёв в `intro screens (tablet)` на `/kissa`: overlap теперь работает как единые карточки mockup (центр сверху, боковые снизу) без interleave экранов.
  Причина: внутренние `z-index` (`screen/shell`) конкурировали глобально между разными `DeviceMockup`, потому что у mockup не было собственного stacking context, а у tablet-item был `z-index: auto`.
  Файлы: `src/components/DeviceMockup.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`2/2`); runtime Playwright (`/kissa`, `1360px`) подтверждает: `.device-mockup { isolation:isolate }`, `z-index`: `center=2`, `left/right=1`; `elementFromPoint` в зонах `left-center` и `right-center` попадает в `center`-устройство, а не в боковой `screen`.

- 2026-03-17: Скорректирован `DeviceMockup tablet` под обновлённый `Shell-tablet` (Figma `43:1811`): `Screen` возвращён под shell, скругление экрана убрано.
  Причина: в `assets/devices/Shell-tablet.png` удалена лишняя область перекрытия, поэтому надёжнее рендерить экран без радиуса и под shell-слоем.
  Файлы: `src/components/DeviceMockup.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`2/2`); runtime-проверка Playwright (`/kissa`, preview `1360px`) подтвердила для `.device-mockup--tablet`: `screenZ=1 < shellZ=2`, center inset `11.5px`, left inset при scale `.712838` равен `8.1875px`, `border-radius=0px`.

- 2026-03-17: Доработан `DeviceMockup` для контракта `kissa`/Figma `43:1799`: у `tablet` экран теперь выше shell и корректно масштабирует inset/radius, у `phone` добавлен надёжный клип экрана по скруглению.
  Причина: нужно было устранить несоответствия по слоям и масштабированию (`tablet`), а также гарантировать, что контент `phone`-экрана не выходит за края `Shell-phone`.
  Файлы: `src/components/DeviceMockup.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`2/2`); дополнительная Playwright-проверка через `npm run preview -- --host 127.0.0.1 --port 4177` подтвердила `tablet` на `/kissa`: center `top/left=11.5px`, left при `--device-scale=.712838` -> `top/left=8.1875px`, `screenZ=2 > shellZ=1`, `radius 17.524 -> 12.4918`; для `phone` (на `/fora`, где он используется в текущем состоянии) подтверждены `radius=40px`, `overflow=hidden`, `screenZ=1 < shellZ=2`.

- 2026-03-17: Для `/fora` внедрены inView-анимации по плану: `appear-v1` добавлен на top-level блоки (`intro`, `challenge`, `process`, `case switcher`), а `feature cards` переведены на по-карточечный reveal вместо анимации всей секции.
  Причина: требовалось унифицировать scroll-enter на странице кейса и сохранить отдельную анимацию карточек фич.
  Файлы: `src/pages/[slug].astro`, `src/components/CaseChallengeSection.astro`, `src/components/CaseProcessSection.astro`, `src/components/CaseSwitcherSection.astro`, `src/components/FeatureCard.astro`, `src/styles/global.css`, `src/components/InViewMotionRuntime.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает `appear-v1` на `fora-intro-section/case-challenge-section/case-process-section/case-switcher-section` (по `1` вхождению), отсутствие `appear-v1` у `fora-feature-cards-section` (`0`), наличие `appear-v1` у `fora-feature-card` (`3`), `process-tickets-row-stagger-v1` у `tickets-row` (`2`), `data-motion-stagger-item` (`9`).

- 2026-03-17: Добавлен fixed preset `process-tickets-row-stagger-v1` в глобальный runtime (`stagger-children`) для `process tickets rows` с offset `Y=25` и задержкой `+0.05s` на карточку внутри ряда.
  Причина: нужен отдельный паттерн, похожий на `appear-v1`, но с меньшим начальным смещением и поэтапным входом карточек.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/CaseProcessSection.astro`, `docs/inview-appear-v1.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в `dist/fora/index.html` у `case-process-section__tickets-row` есть `data-motion-inview="process-tickets-row-stagger-v1"`, карточки размечены `data-motion-stagger-item` + `data-motion-stagger-index`.

- 2026-03-17: Исправлен баг `case switcher` — обложка теперь рендерится как фон внутри формы `Perimetr Scallop Circle`, а не как отдельная «пилюля» поверх.
  Причина: стили маски/клипа для `.case-switcher-cover` были в scoped-стиле компонента и не применялись к DOM-узлам, созданным внутри `QuantizedPerimeter` (другой scope `data-astro-cid`), из-за чего срабатывал глобальный circle-clip (`overflow:hidden`, `border-radius:999px`) и `mask-image` у cover оставался `none`.
  Файлы: `src/components/CaseSwitcherSection.astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; runtime `/fora` (`http://127.0.0.1:4321/fora`) подтверждает для `.case-switcher-cover[data-ready='true']`: `.scallop-content` = `overflow: visible`, `border-radius: 0px`; `.case-switcher-cover-image` = `mask-image != none`, `-webkit-mask-image != none`; регрессия `/cases` отсутствует — у `.case-card-cover-image` маска по-прежнему активна (`mask-image != none`), `.case-card-cover .scallop-content` остаётся `overflow: visible`.

- 2026-03-17: Исправлен рендер cover в `case switcher` — обложка больше не лежит поверх круга, а работает как фон формы `Perimetr Scallop Circle`.
  Причина: глобальный circle-rule в `QuantizedPerimeter` клипал `.scallop-content` в обычный круг (`border-radius: 999px`), из-за чего scallop-периметр частично скрывался и проявлялся только снизу.
  Файлы: `src/components/CaseSwitcherSection.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в компоненте добавлен override `.case-switcher-cover.quantized-perimeter[data-scallop-shape='circle'][data-ready='true'] .scallop-content { overflow: visible; border-radius: 0; }`, маска cover остаётся через `--perimeter-content-mask`.

- 2026-03-17: Реализована универсальная секция `case switcher` для `/fora` и заменён соответствующий skeleton-блок.
  Причина: по согласованному плану требовалось сверстать `case switcher section` из Figma `49:2672`, подключить ассеты из `/assets`, добавить `Perimetr Scallop Circle` на cover и восстановить навигацию `prev/next`.
  Файлы: `src/components/CaseSwitcherSection.astro`, `src/pages/[slug].astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает наличие `case-switcher-section` и отсутствие `fora-section-skeleton--case-switcher`; в новой секции присутствуют `data-perimeter-shape="circle"` + `data-perimeter-edge-pattern="scallop"`; рендерятся две ссылки `href="/kissa"` (`prev`/`next`) и cover-ассет из `assets` (hashed `_astro/fora cover.*`).

- 2026-03-17: Для `/fora` реализована секция `team photo` по Figma `49:2607` через `QuantizedPerimeter (scallop, step=48)` и заменён соответствующий skeleton-блок.
  Причина: по согласованному плану нужно было внедрить рабочую desktop-only секцию с точными размерами/координатами, не затрагивая остальные секции.
  Файлы: `src/components/TeamPhotoQuantizedPerimeterSection.astro`, `src/pages/[slug].astro`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `dist/fora/index.html` подтверждает наличие `fora-team-photo-section`, отсутствие `fora-section-skeleton--team-photo`, а также `data-perimeter-step="48"` и `data-perimeter-clip-content-to-shape="true"` в новой секции.

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

- 2026-03-17: Обновлены runtime PNG ассеты секции `design system` для `/fora` из новых исходников в `assets/images/fora`.
  Причина: старый экспорт PNG имел некорректный масштаб из-за деформированных теней; пользователь пересохранил исходники.
  Файлы: `public/media/cases/fora/design-system/design-system-image-summary.png`, `public/media/cases/fora/design-system/design-system-image-horizontal-cards.png`, `public/media/cases/fora/design-system/design-system-image-vertical-cards.png`, `public/media/cases/fora/design-system/design-system-image-sheet.png`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: размеры runtime-файлов после замены соответствуют новым исходникам (`681x861`, `1170x774`, `930x849`, `792x879`); `npm run build` — успешно.

- 2026-03-17: Актуализированы размеры и позиции PNG-ассетов `design system` под текущую Figma-ноду `49:2438`.
  Причина: после реэкспорта PNG изменились их bounding-box, а в коде оставались старые координаты/габариты, из-за чего визуал не совпадал с дизайном.
  Файлы: `src/components/ForaDesignSystemSection.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; в компоненте синхронизированы значения из Figma (`summary: x0 y-11 w227 h287`, `horizontal: x460 y23 w390 h258`, `vertical: x93 y401 w310 h283`, `sheet: x426 y535 w264 h293`).

- 2026-03-17: Закрыты пункты ревью по `/fora`: автопостеры, активный `cases` tab на case-страницах, ослабление slug-хардкода и чистка placeholder/typo.
  Причина: устранить ручной post-production ассетов, убрать визуальные заглушки в feature cards и подготовить базу для масштабирования кейсов.
  Файлы: `scripts/generate-video-posters.mjs`, `package.json`, `src/components/FeatureCard.astro`, `src/components/ForaFeatureCardsSection.astro`, `src/components/SiteHeader.astro`, `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/components/case-details/ForaCaseDetail.astro`, `src/pages/[slug].astro`, `src/components/CaseSwitcherSection.astro`, `src/data/cases.ts`, `public/media/fora/feature-cards/posters/Fora-Delivery.png`, `public/media/fora/feature-cards/posters/Fora-Cart.png`, `tasks/fora-hardening-scale-plan.md`, `tasks/logs.md`.
  Проверки: `npm run generate:posters` — успешно (сканирование ограничено `.../flows/*.webm`, перегенерированы пустые/устаревшие постеры, для двух flow применён fallback `thumbnail`), `npm run build` — успешно; визуально проверено, что `Fora-Delivery.png` и `Fora-Cart.png` больше не пустые.

- 2026-03-17: Актуализирован `tasks/fora-hardening-scale-plan.md` в формат `Done / Next`.
  Причина: пользователь попросил привести план в соответствие с уже выполненными правками, чтобы убрать дубли и оставить только следующий этап.
  Файлы: `tasks/fora-hardening-scale-plan.md`, `tasks/logs.md`.
  Проверки: ручная валидация структуры плана — `Done` отражает реализованные пункты (автопостеры, active tab, декомпозиция, чистка), `Next` содержит только невыполненный backlog.

- 2026-03-17: Закрыт full-pass `N1–N4` по hardening/scale архитектуры case-detail страниц (`/fora`, `/kissa`).
  Причина: выполнить согласованный план целиком — guardrails медиа, data-driven detail, унификация ассетов и CI smoke-контур.
  Файлы:
  `.github/workflows/deploy.yml`, `README.md`, `package.json`, `package-lock.json`, `playwright.config.ts`, `tests/smoke/case-details.spec.ts`, `scripts/verify-video-posters.mjs`, `src/data/case-details/types.ts`, `src/data/case-details/fora.ts`, `src/data/case-details/index.ts`, `src/components/case-details/CaseDetailIntroSection.astro`, `src/components/case-details/CaseDetailSections.astro`, `src/pages/[slug].astro`, `src/data/cases.ts`, `src/components/ForaFeatureCardsSection.astro`, `src/components/ForaDesignSystemSection.astro`, `src/components/TeamPhotoQuantizedPerimeterSection.astro`, `src/components/case-details/ForaCaseDetail.astro` (удалён), `public/media/cases/fora/**`, `public/media/cases/kissa/**`, legacy-файлы `public/media/fora*`, `public/media/kissa-hero.svg`, `public/media/cases/*-cover|*-summary|*-terminal|*-coin-wheel` (удалены/перенесены).
  Проверки:
  `npm run verify:posters` — успешно (`3` flow/poster пары валидны по пути, размеру и PNG-метаданным);
  `npm run build` — успешно (сгенерированы все роуты, включая `/fora` и `/kissa`);
  `npm run test:smoke` — успешно (`2/2` теста: `/fora` key sections + active `cases`, `/kissa` fallback + nav + switcher).

- 2026-03-17: Обновлён `tasks/fora-hardening-scale-plan.md` после завершения этапа `N1–N4`.
  Причина: зафиксировать фактический статус (перевод блока `Next` в `Done`, добавить follow-up без смешения с закрытым этапом).
  Файлы: `tasks/fora-hardening-scale-plan.md`, `tasks/logs.md`.
  Проверки: ручная сверка структуры — отражены реализованные пункты `N1`, `N2`, `N3`, `N4` и текущие `Exit criteria`.

- 2026-03-17: `/kissa` переведён на полноценный data-driven detail-config по Figma `50:2705` с новой секцией `artifact photos` (`50:4939`).
  Причина: закрыть follow-up по hardening/scale (`kissa` больше не на fallback), подключить новые данные/ассеты и реализовать `artifact photos` через `QuantizedPerimeter` с маской фото по периметру.
  Файлы: `src/data/case-details/kissa.ts`, `src/data/case-process/kissa.ts`, `src/data/case-details/index.ts`, `src/data/case-details/types.ts`, `src/components/KissaArtifactPhotosSection.astro`, `src/components/case-details/CaseDetailIntroSection.astro`, `src/components/case-details/CaseDetailSections.astro`, `src/styles/global.css`, `tests/smoke/case-details.spec.ts`, `public/media/cases/kissa/{intro,challenge,process,artifact-photos,feature-cards/flows,feature-cards/posters}/*`.
  Проверки: `npm run generate:posters` — успешно (сгенерированы постеры `Kissa-Payment|Pop-up|Portal`); `npm run verify:posters` — успешно (`6` валидных flow/poster пар); `npm run build` — успешно (роуты `/fora` и `/kissa` собраны); `npm run test:smoke` — успешно (`2/2`, включая новый `/kissa` detail + отсутствие fallback-блоков).

- 2026-03-17: Исправлена геометрия секции `kissa artifact photos` под Figma `50:4939` (вертикальные фото-блоки `280x480`).
  Причина: глобальное правило `:is(.quantized-scallop, .quantized-perimeter)` (`width:100%`, `max-width:100%`, `position:relative`, `margin-inline:auto`) перебивало локальный контракт `.kissa-artifact-photos-surface`, из-за чего блоки растягивались до `800x480` и смещались в потоке.
  Файлы: `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; runtime-проверка (`/kissa`, `1360px`) подтверждает контракт секции `816x528`, left-photo `280x480` @ `rel(0,0)`, right-photo `280x480` @ `rel(536,48)`, `position:absolute`, `margin-inline:0`, `max-width:280px`, без горизонтального скролла.

- 2026-03-17: Дополнительная регрессионная проверка после фикса `kissa artifact photos`.
  Причина: подтвердить отсутствие побочных эффектов на detail-роутах после локального CSS override.
  Файлы: `tasks/logs.md`.
  Проверки: `npm run test:smoke` — успешно (`2/2`: `/fora` key sections + active `cases`; `/kissa` detail + `artifact photos` + отсутствие fallback-блоков).

- 2026-03-17: `kissa challenge` переведён на tablet-мокап по Figma `50:2766` через data-driven `device`.
  Причина: `CaseChallengeSection` был захардкожен на `phone`, из-за чего `kissa` не мог рендерить `Shell-tablet` и расходился с макетом.
  Файлы: `src/data/case-details/types.ts`, `src/data/case-details/kissa.ts`, `src/data/case-details/fora.ts`, `src/components/case-details/CaseDetailSections.astro`, `src/components/CaseChallengeSection.astro`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`2/2`); runtime (`/kissa`, preview `1360px`) — `case-challenge-device--tablet`, `device-mockup--tablet`, геометрия `296x508`, `left=260`; регрессия `/fora` — `case-challenge-device--phone`, геометрия `244x501`, `left=286`.

- 2026-03-17: Добавлена параметризация `ticketVariant` для `case process tickets` и включён `circle-24` для `kissa`.
  Причина: нужно поддержать две вариации тикетов в process-секции (`square D=36` и `circle D=24`) с выбором на уровне данных кейса, без slug-хардкода в компоненте.
  Файлы: `src/data/case-process/types.ts`, `src/components/CaseProcessSection.astro`, `src/components/case-details/CaseDetailSections.astro`, `src/data/case-process/kissa.ts`, `tests/smoke/case-details.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) код — в `CaseProcessSection` добавлен `ticketVariant` -> `shape/step` mapping (`square-36 -> rectangle/36`, `circle-24 -> circle/24`) и root-атрибут `data-case-process-ticket-variant`; (2) сборка — `npm run build` успешно; проверка `dist` подтверждает `data-case-process-ticket-variant=\"square-36\"` на `/fora` и `\"circle-24\"` на `/kissa`, плюс `data-perimeter-step=\"36\"` vs `\"24\"`; (3) e2e — `npm run test:smoke -- tests/smoke/case-details.spec.ts` успешно (`2/2`) с assert на shape/step для обоих кейсов.

- 2026-03-17: Для `process tickets` установлен внутренний `padding: 20px` (вместо фактических `17px` от фикс-ширины текста).
  Причина: требовался явный равномерный inset `20px` для тикетов во всех кейсах (`/fora` и `/kissa`), при сохранении внешнего контракта `144x144`.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) код — `.case-process-section .case-process-ticket .scallop-content` переведён на `padding: 20px` + `box-sizing: border-box`, `.case-process-ticket__text` на `width: 100%`/`max-width: 100%` (убран фикс `110px`); (2) runtime — Playwright computed styles на `http://127.0.0.1:4321/fora` и `/kissa`: `paddingTop/Right/Bottom/Left = 20px`, размеры тикета `144x144`, ширина текста `104px`; (3) регрессия — `npm run build` и `npm run test:smoke -- tests/smoke/case-details.spec.ts` успешно (`2/2`).

- 2026-03-17: Актуализированы тексты `process tickets` по Figma (`40:1698` для `fora`, `50:2831` для `kissa`) с фиксацией ручных line-break.
  Причина: пользователь обновил контент и расставил абзацы в Figma, чтобы переносы были в конкретных местах.
  Файлы: `src/data/case-process/fora.ts`, `src/data/case-process/kissa.ts`, `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) код — в `fora` заменён `TICKET_TEXT` на 9 конкретных текстов из Figma, в `kissa` обновлены тексты с переносами (`lack of a\\n...`, `half\\n...`), для рендера добавлен `.case-process-ticket__text { white-space: pre-line; }`; (2) runtime — Playwright `allInnerTexts()` на `http://127.0.0.1:4321/fora` и `/kissa` подтверждает сохранение `\\n` в нужных тикетах; (3) регрессия — `npm run build` и `npm run test:smoke -- tests/smoke/case-details.spec.ts` успешно (`2/2`).

- 2026-03-17: Переведён рендер переносов в `process tickets` на гибридный режим (явные `<br>` по `\n` + авто-wrap внутри строк).
  Причина: `white-space: pre-line` давал неоднозначное поведение при ручной правке и неочевидный контроль `NBSP`; требовалось предсказуемо повторять `Shift+Enter` из Figma и при этом сохранять нормальный авто-перенос длинных строк.
  Файлы: `src/components/CaseProcessSection.astro`, `src/styles/global.css`, `src/data/case-process/fora.ts`, `src/data/case-process/kissa.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) код — `ticket.text` теперь разбивается по `\\n` и рендерится через явные `<br>`, у `.case-process-ticket__text` убран `white-space: pre-line`; (2) runtime (`http://127.0.0.1:4321`) — `/fora` первый тикет содержит `brCount=1`, `whiteSpace='normal'`; NBSP подтверждён в `/fora` тикете `"in\\u00A0app"` и `/kissa` тикете `"making\\u00A0item"` (`nbspCount=1`); (3) регрессия — `npm run build` и `npm run test:smoke -- tests/smoke/case-details.spec.ts` успешно (`2/2`).

- 2026-03-17: Точечно обновлён текст тикета `fora` по Figma ноде `40:1702`.
  Причина: в макете изменена позиция ручного переноса для тикета `orange/low` (`lack` + `of filtering options`).
  Файлы: `src/data/case-process/fora.ts`, `tasks/logs.md`.
  Проверки: (1) код — строка изменена с `lack of\\nfiltering options` на `lack\\nof filtering options`; (2) `npm run build` — успешно; (3) `npm run test:smoke -- tests/smoke/case-details.spec.ts` — успешно (`2/2`).

- 2026-03-17: Реализирована стабилизация загрузки `DeviceMockup` без shell-first flicker на detail-страницах кейсов.
  Причина: устранить «рваное» появление ассетов (shell появляется раньше screen) и сделать reveal контролируемым и предсказуемым.
  Файлы: `src/components/DeviceMockup.astro`, `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/components/CaseChallengeSection.astro`, `src/layouts/BaseLayout.astro`, `src/pages/[slug].astro`, `tests/smoke/case-details.spec.ts`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke` — успешно (`2/2`, включая новые проверки `data-device-priority="critical"` и readiness/polling на отсутствие shell-only состояния > `1300ms`); (3) проверка `dist/fora|kissa/index.html` — присутствуют `head` preloads для critical screen-изображений, у intro/challenge mockups выставлен `priority=critical`, у feature-cards сохранён `priority=lazy`.

- 2026-03-17: Реализована страница `/gallery` по Figma (`gallery card` + `rows`) с `QuantizedPerimeter`-контрактами по типам.
  Причина: заменить placeholder-сетку на production-реализацию `GalleryCard` (`phone/tablet/illustration/image`) и полную раскладку рядов `51:5306`, включая image-маску и локальные runtime-ассеты.
  Файлы: `src/data/gallery.ts`, `src/components/GalleryCard.astro`, `src/components/GalleryCardIllustration.astro`, `src/components/GalleryRowsSection.astro`, `src/pages/gallery.astro`, `src/styles/global.css`, `public/media/gallery/{device-shells,screens,illustrations,images}/*`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) проверка `dist/gallery/index.html` подтверждает `rowCount=6`, `span2=19`, `span4=2`, `image=2`, `tablet=1`, `illustration=5`; (3) `rg -n "figma.com/api/mcp/asset" src public dist` — совпадений нет (runtime полностью на локальных ассетах); (4) проверка контрактов `image` подтверждает `data-perimeter-edge-pattern="totem"` + `data-perimeter-step="24"` и CSS-маску через `--perimeter-content-mask`; (5) Playwright-визуальный smoke для `/gallery` не выполнен из-за локального launcher-конфликта Chrome (`Opening in existing browser session`).

- 2026-03-17: Стабилизирована геометрия video-screen в `DeviceMockup` при `scale != 1` и обновлён smoke-контур покрытия экрана.
  Причина: при уменьшенном mockup (особенно в `/gallery`) у webm экрана проявлялся субпиксельный seam по правому/нижнему краю; требовался системный фикс в reusable-компоненте без route-specific override.
  Файлы: `src/components/DeviceMockup.astro`, `tests/smoke/gallery.spec.ts`, `tests/smoke/case-details.spec.ts`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke` — успешно (`5/5`); (3) runtime-check (`/gallery`, `/fora`) подтверждает, что `videoRect` покрывает `screenRect` без оголения правого/нижнего края.

- 2026-03-17: Доработана композиция страницы `/gallery` под Figma `51:5014` — добавлены блок `to be more` (`57:5501`) и стандартная `final cta section` (`51:5028`) с финальным выравниванием секций по Y-контракту.
  Причина: пользователь запросил завершить gallery-страницу и довести порядок/отступы секций до целевого макета.
  Файлы: `src/components/GalleryToBeMoreSection.astro`, `src/pages/gallery.astro`, `src/styles/global.css`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`5/5`, включая `tests/smoke/gallery.spec.ts`).

- 2026-03-17: Обновлён `tasks/lessons.md` по итогам финализации `/gallery` (порядок секций и формула отступов для `to be more`/`final cta`).
  Причина: зафиксировать устойчивый layout-контракт из Figma `51:5014` для следующих итераций без повторной калибровки.
  Файлы: `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: консистентность с реализованным CSS (`to-be-more mt=64`, `final-cta mt=160`, `final-cta mb=138`) подтверждена ручной сверкой кода.

- 2026-03-17: Обновлён текст блока `to be more` по Figma `28:4684` с сохранением ручного переноса (`Shift+Enter`).
  Причина: пользователь обновил copy в макете; требовалось синхронизировать runtime-текст 1:1, включая перенос строки.
  Файлы: `src/components/GalleryToBeMoreSection.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: `npm run build` — успешно; `npm run test:smoke` — успешно (`5/5`).

- 2026-03-17: Для `gallery image` увеличен `totem`-step до `40` и маска периметра применена к `darkened`-фону наравне с image-слоем.
  Причина: требовалось сделать «диаметр» totem заметно крупнее (с `24` ближе к `48`) и убрать рассинхрон клипа между PNG-слоем и подложкой `bg-darkened`.
  Файлы: `src/components/GalleryCard.astro`, `src/styles/global.css`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`), включая новый assert на `data-perimeter-step="40"` у `image`-карточек и наличие маски у `.gallery-card__image-bg` + `.gallery-card__image-layer` при `data-ready="true"`.

- 2026-03-17: Для `gallery image` выполнен тестовый перевод `totem`-step с `40` на `50` (сохранение ширины `600` в `span-4`).
  Причина: пользователь попросил проверить вариант с точным попаданием в ширину 4 колонок (`600px`) при более крупном totem-паттерне.
  Файлы: `src/components/GalleryCard.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4174 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`), включая assert `data-perimeter-step="50"` у `image`-карточек и проверку маски у `.gallery-card__image-bg` + `.gallery-card__image-layer`.

- 2026-03-17: Для `gallery image` выполнен тестовый перевод `totem`-step с `50` на `60` (сохранение ширины `600` в `span-4`).
  Причина: пользователь запросил ещё более крупный вариант по «диаметру» при обязательном попадании ширины в 4 колонки.
  Файлы: `src/components/GalleryCard.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4175 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`) с assert `data-perimeter-step="60"` и сохранением маски у `image-layer` + `darkened bg`.

- 2026-03-17: Для `gallery image` откатили `totem`-step с `60` обратно на `40`.
  Причина: пользователь выбрал вернуть более умеренный вариант после серии A/B-тестов (`40 -> 50 -> 60`).
  Файлы: `src/components/GalleryCard.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4176 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`) с assert `data-perimeter-step=\"40\"` и проверкой маски у `image-layer` + `darkened bg`.

- 2026-03-17: Для `gallery image` выполнен финальный тестовый перевод `totem`-step с `40` на `50`.
  Причина: пользователь запросил «последний тест» на более крупный диаметр при сохранении попадания в ширину 4 колонок.
  Файлы: `src/components/GalleryCard.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4177 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`) с assert `data-perimeter-step=\"50\"` и проверкой маски у `image-layer` + `darkened bg`.

- 2026-03-17: Для `gallery image` повторно выполнен тестовый перевод `totem`-step с `50` на `60`.
  Причина: пользователь запросил ещё один прогон варианта с более крупным «диаметром» при фиксированной ширине `span-4`.
  Файлы: `src/components/GalleryCard.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4178 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`) с assert `data-perimeter-step=\"60\"` и проверкой маски у `image-layer` + `darkened bg`.

- 2026-03-17: Зафиксирован финальный вариант `gallery image` с `totem`-step `50`.
  Причина: по итогам последовательных прогонов (`40/50/60`) пользователь подтвердил финальный выбор `50`.
  Файлы: `src/components/GalleryCard.astro`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4179 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`) с assert `data-perimeter-step=\"50\"` и проверкой маски у `image-layer` + `darkened bg`.

- 2026-03-17: Для второй `gallery image` (`57:5450`) подключён подготовленный `cube log in` из `assets`.
  Причина: пользователь попросил использовать вручную подрезанный исходник из `assets/gallery/static/cube log in.png` и экспортировать его в runtime-путь проекта.
  Файлы: `assets/gallery/static/cube log in.png` (источник), `public/media/gallery/images/r5-c3-cube-log-in.png` (runtime-копия), `src/data/gallery.ts`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4180 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`), включая новый assert что карточка `57:5450` рендерит `/media/gallery/images/r5-c3-cube-log-in.png`.

- 2026-03-17: Собрана PNG-секвенция `coin wheel sec 840px` в отдельный `VP9 WebM` с alpha рядом с кадрами.
  Причина: пользователь запросил финальную сборку `0000..0240` (`840x840`) в новый файл без перезаписи текущих runtime-видео.
  Файлы: `coin wheel sec 840px/coin-loader-clear-840.webm`, `tasks/logs.md`.
  Проверки: (1) `ffprobe` нового файла — `codec_name=vp9`, `width/height=840x840`, `avg_frame_rate=30/1`, `duration=8.033s`, `size=3592899`; (2) `ffprobe -show_streams` — `TAG:alpha_mode=1` (alpha присутствует); (3) контроль существующих runtime-видео `public/media/cases/section/loader_light.webm` и `public/media/gallery/illustrations/loader-light.webm` — одинаковый SHA-256, изменений нет.

- 2026-03-17: Проведён аудит оптимизации ассетов и зафиксирован отдельный отчёт.
  Причина: пользователь запросил оценку текущего веса ассетов, классификацию «что уже ок / что сжимать» и проверку, где можно оптимизировать без визуальных потерь.
  Файлы: `tasks/asset-optimization-audit-2026-03-17.md`, `tasks/logs.md`.
  Проверки: (1) инвентаризация размеров и топов через `du`, `find + stat`; (2) техническая валидация разрешений/длительностей через `sips` и `ffprobe`; (3) контрольные прогоны сжатия: `cwebp -lossless` (PNG/JPG) и `ffmpeg libvpx-vp9` (WebM) для оценки реальной экономии. Код проекта не изменялся, `npm run build` не запускался (изменены только документы в `tasks/`).

- 2026-03-17: Карточка `/gallery` `51:5274` (`coin-wheel`) переведена с image на video в существующем типе `illustration`.
  Причина: пользователь попросил использовать новое видео `coin wheel` из `assets/gallery`, экспортировать его в runtime и включить autoplay.
  Файлы: `src/components/GalleryCardIllustration.astro`, `tests/smoke/gallery.spec.ts`, `public/media/gallery/illustrations/coin-wheel.webm`, `tasks/lessons.md`, `tasks/logs.md`.
  Проверки: (1) `npm run build` — успешно; (2) `PLAYWRIGHT_PORT=4181 npm run test:smoke -- tests/smoke/gallery.spec.ts` — успешно (`2/2`); (3) `ffprobe public/media/gallery/illustrations/coin-wheel.webm` — `vp9`, `840x840`, `30fps`, `TAG:alpha_mode=1`; (4) `rg`-проверка — runtime использует только `/media/gallery/illustrations/coin-wheel.webm`, без ссылок на `assets/`.

- 2026-03-17: Реализован lossless-пайплайн оптимизации runtime-ассетов без перекодирования WebM, с контролем `>=3x` и canonical-путями.
  Причина: пользователь запросил внедрить план оптимизации без визуального QA, отложить WebM-оптимизацию и зафиксировать безопасный автоматический контур проверок.
  Файлы: `package.json`, `.svgo.safe.config.mjs`, `scripts/{collect-render-sizes.mjs,optimize-raster-assets.mjs,rewrite-media-paths.mjs,validate-raster-3x.mjs}`, `src/components/{DeviceMockup.astro,CasesCardsSection.astro,ForaDesignSystemSection.astro,GalleryCardIllustration.astro,TeamPhotoQuantizedPerimeterSection.astro}`, `src/data/{gallery.ts,cases.ts,case-details/fora.ts,case-details/kissa.ts,case-process/fora.ts}`, `src/pages/index.astro`, `tests/smoke/gallery.spec.ts`, `public/media/**` (dedup + webp + safe-svg + posters/png recompress), `tasks/{lessons.md,logs.md,baselines/*,manifests/*}`.
  Что сделано: (1) создана ветка `codex/lossless-asset-optimization-2026-03-17`, baseline-tag `asset-baseline-2026-03-17-before-lossless-opt` и machine-readable snapshot (`sha256` + `sizes`); (2) удалены дубли `public/media/fora/feature-cards/*` в пользу `public/media/cases/fora/*`; (3) для gallery video-cards poster-пути переведены на `/media/gallery/posters/*` и удалены дублирующие `screens`-poster файлы; (4) runtime полностью отвязан от `assets/` (motive/process arrows/device shells теперь из `public/media`), добавлен runtime-набор `public/media/cases/fora/process/arrow-{1..5}.svg`; (5) выполнена массовая lossless-конверсия raster -> WebP (кроме `/posters/`, которые оставлены в PNG и recompress), плюс safe-SVGO для SVG; (6) добавлен автоматический контроль `3x` на основе реальных desktop render-size (`/`, `/cases`, `/gallery`, `/fora`, `/kissa`) и доведены 4 ассета до порога `3x`.
  Проверки: (1) `npm run generate:posters` — успешно; (2) `npm run verify:posters` — успешно (`13` video/poster пар, все валидны); (3) `npm run build` — успешно; (4) `npm run assets:collect-render-sizes` — успешно (manifest создан); (5) `npm run assets:validate-3x` — успешно (`57` raster-ассетов); (6) `npm run test:smoke` — успешно (`5/5`); (7) `rg -n "assets/" src scripts tests` — совпадений нет (runtime-ссылки на `assets` отсутствуют).

- 2026-03-17: Реализован временный адаптив для mobile/tablet на всех маршрутах с дуговым infinite-слайдером из первых 9 `phone` мокапов gallery.
  Причина: пользователь запросил временный мобильный/планшетный режим до desktop (`>=1360`) по Figma `71:2573` с надёжным нативным движком (auto + swipe, reduced-motion, pause offscreen/hidden).
  Файлы: `src/components/TemporaryAdaptiveNotice.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `tests/smoke/temporary-adaptive.spec.ts`, `tests/smoke/gallery.spec.ts`, `tests/smoke/case-details.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) добавлен глобальный `TemporaryAdaptiveNotice` и подключён в layout для всех страниц; (2) desktop-контент обёрнут в `site-desktop-shell`, переключение режимов через media-query (`<=1359` временный экран, `>=1360` основной сайт); (3) данные слайдера собираются программно из `GALLERY_ROWS -> phone -> slice(0, 9)` без дублирования ассетов; (4) реализован RAF-loop с бесшовным wrap (`9 + 9`), дуговой трансформацией карточек (`translateY/rotate/scale`), drag/swipe через pointer events, инерцией и автовоспроизведением; (5) добавлены паузы анимации при `prefers-reduced-motion`, `document.hidden`, `IntersectionObserver` и при выходе из mobile/tablet диапазона.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`10/10`).

- 2026-03-17: Обновлён `TemporaryAdaptiveNotice` по пользовательским правкам: fixed `scale=0.67`, без динамических `scale/opacity` в дуге, без нижнего клипа `screens`.
  Причина: пользователь уточнил визуальный контракт для временного mobile/tablet-экрана (референс: полный низ мокапов без обрезки и стабильная геометрия карточек).
  Файлы: `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) `DeviceMockup` в `screens` переведён на фиксированный `scale={0.67}` для `size='compact'`; (2) из дугового runtime удалены динамические `scale(...)` и `opacity` у item-карточек (оставлены `translateY + rotate + z-index`); (3) у `screens`/`viewport` снят вертикальный clip (`overflow: visible`) и скорректирована высота композиции; (4) smoke-тесты обновлены: проверка фиксированного размера mockup, `overflow-y: visible`, отсутствие `scale(` в inline-transform, `opacity: 1`, плюс регрессия autoplay/reduced-motion/drag.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts` — успешно (`6/6`); (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`).

- 2026-03-17: Улучшена дуга в `TemporaryAdaptiveNotice`: имитация заменена на физически корректную окружность (невидимый круг в математике) с мягким касательным наклоном.
  Причина: пользователь отметил, что текущее подъём/опускание мокапов слишком заметно; требовалась более естественная дуга без костылей.
  Файлы: `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в runtime вычисляются `arcMaxDx`, `arcSagitta`, `arcRadius` на resize; (2) `translateY` считается по формуле окружности `y = R - sqrt(R² - dx²)` с clamp по зоне влияния; (3) `rotate` считается как касательный угол `asin(dx/R)` с cap `±4.5deg`; (4) сохранены ограничения: без динамического `scale/opacity`, fixed `DeviceMockup scale=0.67`, `overflow-y: visible`; (5) smoke-тест расширен проверками геометрии дуги (центр выше боковых, симметрия лево/право, плавный рост `y` от центра).
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts` — успешно (`6/6`); (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`).

- 2026-03-17: Дуга `TemporaryAdaptiveNotice` сделана пропорционально масштабируемой для phone/tablet, чтобы убрать раннее плато на tablet.
  Причина: на tablet проявлялся «слом» кривизны (после узкой зоны дуги карточки визуально уходили в почти ровный экватор); требовалась одинаково читаемая дуга на разных ширинах viewport.
  Файлы: `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в `readMetrics` дуга переведена на нормализованные коэффициенты от `viewportWidth` (`arcMaxDx` и `arcSagitta` через `clamp`), с раздельными профилями для phone/tablet; (2) radius продолжает считаться по формуле окружности, а cap наклона адаптирован для tablet (`3.2deg`) и phone (`4.5deg`); (3) механика loop/drag/inertia/pause сохранена без изменений; (4) smoke-тест `tablet arc scales proportionally and avoids early plateau` обновлён на анализ рабочей зоны дуги (`focusBand`) и проверяет отсутствие раннего плато.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts` — успешно (`7/7`); (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`).

- 2026-03-17: Выполнена тонкая калибровка дуги `TemporaryAdaptiveNotice` под balanced-профиль (сильнее изгиб на tablet + мягкий вход в поворот на mobile).
  Причина: пользователь уточнил визуальный дефект: на tablet дуга оставалась слишком плоской, а на mobile в краях читался «стык круга» (резкий старт поворота).
  Файлы: `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) параметры дуги переведены на fixed breakpoint-профили (`phone/tablet`) с `kInfluence/kCurvature/rotateCap/softEdgeRatio`; (2) `readMetrics` обновлён по контракту `arcMaxDx/arcSagitta` (`2.2..5.2*slot`, `18..38`) с proportional scaling от viewport; (3) вместо жёсткого clamp по `dx` добавлен `soft-clamp` (smoothstep в предкраевой зоне дуги) для плавного входа в поворот и устранения визуальной границы на mobile; (4) сохранены ограничения: только `translateY + rotate + z-index`, `opacity=1`, fixed `scale=0.67`, loop/drag/inertia/pause без изменений; (5) в smoke усилен tablet-критерий кривизны и добавлен mobile-тест на отсутствие резкого скачка в edge-range по `translateY/rotate`.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts` — успешно (`8/8`); (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`).

- 2026-03-17: Для `TemporaryAdaptiveNotice` выполнен пробный переход `DeviceMockup` с `compact` на `default` при `scale=0.585`.
  Причина: пользователь заметил пиксельный top/bottom зазор в `screen` и попросил проверить конфигурацию `default + 0.585`.
  Файлы: `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) `DeviceMockup` в слайдах переключён на `size='default'`; (2) scale-константа обновлена `0.67 -> 0.585` и синхронизирована в CSS-переменной `--temporary-device-scale` и runtime `fixedDeviceScale`, чтобы сохранить консистентный шаг трека/wrap; (3) логика дуги, `soft-clamp`, autoplay/drag/inertia/pause, отсутствие dynamic `scale/opacity` и `overflow-y: visible` не менялись; (4) smoke обновлён под новый размер мокапа (~`143x293`) и дополнен проверкой, что media заполняет `screen` по высоте без внутреннего top/bottom gap.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts` — успешно (`8/8`); (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`).

- 2026-03-17: Локально устранён top/bottom seam в `TemporaryAdaptive` через image-overscan внутри `screen` (без изменений `DeviceMockup`).
  Причина: после перехода на `default + 0.585` оставался пиксельный зазор сверху/снизу экрана; требовался локальный фикс только для временного режима.
  Файлы: `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) добавлен локальный `:global`-override только для `.temporary-adaptive-notice__device .device-mockup__screen > .device-mockup__media`: `position:absolute`, `top/bottom:-1px`, `height:calc(100% + 2px)`, `object-fit:cover`; (2) video-bleed путь не изменялся; (3) математика дуги/infinite/drag/pause и остальные контракты без изменений; (4) в smoke ужесточены пороги заполнения `screen` до субпиксельного допуска (`<=0.2px` сверху/снизу).
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts` — успешно (`8/8`); (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`).

- 2026-03-18: Системно исправлен AA-seam для `DeviceMockup phone/default` и удалён локальный overscan-хак из `TemporaryAdaptive`.
  Причина: расследование показало, что seam вызван полупрозрачной AA-кромкой aperture у `phone-shell.webp`, а не дугой/scale; локальный route-fix маскировал симптом, но не источник.
  Файлы: `src/components/DeviceMockup.astro`, `src/components/TemporaryAdaptiveNotice.astro`, `tests/smoke/temporary-adaptive.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) `phone.sizes.default.screen` переведён на `frameFromAperture(...)` с AA-aware ratios (аналогично `compact`) при неизменных внешних размерах `244x501`; (2) добавлен marker `data-device-screen-calibration='aperture-default-v1-aa'` для `phone+default`; (3) удалён локальный `:global` image-overscan в `TemporaryAdaptiveNotice`; (4) smoke дополнен assert на новый calibration marker, при этом строгая проверка top/bottom gap (`<=0.2px`) сохранена.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/temporary-adaptive.spec.ts` — успешно (`8/8`); (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`).

- 2026-03-18: Полностью удалена временная страница `/preview` из runtime, навигации и связанных стилей.
  Причина: пользователь завершил этап разработки preview и попросил убрать этот маршрут из прод-сборки.
  Файлы: `src/pages/preview.astro` (удалён), `src/components/SiteHeader.astro`, `src/styles/global.css`, `docs/inview-appear-v1.md`, `docs/quantized-shapes-and-animation-presets.md`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) удалён route-файл `src/pages/preview.astro`; (2) из `SiteHeader` убрана кнопка `preview` и вся логика active-state для `/preview` (SSR + runtime `resolveActiveId`); (3) удалены мёртвые стили `.scallop-preview*` и `.wave-size-preview*`; (4) docs и lessons очищены от route-specific упоминаний `/preview`, формулировки приведены к универсальным.
  Проверки: (1) `npm run build` — успешно, в output собраны только `/`, `/cases`, `/gallery`, `/fora`, `/kissa`; (2) проверка артефактов — `dist/preview` отсутствует; (3) `npm run test:smoke` — успешно (`13/13`) после повторного прогона (первый запуск дал один флейк на `temporary-adaptive` с последующим зелёным re-run); (4) `rg -n "/preview" src docs` — совпадений нет.

- 2026-03-18: Реализован глобальный Porkbun DNS CLI для Codex App (кросс-репозитории) + skill-документация.
  Причина: пользователь запросил прямое управление DNS-настройками доменов из разных проектов, без привязки к одному репозиторию.
  Файлы: `~/.codex/bin/codex-porkbun-dns`, `~/.codex/tools/porkbun-dns/{package.json,src/*.mjs,test/*.test.mjs,examples/desired.example.json}`, `~/.codex/skills/porkbun-dns/SKILL.md`, `tasks/logs.md`.
  Что сделано: (1) создан глобальный wrapper `codex-porkbun-dns`; (2) реализованы команды `dns list|plan|apply` с безопасным режимом (`--apply` обязателен для записи, `--delete-missing` отдельно включает удаления); (3) добавлена валидация desired-state JSON (`domain`, `records[]`, типы, TTL>=600, нормализация `@/subdomain/FQDN`); (4) добавлены проверки владения доменом через `domain/listAll`, получение текущей зоны через `dns/retrieve`, и операции `dns/create|edit|delete`; (5) реализован diff-движок create/update/delete с подробным stdout-отчётом; (6) добавлены unit/integration mock-тесты для safety и API-контракта; (7) создан skill `porkbun-dns` с безопасным workflow `list -> plan -> apply`.
  Проверки: (1) `npm test` в `~/.codex/tools/porkbun-dns` — успешно (`9/9`); (2) `~/.codex/bin/codex-porkbun-dns --help` — успешно.

- 2026-03-18: Выполнен cutover домена `vladhorovyy.com` с Framer на GitHub Pages через GitHub API + Porkbun CLI.
  Причина: завтра (2026-03-19) истекает подписка Framer, требовалось полностью перенести прод-домен на GitHub Pages без ручных операций в панели DNS.
  Файлы: `tasks/dns-backups/vladhorovyy.com.before-cutover.20260318-120958.json`, `tasks/dns-plans/vladhorovyy.com.github-pages.desired.json`, `tasks/dns-plans/vladhorovyy.com.github-pages.plan.txt`, `tasks/dns-plans/vladhorovyy.com.github-pages.apply.log`, `tasks/dns-backups/vladhorovyy.com.after-cutover.20260318-121538.json`, `tasks/logs.md`.
  Что сделано: (1) снят preflight-бэкап текущей зоны и подготовлен desired-state под GitHub Pages; (2) обнаружен и устранён риск дублирующих записей из-за `prio` (в desired-state зафиксирован `prio: 0`); (3) запушен `main` (`0f1019a`), деплой `deploy.yml` завершился успешно (`run 23239583482`); (4) в GitHub Pages установлен `cname=vladhorovyy.com`; (5) через `codex-porkbun-dns` применены DNS-изменения (`created=6`, `updated=3`, `errors=0`) без `--delete-missing` (MX/NS/TXT сохранены); (6) проверен rollback-план из pre-cutover backup (`dns plan --delete-missing`) для отката одной командой.
  Проверки: (1) авторитативные NS Porkbun и локальный resolver отдают целевые записи GitHub (`A 185.199.108.153/109.153/110.153/111.153`, `AAAA 2606:50c0:8000::153/...:8003::153`, `www CNAME vlad22gor.github.io`); (2) `http://vladhorovyy.com` отдаёт GitHub Pages (`200`), `http://www.vladhorovyy.com` редиректит на apex; (3) smoke маршрутов по HTTP (follow redirects): `/`, `/cases`, `/gallery`, `/fora`, `/kissa` => `200`; (4) HTTPS сертификат GitHub пока не выпущен: `PUT pages https_enforced=true` возвращает `404 The certificate does not exist yet` (ожидание выпуска сертификата продолжается).

- 2026-03-18: Добавлены favicon-набор и global social cover из `assets` в runtime `public` + подключение в общий layout.
  Причина: пользователь запросил экспортировать `favicon` и `cover` из `assets` и подключить глобально для всех маршрутов.
  Файлы: `src/layouts/BaseLayout.astro`, `public/media/site/site-cover.png`, `public/favicon.ico`, `public/favicon-32x32.png`, `public/favicon-16x16.png`, `public/apple-touch-icon.png`, `tasks/logs.md`.
  Что сделано: (1) скопирован cover `assets/site cover.png -> public/media/site/site-cover.png`; (2) из `assets/favicon.png` сгенерированы runtime-иконки `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` и перезаписан `favicon.ico` (32x32); (3) в `BaseLayout` добавлены `<link rel="icon"...>`/`apple-touch-icon`; (4) добавлены глобальные `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image` с абсолютным URL через `new URL(..., Astro.site ?? 'https://vladhorovyy.com')`; (5) `public/favicon.svg` оставлен без изменений и не используется как основной источник в этой задаче.
  Проверки: (1) `npm run build` — успешно; (2) `file`-проверка runtime-файлов подтвердила форматы и размеры (`site-cover 3420x1796`, `favicon 32/16`, `apple-touch 180`, `favicon.ico` как Windows icon 32x32); (3) проверка `dist/{index,cases,gallery,fora,kissa}/index.html` — во всех head присутствуют favicon и `og:image`/`twitter:image`; (4) `rg -n "assets/" dist` — совпадений нет (runtime не ссылается на `assets`).

- 2026-03-18: Глобализованы `site title` и `site description` для всех текущих страниц (`/`, `/cases`, `/gallery`, `/fora`, `/kissa`).
  Причина: пользователь попросил задать единые SEO-метаданные на всех маршрутах “на сейчас”, чтобы убрать расхождения между страницами.
  Файлы: `src/layouts/BaseLayout.astro`, `src/pages/{index.astro,cases.astro,gallery.astro,[slug].astro}`, `tasks/logs.md`.
  Что сделано: (1) в `BaseLayout` удалены обязательные page-props `title/description`; (2) добавлены глобальные константы `siteTitle = "Vlad Horovyy – Product Designer"` и `siteDescription = "Product designer from Kyiv crafting standout mobile apps"`; (3) единые значения подключены в `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`; (4) все страницы переведены на вызов `BaseLayout` только с `canonicalPath` (без page-level title/description), включая динамический `[slug]`.
  Проверки: (1) `npm run build` — успешно; (2) `rg -n "title=|description=" src/pages` — совпадений нет; (3) проверка `dist/{index,cases,gallery,fora,kissa}/index.html` — `title/description/og:title/og:description` одинаковые на всех страницах, `canonical` остаётся page-specific.

- 2026-03-18: Точечно исправлен вес script-типографики (`Caveat`) для `type-description-*` и выставлен на `500`.
  Причина: при изменении token weight визуальная жирность не менялась, потому что inherited `font-variation-settings` фиксировал `wght=400`.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) `--type-description-large-weight` и `--type-description-medium-weight` изменены `600 -> 500`; (2) в `.type-description-large/.type-description-medium` добавлены `font-optical-sizing: none` и явные `font-variation-settings: "opsz" 14, "wght" var(...)`, чтобы ось variable-font не наследовалась из `body`.
  Проверки: (1) `rg` по `src/styles/global.css` подтвердил новые значения и правила; (2) runtime-проверка через Playwright на тексте `type-description-medium` показала `fontWeight: 500` и `fontVariationSettings: "opsz" 14, "wght" 500`.

- 2026-03-18: Обновлён глобальный social preview из нового исходника `assets/social preview.png` (2400x1260).
  Причина: пользователь обновил дизайн social preview (шрифт/композиция) и попросил заменить runtime-ассет в проекте.
  Файлы: `public/media/site/site-cover.png`, `src/layouts/BaseLayout.astro`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) runtime-`/media/site/site-cover.png` перезаписан из `assets/social preview.png`; (2) в `BaseLayout` обновлены `socialCoverWidth/Height` с `3420x1796` на `2400x1260`; (3) путь `og:image`/`twitter:image` оставлен прежним (`/media/site/site-cover.png`) для стабильности ссылок и кеша.
  Проверки: (1) `npm run build` — успешно; (2) `sips` подтвердил фактический размер runtime-файла `2400x1260`; (3) проверка `dist/{index,cases,gallery,fora,kissa}/index.html` — во всех head `og:image:width=2400`, `og:image:height=1260`, `twitter:image` указывает на `https://vladhorovyy.com/media/site/site-cover.png`.

- 2026-03-18: Исправлено падение GitHub Pages CI после глобализации метаданных (`title/description`) и устранено предупреждение Node 20 actions.
  Причина: деплой `Deploy Astro to GitHub Pages` на коммите `ab35015` падал в шаге `Run smoke tests` из-за устаревших `toHaveTitle`-ожиданий; дополнительно workflow предупреждал о deprecated `actions/*@v4`.
  Файлы: `tests/smoke/gallery.spec.ts`, `tests/smoke/case-details.spec.ts`, `.github/workflows/deploy.yml`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) обновлены smoke-ожидания title на единый глобальный `Vlad Horovyy – Product Designer` для `/gallery`, `/fora`, `/kissa`; (2) в workflow обновлены action-версии `actions/checkout@v4 -> @v6` и `actions/setup-node@v4 -> @v6`, чтобы снять Node 20 deprecation warning.
  Проверки: (1) `gh run view` для run `23242674142` подтвердил исходную причину падения (`toHaveTitle /Gallery - Vlad Horovyy/i` vs фактический глобальный title); (2) `npm run build` — успешно; (3) `npx playwright test tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`5/5`); (4) `npm run test:smoke` — успешно (`13/13`).

- 2026-03-18: Точечно скорректирован вес `Caveat` для `type-description-*` с `500` на `485`.
  Причина: пользователь уточнил целевую жирность script-стилей.
  Файлы: `src/styles/global.css`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: обновлены токены `--type-description-large-weight` и `--type-description-medium-weight` (`500 -> 485`), при сохранении явного `font-variation-settings` для `type-description-*`.
  Проверки: runtime-проверка через Playwright на `type-description-medium` показала `fontWeight: 485` и `fontVariationSettings: "opsz" 14, "wght" 485`.

- 2026-03-18: Обновлён investigation-документ по микровспышке на `/` после неуспешной итерации с `transition:animate="none"` для `main`.
  Причина: пользователь подтвердил, что визуальная вспышка остаётся, несмотря на отключение blended-fade в `page-content/gallery-content`.
  Файлы: `tasks/main-soft-nav-flash-investigation.md`, `tasks/logs.md`.
  Что сделано: в investigation добавлены: (1) факты по выполненному патчу (`main` scope -> `none`), (2) инструментальные результаты (build/smoke/headed-route checks), (3) итог «не помогло по UX», (4) обновлённые гипотезы и следующий план (проверка header/footer scope, headed frame-by-frame, Chrome/Safari).
  Проверки: в этой итерации изменялась только документация; код/тесты не запускались.

- 2026-03-18: Реализован фикс микровспышки при soft-nav на `/` через политику «fade только в контенте».
  Причина: расследование подтвердило, что артефакт связан с compositing-path View Transitions (`plus-lighter`) на `root` и дефолтным `astroFade` у shared scope (`site-header/site-footer`).
  Файлы: `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/styles/global.css`, `tests/smoke/gallery.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) для `site-header` и `site-footer` включён `transition:animate='none'` при сохранении `transition:name` + `transition:persist`; (2) в `global.css` добавлена View Transition policy: отключена root-анимация (`::view-transition-*(root)`), добавлены кастомные `@keyframes contentFadeIn/contentFadeOut` без additive blend, переопределены `page-content/gallery-content` на эти keyframes с `mix-blend-mode: normal`; (3) добавлены fallback-override правила для `main#content[data-astro-transition-scope]` под `data-astro-transition-fallback='old|new'`; (4) добавлен smoke-тест `/cases -> /`, который проверяет отсутствие root `plus-lighter`, отсутствие `astroFade*` у `site-header/site-footer` и наличие `contentFade*` у `page-content`.
  Проверки: (1) `npm run build` — успешно; (2) первый `npm run test:smoke` дал 1 флейк в несвязанном тесте `temporary-adaptive` (`notClippedBottom`); (3) точечный re-run флейка `npx playwright test tests/smoke/temporary-adaptive.spec.ts --grep "1024x1366 keeps temporary screen with explicit phone small size"` — успешно (`1/1`); (4) повторный полный `npm run test:smoke` — успешно (`14/14`), новый transition-smoke зелёный.

- 2026-03-18: Обновлён investigation-документ по микровспышке после внедрения policy «fade только в контенте».
  Причина: зафиксировать завершённую итерацию расследования (изменённый transition-path, подтверждённые проверки, статус закрытия).
  Файлы: `tasks/main-soft-nav-flash-investigation.md`, `tasks/logs.md`.
  Что сделано: добавлен новый блок итерации с описанием внесённых изменений (`root/header/footer/content`), результатами build/smoke и текущим статусом (технический фикс + необходимость headed UX-check).
  Проверки: отдельные проверки не запускались (документационный апдейт после уже выполненных `npm run build` и `npm run test:smoke`).

- 2026-03-18: Реализован unified critical-media preload/warmup для `/gallery` и case-detail, плюс ускорен reveal video-mockups при повторном входе.
  Причина: на каждом повторном заходе в `/gallery` device-видео карточки снова проходили фазу `data-ready=false`, что давало видимый pop-in даже при наличии браузерного кэша.
  Файлы: `src/data/critical-media.ts`, `src/components/CriticalMediaWarmupRuntime.astro`, `src/layouts/BaseLayout.astro`, `src/pages/gallery.astro`, `src/pages/[slug].astro`, `src/components/DeviceMockup.astro`, `tests/smoke/gallery.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) добавлен единый манифест `critical media` по route-id (`home/cases/gallery/fora/kissa`) с источниками из `GALLERY_ROWS` (critical rows 1-2) и case-detail critical mockups (`introScreens + challenge`) включая shell/poster/video; (2) `/gallery` и `[slug]` переведены на route-level `<link rel="preload">` из общего манифеста (`as=image/video`, `fetchpriority=high` для image/shell/poster); (3) добавлен глобальный singleton runtime-прогрев `CriticalMediaWarmupRuntime`: сначала warmup current-route critical, затем idle-warmup других route, с дедупликацией, лимитом параллелизма и guard для `Save-Data`/`2g`; (4) `DeviceMockup` обновлён: для `priority='critical'` + `video` используется `preload='auto'`, добавлен in-memory warm-cache (`src` + composite key `device|size|src|poster`), readiness для видео смягчён до `HAVE_METADATA`/warm-cache (вместо ожидания только `loadeddata`), при сохранении fallback-таймера и защиты от shell-only гонок.
  Проверки: (1) `npm run build` — успешно; (2) `npm run test:smoke -- tests/smoke/gallery.spec.ts tests/smoke/case-details.spec.ts` — успешно (`7/7`); (3) полный `npm run test:smoke` — успешно (`15/15`); (4) новый smoke-кейс проверяет preload-контракт `/gallery` и отсутствие повторной неготовности critical mockups при сценарии `gallery -> home -> gallery` (ранний интервал 200ms).

- 2026-03-18: Внедрён staged `appear v1` для ключевых секций case-details (`/fora`, `/kissa`) и добавлен side-вариант для стрелок в artifact photos.
  Причина: пользователь запросил последовательный reveal дочерних элементов по индексам в intro/intro-screens/challenge/process/feature-card/artifact-photos и отдельный паттерн для стрелок с направлением движения.
  Файлы: `src/components/InViewMotionRuntime.astro`, `src/components/QuantizedPerimeter.astro`, `src/components/case-details/CaseDetailIntroSection.astro`, `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/components/CaseChallengeSection.astro`, `src/components/CaseProcessSection.astro`, `src/components/FeatureCard.astro`, `src/components/KissaArtifactPhotosSection.astro`, `src/data/case-details/types.ts`, `src/data/case-details/fora.ts`, `src/data/case-details/kissa.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) добавлен новый preset `appear-stagger-v1` (stagger-children, selector `[data-motion-stage-item]`, delay-step `0.08`) в global inView runtime; (2) в `appear-stagger-v1` добавлена поддержка `data-motion-stage-side='left|right'` для стрелок (`offsetX +/-25`, `scale 0.9->1`, без `translateY`); (3) в `QuantizedPerimeter` добавлен passthrough stage-атрибутов (`data-motion-stage-item`, `data-motion-stagger-index`, `data-motion-stage-side`) для использования на корневом DOM-ноду компонента; (4) для intro/intro-screens/challenge/process/artifact секций и feature cards расставлены stage-индексы по согласованному порядку; (5) challenge-note + arrow сгруппированы в единый stage-unit (`.case-challenge-note-group`), индексация note-групп определяется по направлению стрелки (`top-right -> top-left -> bottom-right -> bottom-left`); (6) в конфигах `/fora` и `/kissa` целевые секции переведены на `inViewPreset: 'appear-stagger-v1'`; (7) обновлён `tasks/lessons.md` под новый контракт staged reveal.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/case-details.spec.ts` — успешно (`3/3`); (3) `npm run test:smoke` — нестабильно в текущем окружении: флейки/таймауты в несвязанных тестах (`temporary-adaptive` и `gallery`), при этом точечный re-run `npx playwright test tests/smoke/temporary-adaptive.spec.ts:56` — успешно (`1/1`).

- 2026-03-18: Расширена документация по inView-пресетам до полного реестра актуальных preset-ов и сценариев применения.
  Причина: пользователь попросил дать полное и однозначное понимание, какие пресеты сейчас есть в проекте, когда их использовать и как подключать.
  Файлы: `docs/inview-presets-reference.md`, `docs/inview-appear-v1.md`, `tasks/logs.md`.
  Что сделано: (1) добавлен новый документ-реестр `docs/inview-presets-reference.md` как source-of-truth guide по всем активным preset-ам из `InViewMotionRuntime` (каталог, quick-choice, usage snippets, ограничения и текущая карта применения); (2) в существующий `docs/inview-appear-v1.md` добавлена ссылка на новый полный реестр.
  Проверки: (1) верифицирован список preset-ов по `src/components/InViewMotionRuntime.astro`; (2) верифицированы точки использования по `rg` в `src/components`/`src/pages`; (3) это документационный апдейт, сборка/тесты не запускались.

- 2026-03-18: Реализован плавный pre-fade переход в `case switcher` перед soft-nav, чтобы убрать визуальный scroll-jump.
  Причина: при переключении между `/fora` и `/kissa` через блок `case switcher` переход выглядел как быстрый скролл в top перед стартом intro-анимации новой страницы.
  Файлы: `src/components/CaseSwitcherSection.astro`, `src/styles/global.css`, `tests/smoke/case-details.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) в `CaseSwitcherSection` добавлен идемпотентный runtime, который перехватывает клики по `.case-switcher-button`, включает `html[data-case-switcher-transition="leaving"]`, ждёт `180ms` и затем вызывает `navigate(...)`; (2) добавлен guard от повторного старта перехода + cleanup состояния на `astro:page-load`/`pagehide` и fallback cleanup по таймауту; (3) для надёжного контроля перехода кнопкам свитчера выставляется `data-astro-reload`, чтобы обходить ранний auto-intercept роутера и запускать навигацию только через runtime; (4) в `global.css` добавлен leave-state fade для `main#content` и блокировка pointer-events на кнопках свитчера во время ухода; (5) добавлен smoke-тест, который проверяет pre-fade окно (URL ещё старый, leave-flag активен, scroll не схлопнулся в `0`) и финальный reset scroll/top на новом кейсе.
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/case-details.spec.ts tests/smoke/gallery.spec.ts` — успешно (`8/8`).

- 2026-03-18: Синхронизирован `case-switcher` переход с окончанием fade и задержан старт `intro` stagger до завершения route transition.
  Причина: после fade при переключении кейсов пользователь всё ещё видел резкий top-reset и «догоняющую» intro-анимацию, воспринимаемую как доскролл.
  Файлы: `src/components/CaseSwitcherSection.astro`, `src/components/case-details/CaseDetailIntroSection.astro`, `src/components/InViewMotionRuntime.astro`, `src/styles/global.css`, `tests/smoke/case-details.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) в `CaseSwitcherSection` запуск `navigate()` переведён с фиксированного таймера на `transitionend/transitioncancel` по `opacity` текущего `main#content`, с fallback timeout; (2) leave-state перенесён с глобального `html`-атрибута на локальный `main#content[data-case-switcher-leaving=\"true\"]`, чтобы состояние не протекало в новый route; (3) перед навигацией добавлен one-shot marker в `sessionStorage` (`__case-switcher-intro-sync`); (4) в `CaseDetailIntroSection` добавлен флаг `data-motion-await-route-transition=\"case-switcher-intro\"`; (5) в `InViewMotionRuntime` для stagger-режима добавлен gate: при активном marker старт intro откладывается до снятия `html[data-astro-transition]`, после чего marker очищается; (6) smoke-тест обновлён: проверяет pre-nav fade-состояние, отсутствие старта intro во время transition-window (если окно наблюдалось), корректный post-transition старт/завершение intro и очистку marker.
  Проверки: `npx playwright test tests/smoke/case-details.spec.ts tests/smoke/gallery.spec.ts` — успешно (`8/8`).

- 2026-03-18: Убран «вылет» `kissa intro screens` при переходе через `case switcher` за счёт route-transition gate для `appear-v1` (element mode).
  Причина: `intro screens` на `/kissa` анимировался в transition-window, пока `intro` уже был синхронизирован; визуально это выглядело как резкий «доскролл»/вылет блока сверху после fade.
  Файлы: `src/components/IntroScreensQuantizedPerimeterSection.astro`, `src/components/InViewMotionRuntime.astro`, `tests/smoke/case-details.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) на root `IntroScreensQuantizedPerimeterSection` добавлен `data-motion-await-route-transition='case-switcher-intro'`; (2) в `InViewMotionRuntime` расширен gate на `mountElementPreset`: при свежем marker `__case-switcher-intro-sync` старт `appear-v1` откладывается до завершения route transition, затем повторно выставляется initial-state и запускается анимация; (3) ожидание transition усилено: добавлено короткое окно ожидания старта и проверка стабильного снятия `html[data-astro-transition]`, чтобы избежать race/flicker; (4) для reduced-motion в element-ветке добавлена очистка marker; (5) smoke `/fora -> /kissa` расширен проверками для `.kissa-intro-screens` (не анимируется в transition-window, затем стартует и доходит до финального состояния).
  Проверки: (1) `npm run build` — успешно; (2) `npx playwright test tests/smoke/case-details.spec.ts --grep "case switcher next waits for fade-end"` — успешно (`1/1`); (3) `npx playwright test tests/smoke/case-details.spec.ts tests/smoke/gallery.spec.ts` — успешно (`8/8`).

- 2026-03-18: Переведены монохромные UI-SVG-глифы на theme token через `mask`-рендер (quotes/arrows/hearts) + добавлен guard против регрессий.
  Причина: часть SVG-иконок (стрелки/кавычки/сердечки) оставалась с зашитым зелёным fill и не реагировала на смену темы.
  Файлы: `src/components/ThemedSvgIcon.astro`, `src/components/QuotesSection.astro`, `src/components/CasesCardsSection.astro`, `src/components/CaseCard.astro`, `src/components/CaseChallengeSection.astro`, `src/components/CaseProcessSection.astro`, `src/components/ForaDesignSystemSection.astro`, `src/components/KissaArtifactPhotosSection.astro`, `src/components/TeamPhotoQuantizedPerimeterSection.astro`, `src/styles/global.css`, `scripts/verify-themed-svg-icons.mjs`, `package.json`, `tests/smoke/theme-tokens.spec.ts`, `tasks/logs.md`.
  Что сделано: (1) добавлен универсальный компонент `ThemedSvgIcon` (`span` + `mask-image` + `background-color` через CSS переменные); (2) в теме добавлен токен `--color-icon-accent` (в light/dark маппится на `--color-accent-green`); (3) целевые `<img>` в секциях quotes/cases/challenge/process/design-system/artifact/team-photo заменены на `ThemedSvgIcon` без изменения layout/motion-контрактов; (4) добавлен статический guard `verify-themed-svg-icons` и подключён в `prebuild`; (5) расширен smoke-тест `theme-tokens` проверками token-color и motion-атрибутов для репрезентативных глифов на `/`, `/fora`, `/kissa`.
  Проверки: (1) `npm run verify:svg-icons` — успешно (`verify-themed-svg-icons: OK`); (2) `npm run build` — успешно; (3) `npx playwright test tests/smoke/theme-tokens.spec.ts tests/smoke/case-details.spec.ts` — успешно (`7/7`).

- 2026-03-18: Добавлена theme-aware подмена растровых ассетов для `home` и `gallery` через единый runtime на `data-theme`.
  Причина: пользователь запросил переключение конкретных изображений в тёмной теме без дублирования `<img>` (один элемент, смена `src` по теме).
  Файлы: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/data/gallery.ts`, `src/components/GalleryCard.astro`, `tests/smoke/theme-tokens.spec.ts`, `tests/smoke/gallery.spec.ts`, `public/media/home/mockup-clouds.webp`, `public/media/home/mockup-evening.webp`, `public/media/gallery/images/r5-c3-cube-log-in-dark.webp`, `tasks/logs.md`.
  Что сделано: (1) экспортированы новые runtime-ассеты из `assets` в `public/media` (WebP lossless); (2) в `BaseLayout` добавлен идемпотентный global-runtime `__themedRasterRuntime`, который синхронизирует `img[data-theme-src-light|data-theme-src-dark]` на init, `astro:page-load` и при изменении `html[data-theme]`; (3) на `/` для `mockup-red` и `mockup-path` добавлены `data-theme-src-light/dark` с маппингом `red->clouds`, `path->evening`; (4) в `gallery` расширен контракт `GalleryImageCard` полем `darkImageSrc`, для карточки `57:5450` подключён `/media/gallery/images/r5-c3-cube-log-in-dark.webp`, а в рендере `GalleryCard` добавлены themed-атрибуты для image-layer; (5) обновлены smoke-тесты: новый сценарий двустороннего переключения home-мокапов и проверка dark-подмены `r5-c3` в gallery.
  Проверки: `npx playwright test tests/smoke/theme-tokens.spec.ts tests/smoke/gallery.spec.ts` — успешно (`9 passed`).
- 2026-03-19: Синхронизированы component/theme токены с Figma и исправлена темизация `footer motifs` + `about arch`.
  Причина: нужно добавить `button/text-outlined`, обновить коллекции `83:19088/83:19089`, исправить отсутствие theme-реакции у мотивов футера и убрать hardcoded цвет дуги в `about`.
  Файлы: `src/styles/global.css`, `src/components/Button.astro`, `src/components/SiteFooter.astro`, `src/components/AboutMeQScallopSection.astro`, `tests/smoke/theme-tokens.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) в light/dark токены добавлен `--color-button-text-outlined` (`#000000`/`#efe2d2`) и выполнен sync dark `ticket/bg/orange/*` на синий диапазон из Figma (`#79b0e2 -> #2b527f`); (2) `Button` обновлён по Figma `12:1029`: для `bordered`/`bordered-icon` в default используется `--color-button-text-outlined`, в hover — `--color-button-text`; (3) `SiteFooter` переведён с `<img>` на `ThemedSvgIcon` c токеном `--color-accent-white`, поэтому цвет мотивов меняется по теме; (4) `about arch` переведён на `stroke='currentColor'` + `color: var(--color-accent-orange)`; (5) smoke-тест расширен проверками `buttonTextOutlined`, footer motifs, arch stroke и обновлёнными ожиданиями dark-коллекции.
  Проверки: `npm run build` — успешно; `npm run verify:svg-icons` — успешно; `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`6/6`).
- 2026-03-19: Исправлена невидимая стрелка у `button bordered-icon` в dark/default.
  Причина: `bordered-icon` в default брал `--color-button-arrow` (`#173a66`), который совпадает с dark `--color-bg-default`, из-за чего иконка сливалась с фоном и визуально пропадала.
  Файлы: `src/components/Button.astro`, `tests/smoke/theme-tokens.spec.ts`, `tasks/lessons.md`, `tasks/logs.md`.
  Что сделано: (1) для `.ui-button--bordered-icon` в default `--button-icon-color` переключён на `--color-button-bg`; (2) для hover оставлен `--color-button-arrow`; (3) smoke-тест обновлён: в dark/default для bordered-icon ожидается iconColor от `--color-button-bg`, в hover — от `--color-button-arrow`, добавлена стабилизация hover-проверки через `scrollIntoViewIfNeeded + mouse.move + expect.poll`.
  Проверки: `npm run build` — успешно; `npx playwright test tests/smoke/theme-tokens.spec.ts --grep "button and divider tokens are applied to variants and waves"` — успешно (`1/1`); `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`6/6`).
- 2026-03-19: Обновлён dark-токен `bg/darkened` на `#214675` по Figma `83:19141`.
  Причина: пользователь уточнил актуальное значение коллекции для dark theme.
  Файлы: `src/styles/global.css`, `tasks/logs.md`, `tasks/lessons.md`.
  Что сделано: в `html[data-theme='dark']` изменён `--color-bg-darkened` с `#224b7d` на `#214675`.
  Проверки: `npm run build` — успешно.
- 2026-03-19: Актуализирован dark-токен `bg/darkened` на `#234978` (обновление после правки значения пользователем).
  Причина: пользователь изменил целевое значение после предыдущей синхронизации.
  Файлы: `src/styles/global.css`, `tasks/logs.md`, `tasks/lessons.md`.
  Что сделано: в `html[data-theme='dark']` обновлён `--color-bg-darkened` `#214675 -> #234978`; в `tasks/lessons.md` обновлён устойчивый reference для Figma `83:19141`.
  Проверки: `npm run build` — успешно.
- 2026-03-19: Выполнен полный sync color-токенов с Figma коллекциями `83:19088` (light) и `83:19089` (dark).
  Причина: пользователь запросил обновить токены по актуальным коллекциям в Figma.
  Файлы: `src/styles/global.css`, `tests/smoke/theme-tokens.spec.ts`, `tasks/logs.md`, `tasks/lessons.md`.
  Что сделано: (1) dark `text/secondary` и `text/tertiary` синхронизированы на `#faf6f2a6` и `#faf6f28c`; (2) dark `bg/darkened`, `button-floating/bg`, `footer/bg` синхронизированы на `#234978`; (3) dark `ticket/bg/orange/*` и `ticket/bg/blue/*` синхронизированы на `#6a9ecf/#5c8dbd/#4d7baa/#3e6998/#305885`; (4) обновлены smoke-ожидания для dark `ticketOrangeCritical`, `buttonFloatingBg`, `footerBg` и computed footer color.
  Проверки: `npm run build` — успешно; `npx playwright test tests/smoke/theme-tokens.spec.ts` — успешно (`7/7`).
