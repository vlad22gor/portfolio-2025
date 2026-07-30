# Motion Lab MVP — handoff для второго агента

Статус: **DialKit Copy зафиксированы в source defaults; готово к запуску изолированного MVP**.

## Зафиксированный источник

- Portfolio repository: `/Users/vladyslavhorovyy/Documents/Career/portfolio 2025 vibecode`
- Snapshot branch: `codex/goomy-motion-snapshot`
- Snapshot commit: `562f923`
- PRD: `tasks/react-motion-authoring-prd.md`
- Текущий production-код и GoomY assets считаются read-only reference.

## DialKit freeze

Canonical origin для текущей сессии:

`http://localhost:4321`

Если настройки когда-либо менялись через `http://127.0.0.1:4321`, Copy нужно снять и там: localStorage разделён по origin. Нельзя извлекать или редактировать browser storage напрямую — источником freeze служит только DialKit Copy из UI.

Это две анимации, у каждой по два persistent store: visual-настройки и timeline.

| Scene store | Persistent ID | Copy status | Canonical source |
|---|---|---:|---|
| Onboarding visual | `goomy-onboarding-presentation` | approved | `src/components/goomy/GoomYOnboardingMotion.tsx` |
| Onboarding timeline | `goomy-onboarding-loop-v2` | approved | `src/components/goomy/GoomYOnboardingMotion.tsx` |
| Paywall visual | `goomy-paywall-activation-visual-v9` | approved | `src/components/goomy/GoomYPaywallActivationFlow.tsx` |
| Paywall timeline | `goomy-paywall-activation-flow-v5` | approved | `src/components/goomy/GoomYPaywallActivationFlow.tsx` |

Freeze выполнен так:

1. Copy каждого visual/timeline store сопоставлен с его persistent ID.
2. Approved values перенесены в `useDialKit` / `TIMELINE_CONFIG` source defaults.
3. Scrubbable `clip.current` authoring bindings и DialKit UI сохранены.
4. Над обоими `useDialTimeline` добавлен production handoff note.
5. Runtime confetti progress остаётся отвязанным от stale persisted `confetti.current`; Copy зафиксирован как authoring timeline default без отката visibility-fix.

## Разрешённый scope второго агента

Агент работает **только в новом отдельном каталоге/repository Motion Lab**, физически вне portfolio repository.

Нужно реализовать только MVP:

1. Vite + React + TypeScript application.
2. DialKit integration и persistence contract.
3. Scene registry и переключатель сцен.
4. Authoring mode с preview и настройками.
5. Capture mode без authoring UI.
6. Exact-frame capture bridge с явным frame-ready handshake.
7. Одну автономную тестовую сцену без GoomY assets.
8. Минимальный deterministic capture/render smoke test.
9. README с командами запуска, проверки и экспорта.

## Жёсткие запреты

Второму агенту запрещено:

- изменять, удалять, перемещать или форматировать файлы portfolio repository;
- менять production pages, components, styles, assets, media или build/deploy configuration;
- переносить или копировать GoomY implementation/assets в Motion Lab на этапе MVP;
- менять четыре persistent IDs либо их approved Copy;
- публиковать media обратно в portfolio;
- создавать production integration, migration automation или глобальный skill;
- выполнять destructive Git/filesystem operations;
- коммитить что-либо в `codex/goomy-motion-snapshot`.

Portfolio repository разрешено использовать только read-only для PRD и архитектурного контекста.

## Stop-condition

Работа агента заканчивается, когда одновременно выполнено:

- отдельный Motion Lab запускается локально;
- test scene доступна в authoring и capture modes;
- DialKit-настройки тестовой сцены сохраняются;
- заданный frame можно установить детерминированно и получить frame-ready;
- build/typecheck проходят;
- smoke capture тестовой сцены проходит;
- README описывает воспроизводимый локальный workflow.

После этого агент **останавливается и отдаёт отчёт**. GoomY migration, production publish и global skill остаются за рамками этого запуска.

## Обязательный отчёт агента

- абсолютный путь нового repository;
- список созданных файлов;
- команды и результаты build/typecheck/tests;
- известные ограничения MVP;
- подтверждение, что portfolio repository не изменён;
- `git status --short` обоих repositories.
