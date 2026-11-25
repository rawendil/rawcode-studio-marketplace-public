# Kontrakt skryptu przeglądu zadań

Ten plik czyta model w **fazie 3** `/create-planned-tasks`, gdy w wywiadzie
pobieranie danych to **skrypt w projekcie**. Skryptu nie ma w szablonie —
model pisze go **od zera** dla systemu zadań tego projektu, wg kontraktu
niżej i katalogu pułapek (`pitfalls.md`).

## Położenie i język

- Plik leży obok skilla: `.claude/skills/planned-tasks/<nazwa>.<rozszerzenie>`
  (np. `tasks.js`, `zadania.py`). Nazwa w języku dokumentacji projektu.
- `SKILL.md` wywołuje go w bloku `bash` **pełną ścieżką względną od katalogu
  projektu**, np. `node .claude/skills/planned-tasks/tasks.js` — walidator
  szuka skryptu po tej ścieżce.
- Język: ten, którego projekt już używa (manifesty z fazy 0); przy kilku —
  ten, w którym napisane są inne skrypty projektu. Projekt bez kodu dostaje
  skrypt tylko na wyraźne życzenie użytkownika (rekomendacja osi 9 to wtedy
  komendy) — język z PATH, `python3` przed `node`. Walidator sprawdza składnię
  `.js/.cjs/.mjs`, `.py`, `.php`, `.sh/.bash`; inny język dostaje tylko
  ostrzeżenie.
- **Node: system modułów z `package.json` projektu.** Skrypt leży w drzewie
  projektu, więc `"type": "module"` w najbliższym `package.json` sprawia, że
  `.js` z `require` pada przy uruchomieniu (`require is not defined in ES
  module scope`) — a `node --check` walidatora tego **nie** łapie. Rozszerzenie
  jednoznaczne: `.cjs` (CommonJS, `require`) albo `.mjs` (ESM, `import`).
- **Wyłącznie biblioteka standardowa języka.** Bez instalacji pakietów, bez
  `jq`. Dozwolone wywołanie CLI trackera, który projekt już ma (`gh`, `cup`).

## Tylko odczyt

- Żadnych metod zapisujących ani komend zapisujących trackera.
- Wyjątek: API, w którym **odczyt** idzie metodą POST (GraphQL GitHuba,
  wyszukiwanie Jiry `POST /search`). Wtedy komentarz w skrypcie nad
  wywołaniem: „POST — odczyt (zapytanie GraphQL), nic nie zapisuje". Walidator
  zgłasza każde POST jako ostrzeżenie; model potwierdza je w fazie 4.

## Uwierzytelnienie

- Z miejsca ustalonego w wywiadzie: konfiguracja istniejącego CLI (np.
  `~/.config/cup/config.json`, `gh auth token`), zmienna środowiskowa
  (nazwa w `SKILL.md`), plik `.env` projektu (tylko gdy jest w `.gitignore`).
- **Nigdy literał tokenu w kodzie ani w `SKILL.md`** — walidator to blokuje.
- Brak uwierzytelnienia → komunikat po polsku (albo w języku projektu) z
  podpowiedzią, co uruchomić (`gh auth login`, `cup auth`, „ustaw zmienną
  X"), kod wyjścia ≠ 0.

## Konfiguracja

Jeden blok stałych na górze pliku, z komentarzem — użytkownik zmienia
przegląd bez generatora:

- zakres (id listy/folderu/repo/projektu, ścieżka pliku),
- sekcje wydzielone (id miejsc albo etykiety + nagłówki sekcji),
- grupowanie i kolejność,
- strefa czasowa (jawna; domyślnie systemowa),
- statusy otwarte — **po typie/stanie**, gdy system go ma (P2).

## Wyjście

- **Domyślnie Markdown** gotowy do wklejenia w odpowiedź:
  1. linia stanu: `_Stan na <data> · zakres: <nazwy miejsc>_`,
  2. sekcja główna z licznikiem (`## Zaplanowane zadania — N otwartych`),
     podsekcje wg grupowania (`### <grupa> — N`), tabele z kolumnami z wywiadu,
  3. sekcje wydzielone w tej samej postaci,
  4. pusta grupa się nie pojawia; pusta sekcja — jedno zdanie („Brak
     otwartych zadań.").
- Identyfikator jako link do zadania, gdy system daje URL.
- **`--json`** — surowe dane (zakres + zadania po odsiewie) do własnych
  zestawień.
- Komunikaty błędów na stderr, wynik na stdout.

## Nagłówek pliku

Komentarz na początku: co skrypt robi (jedno zdanie), skąd czyta, że jest
tylko do odczytu, jak go uruchomić (z `--json`). Bez wzmianek o generatorze.

## Gotowość

Skrypt jest gotowy, gdy w fazie 4:

1. przechodzi walidator (składnia, brak tokenów),
2. uruchomiony na żywym trackerze kończy się kodem 0,
3. liczba otwartych zadań zgadza się z niezależnym odczytem (kontrola
   krzyżowa).
