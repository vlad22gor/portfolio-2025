# Lessons

- Держать заметки краткими, без дублей и противоречий.
- Для сложных scallop-форм использовать quantized SVG-компонент вместо mask-пересечений.
- Для Figma handoff scallop: `pad` брать из padding контейнера, `shape` выводить из corner radius (`9999` -> `circle`, иначе `rectangle`).
- Для wave-divider использовать SVG stroke из чередующихся полуокружностей (`d=8`, `stroke=2`), длину квантизировать только количеством кружков без mask.
- Для текущего этапа вёрстки: desktop-only, один рабочий breakpoint `1360`; mobile breakpoint `360` добавляется отдельной задачей.
- Для desktop-навигации при route-transition резервировать scrollbar gutter на root (`scrollbar-gutter: stable both-edges`, fallback `overflow-y: scroll`), чтобы избежать горизонтального layout shift fixed-header и контента.
- `assets/` использовать только как временный буфер экспорта из Figma; прод-ассеты хранить и подключать из `public/media/...`.
- Для `header-button`: фиксированная высота `40`, top-align контента, `label container` с `padding-inline: 8px` и hug-width; у `selected` hover-анимация `gap` от `3` до `8` через motion spring; wave для header считать по кружкам с округлением вверх (не уже лейбла) и уменьшением на `-1` кружок после `ceil`, центрировать относительно label-контейнера и не допускать её влияния на ширину кнопки/клиппинга; в overlay-режиме измеряемый контейнер wave должен иметь явную ширину (`width: 100%`) + runtime fallback ширины, а SVG `wave-frame` должен быть `overflow: visible` для исключения клиппинга концов stroke.
- Если контейнер в Figma отмечен как `QScallop`, применять `QuantizedScallop` (runtime SVG), а квантацию вести по inside-fit: форма не должна расти за границы дизайн-контейнера (ближайший шаг вниз).
- Исключение для footer: у `QScallop` использовать квантацию только по верхней грани (`rectangleEdges="top"`), нижняя и боковые грани остаются прямыми; допускается асимметричный inside-fit padding `84/72` (top/bottom), а фоновую заливку для боковых зазоров делать через `.site-footer::before` (top offset = scallop radius); motifs остаются декоративными (`aria-hidden`) и анимируются только по `pointer-hover` с profile-based spring (`slow`: `1.35/0.25`, `fast`: `1.05/0.25`).
