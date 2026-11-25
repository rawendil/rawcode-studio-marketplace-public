# Szablon `planned-tasks`

Ten plik czyta model w **fazie 3** `/create-planned-tasks`, razem z
`pattern-anatomy.md` i `interview.md` (numeracja 10 osi). Niżej jest szablon
docelowego `SKILL.md`.

## Konwencja markerów

- **`{{NAZWA}}`** — podstawienie wartością z wywiadu albo z odpytania
  trackera. Nigdy nie zostaje w wyniku.
- **`{{#JEŚLI oś N = wartość}} … {{/JEŚLI}}`** — blok warunkowy; gdy warunek
  nie zachodzi, usunąć **razem z treścią**, bez „nie dotyczy".
- **`{{#JEŚLI bez kontroli krzyżowej}} … {{/JEŚLI}}`** — fakt z fazy 4, nie
  oś: użytkownik świadomie odstąpił od kontroli krzyżowej.
- **`[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku]`** — wykonać i usunąć
  w całości.

Po usunięciu bloków przenumerować kroki od 1. Ogrodzenie szablonu jest
czterobacktickowe, bo szablon zawiera bloki `bash`.

## Szablon

````markdown
---
name: planned-tasks
description: Use when the user invokes /planned-tasks or asks what {{NAZWA_PROJEKTU}} tasks are planned or open ({{FRAZY_WYZWALAJACE}}) — shows open tasks from {{ZAKRES_EN}} {{OPIS_UKLADU_EN}}. Read-only{{DOPISEK_NEXT_TASK_EN}}.
---

# {{TYTUL_SKILLA}}

## Przegląd

