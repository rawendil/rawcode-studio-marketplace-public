---
name: create-workflow-skills
description: This skill should be used when the user asks to "create workflow skills", "stwórz skille workflow", "wygeneruj next-task i add-task", "skonfiguruj workflow zadań", "create-workflow-skills", or wants project-tailored /next-task and /add-task skills. Interviews the user about their task tracker, statuses, definition of done and git policy, then generates two self-contained skills into .claude/skills/.
---

# Generator skilli workflow projektu

Skill przeprowadza wywiad o środowisku pracy **tego** projektu i generuje dwa
dopasowane, samowystarczalne skille: `.claude/skills/next-task/SKILL.md`
(prowadzenie zadania od wyboru do zamknięcia) i `.claude/skills/add-task/SKILL.md`
(tworzenie kompletnego zadania w trackerze).

Cykl życia pluginu jest **jednorazowy**: uruchomić raz na nowym projekcie,
zweryfikować wynik, wyłączyć plugin (faza 5). Wygenerowane skille zostają w repo
projektu i działają niezależnie od pluginu.

Prompt użytkownika: **$ARGUMENTS** (opcjonalny — może zawierać wskazówki, np.
nazwę trackera albo listy).

Przebieg: sześć faz po kolei, bez przeskakiwania. **Fazy 2 i 5 są STOP-bramkami**
— nie ruszać dalej bez jawnej odpowiedzi użytkownika. Utworzyć TODO na każdą fazę.

## Faza 0 — sondowanie (bez pytań)

Ustalić fakty samodzielnie, **zanim** o cokolwiek zapytać. Czytać tylko to, co w
projekcie faktycznie istnieje:

| Co czytać | Po co |
|---|---|
| `CLAUDE.md`, `AGENTS.md` | konwencje projektu, **język dokumentacji** (= język wygenerowanych skilli), wzmianki o TDD i obowiązkowych testach |
| `.claude/skills/` | czy `next-task`/`add-task` już istnieją → kolizja do obsłużenia w fazie 2 |
| manifesty (`package.json`, `composer.json`, `Makefile`, …) | realne skrypty testów, lintu, typecheck, builda → brama jakości (oś 12) |
| `docs/` | katalogi specek i planów (`docs/superpowers/specs/` + `plans/` albo `docs/specs/` + `docs/plans/`); czy jest dokumentacja-źródło-prawdy (osie 3, 16) |
| lista skilli dostępnych w sesji | czy są `superpowers:*` — rekomendacja metodyki pracy; wygenerowany skill nie może wołać skilli, których użytkownik nie ma (oś 17) |
| `.github/workflows/` | czy push na główną gałąź uruchamia deploy (osie 10, 13, 14) |
| `git remote -v`, `git branch --show-current` | obecność remote i nazwa głównej gałęzi (osie 14–15) |
| `command -v cup gh jira` | dostępne CLI trackerów (osie 1–2) |
| lista narzędzi MCP w sesji | dostępne serwery MCP, w tym **customowe serwery projektu** (osie 2–3) |
| `git check-ignore -v <ścieżki docelowe>` | czy `.claude/skills/` nie jest ignorowany — jeśli jest, wygenerowane skille nigdy nie trafią do repo; **powiedzieć to przed zapisem, nie po** |
| `.claude/skills/` **oraz** `~/.claude/skills/` | skille projektowe i **użytkownikowe** — rozróżnić je, bo skill użytkownikowy nie jest „skillem projektu" i nie wolno o nim tak pisać |
| domeny w `resources/`, `config/`, `README.md`, `.env.example`, `.github/workflows/` | adres produkcyjny — **wymagane, gdy oś 13 = dowód na żywo** (patrz niżej) |

**Stałe wewnątrz STOP-bramek odpytywać, nie wnioskować.** Gdy oś 13 wymaga
dowodu „na żywo", adres produkcyjny staje się centralną wartością bramki
blokującej zamknięcie zadania. Wyszukać kandydatów w plikach wyżej, **pokazać
znalezione w tabeli fazy 0**, a przy zerowym albo niejednoznacznym wyniku —
dopytać. Nie wyprowadzać go z nazwy listy w trackerze ani z nazwy repo: bramka
oparta na domyśle jest **gorsza niż brak bramki**, bo wygląda na zweryfikowaną.
Ta zasada dotyczy każdej stałej, która ląduje w treści STOP-bramki.

### Inwentarz komend — weryfikować to, co się emituje

**Cheatsheet trackera jest hipotezą do potwierdzenia, nie źródłem do
przepisania.** Gdy jego proza i realne wyjście CLI się rozjeżdżają, wygrywa
CLI — a rozjazd trafia do tabeli „co ustaliłem sam".

