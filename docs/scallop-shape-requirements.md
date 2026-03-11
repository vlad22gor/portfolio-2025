# Quantized Scallop Requirements

## Цель
- Убрать артефакты в углах и обрезку кругов по периметру.
- Квантовать размеры контейнера под целый шаг круга.
- Держать поддержку `PNG`-free и пригодность для ручной подгонки в Figma.

## Логика квантования
- Шаг круга: `D` (`data-scallop-step`).
- Ширина: `cols = floor(parentWidth / D)`, затем `width = cols * D`.
- Высота: после расчёта ширины измеряем контент; `rows = ceil(contentHeight / D)`, затем `height = rows * D`.
- Политика округления: ширина всегда вниз, высота всегда вверх.
- Если `minCols` не помещается в родитель, контейнер не должен выходить за границы.

## Рендер контура
- Контур рисуется через `SVG` поверх контейнера.
- Рисуем:
  - прямоугольник фона,
  - верх/низ: круги `i = 0..cols-1`,
  - лево/право: круги `j = 1..rows-2` (углы исключаем для устранения двойной отрисовки).
- Цвет управляется через `--scallop-bg`.

## Runtime и API
- Инициализация через `data-quantized-scallop`.
- Публичные параметры:
  - `data-scallop-step`,
  - `data-scallop-min-cols`,
  - `data-scallop-min-rows`,
  - `--scallop-bg`,
  - `--scallop-pad`.
- Перерасчёт по `ResizeObserver`, `window.resize`, `document.fonts.ready`, с батчингом через `requestAnimationFrame`.

## Fallback
- Без JS контейнер остаётся читаемым (`background + border-radius`), без ломки layout.
- Текущий `mask`-подход (`.scallop-surface`) сохраняется как legacy для остальных блоков до следующего rollout.