Przegląd otwartych zadań z {{ZAKRES_OPIS}}. Tylko odczyt — nic nie
zmieniasz w trackerze.
{{#JEŚLI oś 4 = osobno}}
{{SEKCJE_WYDZIELONE_OPIS}} idą osobną sekcją pod przeglądem głównym.
{{/JEŚLI}}

## Kontekst trackera

- **System:** {{SYSTEM}} — {{KANAL}}.
- **Zakres:** {{ZAKRES_Z_IDENTYFIKATORAMI}}.
- **Dostęp:** {{SKAD_UWIERZYTELNIENIE}}.
- **Zamknięte (odsiewane):** {{STATUSY_ZAMKNIETE_Z_TYPAMI}}.
{{#JEŚLI oś 9 = skrypt}}

Skrypt `{{SCIEZKA_SKRYPTU}}`:

{{PUNKTY_DZIALANIA_SKRYPTU}}

`--json` wypisuje surowe dane (do własnych zestawień). Zakres, sekcje i
grupowanie zmienisz w bloku stałych na początku skryptu.
{{/JEŚLI}}
{{#JEŚLI bez kontroli krzyżowej}}

**Uwaga:** przy tworzeniu skilla liczby przeglądu nie były porównane z
niezależnym odczytem ({{POWOD_BRAKU_KONTROLI}}). Przy podejrzanie małym
wyniku sprawdź w {{SYSTEM}} ręcznie.
{{/JEŚLI}}

## Workflow

### Krok 1 — pobierz zestawienie

{{#JEŚLI oś 9 = skrypt}}
```bash
{{WYWOLANIE_SKRYPTU}}
```
{{/JEŚLI}}
{{#JEŚLI oś 9 = komendy}}
```bash
{{KOMENDY_ODCZYTU}}
```

{{REGULY_ODCZYTU}}
{{/JEŚLI}}
{{#JEŚLI oś 9 = mcp}}
{{KROKI_MCP}}

{{REGULY_ODCZYTU}}
{{/JEŚLI}}

[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku] W formach „komendy" i „mcp"
`{{REGULY_ODCZYTU}}` to lista reguł wykonującego modelu dla pułapek z fazy 3
(stronicowanie do końca, odsiew po typie statusu, podzadania sieroty, strefa
czasowa, escapowanie `|`) — konkretnie dla tego systemu, z nazwami pól i
parametrów. W formie „skrypt" te reguły są w kodzie i do `SKILL.md` nie
trafiają.

### Krok 2 — przedstaw wynik

Wklej tabele {{SKAD_TABELE}} tak, jak są. Kolejność: najpierw
**{{NAGLOWEK_GLOWNY}}**{{#JEŚLI oś 4 = osobno}}, potem osobno
{{NAGLOWKI_WYDZIELONE}}{{/JEŚLI}}.
{{#JEŚLI oś 10 = komentarz}}
Pod spodem najwyżej 2–3 zdania od siebie, tylko gdy coś wyróżnia się w
danych: {{CO_WYROZNIAC}}. Bez streszczania każdej pozycji.
{{/JEŚLI}}

Gdy użytkownik zawęzi pytanie ({{PRZYKLADY_ZAWEZEN}}) — pokaż tylko ten
wycinek z wyniku, bez ponownego pobierania.

## Częste błędy

| Błąd | Zamiast tego |
|------|--------------|
| Brak sieci albo błąd API, a lista podana z pamięci | Powiedz wprost, że odczyt się nie udał; nie zgaduj zadań |
| Szukanie tokenu poza ustalonym miejscem | {{PODPOWIEDZ_LOGOWANIA}} |
{{WIERSZE_PULAPEK_SYSTEMU}}
````

[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku] `{{WIERSZE_PULAPEK_SYSTEMU}}`
to 2–3 wiersze tabeli z pułapek P1–P10 najgroźniejszych dla tego systemu i
tej formy (np. dla formy „komendy" na GitHubie: limit 30 bez `--limit`), bez
identyfikatora pułapki.

## Podstawienia

| Marker | Skąd |
|---|---|
| `{{NAZWA_PROJEKTU}}`, `{{TYTUL_SKILLA}}` | `CLAUDE.md`/README; tytuł w języku projektu (np. „Zaplanowane zadania") |
| `{{FRAZY_WYZWALAJACE}}` | 4–6 fraz w języku projektu, w cudzysłowach |
| `{{ZAKRES_EN}}`, `{{ZAKRES_OPIS}}`, `{{ZAKRES_Z_IDENTYFIKATORAMI}}` | oś 3 + odpytanie |
| `{{OPIS_UKLADU_EN}}` | oś 5–7, np. „by priority, with due dates and subtasks" |
| `{{DOPISEK_NEXT_TASK_EN}}` | „; picking and starting a task is next-task" — gdy projekt ma `next-task`, inaczej pusto |
| `{{SYSTEM}}`, `{{KANAL}}`, `{{SKAD_UWIERZYTELNIENIE}}` | osie 1, 2, 9 |
| `{{STATUSY_ZAMKNIETE_Z_TYPAMI}}` | odpytanie statusów (P2) |
| `{{SCIEZKA_SKRYPTU}}`, `{{WYWOLANIE_SKRYPTU}}` | `script-contract.md` — wywołanie z pełną ścieżką `.claude/skills/planned-tasks/<plik>` |
| `{{PUNKTY_DZIALANIA_SKRYPTU}}` | lista 3–6 punktów: zakres, odsiew, grupowanie, podzadania, termin |
| `{{SEKCJE_WYDZIELONE_OPIS}}`, `{{NAGLOWEK_GLOWNY}}`, `{{NAGLOWKI_WYDZIELONE}}` | oś 4, nagłówki z wyjścia skryptu |
| `{{SKAD_TABELE}}` | „ze skryptu" / „złożone z odczytu" |
| `{{CO_WYROZNIAC}}` | oś 10 + statusy w toku z odpytania |
| `{{PRZYKLADY_ZAWEZEN}}` | 2–3 przykłady w języku projektu, zgodne z grupowaniem |
| `{{PODPOWIEDZ_LOGOWANIA}}` | oś 2, np. „`gh auth status`; nie szukaj tokenu gdzie indziej" |
| `{{POWOD_BRAKU_KONTROLI}}` | faza 4 |