Dla **każdej** komendy, która ma znaleźć się w wygenerowanym skillu:

- **komendy odczytowe** — wywołać **dokładnie w tej postaci**, w jakiej trafią
  do wyniku, i sprawdzić, czy zwracają to, co skill o nich twierdzi. Wywołanie
  wariantu obok nie liczy się jako weryfikacja: jeśli do kroku wpisujesz
  wywołanie **bez** jakiejś flagi, to właśnie ono musi zostać wywołane, nie
  wersja z flagą;
- **komendy zapisujące** — **nigdy nie uruchamiać** dla rozpoznania stanu.
  Przeczytać `--help` i skonfrontować z **każdym** zdaniem cheatsheetu, które
  ich dotyczy. Komenda zapisująca nie jest narzędziem diagnostycznym, nawet
  jeśli cheatsheet tak ją opisuje;
- gdy istnieje odczytowy odpowiednik komendy zapisującej, **do wyniku trafia
  odczytowy** — i tylko on.

To nie jest formalność: dokładnie w tym miejscu powstały dwa realne defekty
wygenerowanych skilli — pula zadań niosąca statusy zamykające i komenda
zapisująca zarekomendowana jako „bezpieczny odczyt".

Fazę zamknąć **tabelą „co ustaliłem sam"** pokazaną użytkownikowi, w kolumnach
`Sygnał | Skąd (plik/komenda) | Wniosek | Oś`. W tabeli **wymienić każdą
komendę** z inwentarza wraz z tym, co jej wywołanie (albo `--help`) faktycznie
pokazało. Żadnego wniosku **nie ukrywać** i
żadnego nie traktować za ustalony: **każdy** trafia do wywiadu jako opcja
**rekomendowana**, którą użytkownik może odrzucić. Reguły przejścia sygnał →
rekomendacja: tabela „Reguły wnioskowania domyślnych" w `references/interview.md`.

## Faza 1 — wywiad: 17 osi w 5 grupach

Pełna siatka pytań, opcji i ich konsekwencji dla wygenerowanego skilla:
**`references/interview.md`**. Przeczytać ją **przed** pierwszym pytaniem — nie
odtwarzać treści opcji z pamięci.

- **Pięć wywołań `AskUserQuestion`**, jedno na grupę, w kolejności: grupa 1 =
  osie 1–3, grupa 2 = osie 4–6, grupa 3 = osie 7–10, grupa 4 = osie 11–13,
  grupa 5 = osie 14–17.
- **Maksymalnie 4 pytania na wywołanie** (limit narzędzia) — stąd podział
  3-3-4-3-4.
- W każdym pytaniu **opcja rekomendowana z fazy 0 idzie pierwsza**. Gdy faza 0
  nie dała sygnału — pytanie pada bez podświetlonej rekomendacji (kilka osi ma
  to zapisane wprost).
- Rekomendacja może się opierać **wyłącznie** na fazie 0 i na osiach z grup
  **wcześniejszych**: odpowiedzi z tej samej grupy w momencie pytania jeszcze nie
  istnieją.

**Identyfikatory nie są pytaniem.** `list_id`, `owner/repo`, klucz projektu,
realne nazwy statusów, priorytetów i tagów **odpytać komendą** przez kanał
ustalony w osi 2 i **pokazać użytkownikowi, co odpowiedział tracker** — nie
wpisywać ich na pamięć z wywiadu. Komendy i pułapki:
`references/tracker-clickup.md` (ClickUp, CLI `cup`) oraz
`references/tracker-github.md` (GitHub Issues, CLI `gh`). Dla pozostałych
trackerów dopytać o komendy i zapisać **tylko potwierdzone**.

## Faza 2 — STOP: szkic do akceptacji

Przedstawić, **nie zapisując jeszcze niczego na dysk**:

1. **Tabelę decyzji ze wszystkich 17 osi** — `Oś | Decyzja | Skutek dla
   wygenerowanego skilla`. Wszystkie siedemnaście, także te przeklikane
   rekomendacją.
2. **Nagłówki kroków** obu skilli — numerowany spis samych nazw kroków, z
   oznaczeniem STOP-bramek i kroków wymaganych. **Nie pełny tekst kroków**:
   szkic ma się dać przeczytać w kilkanaście sekund, a pełną treść użytkownik
   ocenia po fazie 3.
3. **Docelowe ścieżki**: `.claude/skills/next-task/SKILL.md` i
   `.claude/skills/add-task/SKILL.md`.
4. **Informację o kolizji**, gdy faza 0 wykryła któryś z tych plików.
5. **Zależności wygenerowanych skilli** — CLI/MCP trackera oraz skille, które
   kroki wołają z nazwy (plugin `superpowers` przy metodyce A, własne skille
   przy metodyce C). Skill wołający coś, czego nie ma, nie powinien powstać
   bez wiedzy użytkownika.

