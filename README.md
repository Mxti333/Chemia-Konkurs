# Konkurs chemiczny: Kalkulator śladu węglowego

Statyczna strona internetowa przygotowana na konkurs z okazji Dnia Ziemi.

## Zawartość

- `index.html` - semantyczna struktura strony
- `style.css` - styl, animacje i efekty wizualne (bez gradientów)
- `script.js` - kalkulator śladu węglowego + animacja 3D planety

## Uruchomienie lokalne

1. Otwórz plik `index.html` w przeglądarce.
2. Aby uniknąć ograniczeń modułów JS, możesz użyć prostego serwera lokalnego.

Przykład (PowerShell, jeśli masz Python):

```powershell
python -m http.server 8000
```

Następnie otwórz: `http://localhost:8000`

## Publikacja na GitHub Pages

1. Wypchnij pliki do repozytorium na GitHub.
2. Wejdź w `Settings` -> `Pages`.
3. W sekcji `Build and deployment` wybierz:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (root)
4. Zapisz ustawienia i poczekaj na publikację.
