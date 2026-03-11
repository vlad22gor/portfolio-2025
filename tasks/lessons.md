# Lessons

- Держать заметки краткими, без дублей и противоречий.
- Для сложных scallop-форм использовать quantized SVG-компонент вместо mask-пересечений.
- Для Figma handoff scallop: `pad` брать из padding контейнера, `shape` выводить из corner radius (`9999` -> `circle`, иначе `rectangle`).
- Для wave-divider использовать SVG stroke из чередующихся полуокружностей (`d=8`, `stroke=2`), длину квантизировать только количеством кружков без mask.