**Nie generować bez jawnej akceptacji.** Poprawki przyjąć, szkic pokazać
**ponownie** i czekać na akceptację poprawionej wersji. Milczenie nie jest zgodą.

**Kolizja plików — nigdy cicho.** Gdy `.claude/skills/next-task/SKILL.md` (albo
`add-task`) już istnieje: pokazać, co tam jest (`name` i `description` z
frontmattera + lista nagłówków sekcji) i zapytać `AskUserQuestion`, osobno dla
każdego kolidującego pliku:

- **nadpisz** — istniejąca treść przepada bezpowrotnie,
- **zapisz obok** jako `SKILL.md.new` — scalenie zostaje po stronie użytkownika,
- **przerwij** — nie zapisywać nic i zakończyć skill.

## Faza 3 — generowanie

### Najpierw: powtórzyć sondowanie środowiska

Ustalenia fazy 0 są snapshotem sprzed wywiadu — a wywiad trwa. Gdy oś 15
ustaliła pracę w kilku sesjach na jednym repo, snapshot sprzed kilkudziesięciu
minut nie jest podstawą do nadpisywania plików. **Tuż przed zapisem powtórzyć:**

- `ls .claude/skills/` — czy `next-task`/`add-task` nie powstały w międzyczasie
  (kolizja) i czy nie pojawiły się **skille domenowe**, o których wynik powinien
  wiedzieć;
- `git check-ignore -v` na obu ścieżkach docelowych;
- odczyt `CLAUDE.md` — czy nie zmienił się w trakcie sesji.

**Każdą różnicę wobec fazy 0 pokazać i zapytać**, zanim cokolwiek zapisać.
Realny przypadek: cztery skille domenowe powstały 43 minuty po generacji, więc
faza 0 orzekła „brak kolizji" na stanie, który przestał być aktualny — a
wygenerowany skill nie wiedział o skillach, które `CLAUDE.md` projektu każe
aktywować.

Gdy `git check-ignore` pokaże, że katalog docelowy jest ignorowany, **powiedzieć
to wprost przed zapisem**: wygenerowane skille nie trafią do repo ani na inne
maszyny, a skill każący commitować i pushować sam nigdy nie zostanie
zacommitowany. To decyzja użytkownika, nie szczegół do przemilczenia.

### Potem: składanie

Złożyć oba pliki z szablonów **`references/template-next-task.md`** i
**`references/template-add-task.md`**, wg anatomii, ośmiu zasad pisania i
wymagań walidatora z **`references/pattern-anatomy.md`**. Do tego cheatsheet
wybranego trackera — **`references/tracker-clickup.md`** albo
**`references/tracker-github.md`** — bo oba szablony każą **wpisać wprost** w
wynik dwie–trzy pułapki istotne dla tego trackera i kanału (sekcja „Kontekst
trackera" i tabela „Częste błędy"); wygenerowany skill nie odsyła do
`references/` pluginu, bo po fazie 5 plugin jest wyłączony.

Twarde reguły składania:

- Bloki `{{#JEŚLI oś N = wartość}}`, których warunek nie zachodzi, **usunąć
  razem z całą treścią** — bez adnotacji „nie dotyczy", bez pustego nagłówka.
- Po usunięciu bloków **przenumerować kroki od 1**, zaktualizować każde
  odwołanie „patrz krok N" i **dopiero na końcu** wypisać numery STOP-bramek i
  kroków wymaganych w nagłówku sekcji „Workflow".
- **Żaden znacznik szablonu nie może zostać** w pliku wyjściowym; każdy
  `{{NAZWA}}` podstawić wartością potwierdzoną w fazie 0 albo 1. Szablony Go
  w komendach `gh` (`{{.title}}`, `{{range .}}`) to treść, nie znacznik.
- Nagłówki sekcji muszą trafiać w synonimy walidatora — nie przeformułowywać
  ich na „naturalniej brzmiące".
- Akapity oznaczone `[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku]`
  **wykonać i usunąć w całości**, razem ze znacznikiem — to scaffolding dla
  modelu składającego, nie treść wygenerowanego skilla. Walidator z fazy 4
  zgłasza pozostawioną notkę jako błąd (marker `NOTKA`/`SKŁADAJĄCEGO`).

**Język wygenerowanych skilli = język dokumentacji projektu** ustalony w fazie 0
(polski, gdy `CLAUDE.md` i `docs/` są po polsku). Frontmatter `description`
zostaje po angielsku, jak w projektach referencyjnych.

## Faza 4 — walidacja

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/validate-generated.js" \
  <ścieżka zapisanego next-task> <ścieżka zapisanego add-task>
```

**Walidować pliki, które faktycznie zostały zapisane w fazie 3**, nie domyślne
ścieżki: przy decyzji „zapisz obok" z fazy 2 to
`.claude/skills/next-task/SKILL.md.new` (albo `add-task/…`), a stary
`SKILL.md` zostaje nietknięty i nie jest przedmiotem walidacji. Plik pominięty
decyzją „przerwij" nie trafia do komendy. Walidator rozpoznaje typ skilla po
nazwie katalogu, więc sufiks `.new` mu nie przeszkadza.

- **Kod wyjścia niezerowy = naprawa wygenerowanego pliku i ponowne
  uruchomienie**, nie przejście dalej i nie tłumaczenie błędu użytkownikowi w
  miejsce poprawki.
- **Zielony walidator jest warunkiem wejścia w fazę 5**, nie formalnością na
  koniec. Bez `Walidacja zielona.` i kodu wyjścia `0` faza 5 się nie zaczyna.
- **Ostrzeżenia (`!`)** — zaraportować użytkownikowi (np. CLI trackera nieobecne
  w PATH, plik dłuższy niż 500 linii), ale **nie blokują** przejścia dalej.

Pokazać rzeczywisty output komendy: evidence, nie deklaracja „walidacja przeszła".

## Faza 5 — STOP: domknięcie

Kolejno, w tej kolejności:

1. **Raport utworzonych plików** — pełne ścieżki, liczba kroków workflow w
   każdym skillu oraz które sekcje warunkowe weszły, a które nie i dlaczego.
2. **Instrukcja testu** — wywołać `/next-task` i `/add-task` w **nowej sesji**.
   Skille projektowe są wczytywane na starcie sesji, więc w bieżącej sesji
   jeszcze ich nie ma.
3. **Pytanie o wyłączenie pluginu** (`AskUserQuestion`) — plugin jest
   jednorazowy i po weryfikacji nie musi zajmować kontekstu.

Po **jawnej zgodzie** poprosić użytkownika o wpisanie komendy:

```
/plugin disable create-workflow-skills
```

**Nie edytować `settings.json` samodzielnie** — klucz w `enabledPlugins` zależy
od nazwy marketplace'u, z którego plugin zainstalowano, i od zakresu instalacji
(użytkownik / projekt), więc ręczna edycja łatwo trafia w zły wpis. Komenda
`/plugin` rozwiązuje to sama. Powiedzieć wprost, że:

- zmiana jest **odwracalna** — `/plugin enable create-workflow-skills`,
- **nie usuwa pluginu z dysku** ani wpisu marketplace,
- **wygenerowane skille działają dalej** — żyją w `.claude/skills/` projektu i
  nie zależą od stanu pluginu.

## Zasady

1. **Pytania po polsku** — chyba że użytkownik pisze po angielsku; wtedy cały
   wywiad po angielsku.
2. **`${CLAUDE_PLUGIN_ROOT}`** zamiast ścieżek bezwzględnych w każdym odwołaniu
   do skryptów i plików pluginu.
3. **Nie tworzyć pustych katalogów** — `.claude/skills/next-task/` powstaje
   razem z plikiem, nie przed nim; po „przerwij" z fazy 2 nie zostaje nic.
4. **Nie zgadywać identyfikatorów, statusów ani komend** — wszystko potwierdzone
   odpytaniem trackera albo cheatsheetem.
5. **Progressive disclosure** — szczegóły w `references/`; czytać dany plik w
   fazie, która go potrzebuje, nie wszystkie na starcie.
6. **STOP znaczy stop** — fazy 2 i 5 czekają na odpowiedź użytkownika.

## Dodatkowe zasoby

- **`references/pattern-anatomy.md`** — anatomia obu skilli (8 sekcji
  `next-task`, 7 sekcji `add-task`), osiem zasad pisania i sekcja „Zgodność z
  walidatorem"; czytać w fazie 3.
- **`references/interview.md`** — pełna siatka 17 osi w 5 grupach, opcje z
  konsekwencjami i reguły wnioskowania rekomendacji; czytać w fazach 0 i 1.
- **`references/template-next-task.md`** — szablon docelowego
  `next-task/SKILL.md` z blokami warunkowymi i regułami składania.
- **`references/template-add-task.md`** — szablon docelowego
  `add-task/SKILL.md` z blokami warunkowymi i regułami składania.
- **`references/tracker-clickup.md`** — cheatsheet CLI `cup`: odpytanie
  identyfikatorów i statusów, komendy workflow, pułapki (`--all`, kształty JSON).
- **`references/tracker-github.md`** — cheatsheet CLI `gh`: issues, etykiety w
  roli statusów i priorytetów, Projects v2, pułapki.
