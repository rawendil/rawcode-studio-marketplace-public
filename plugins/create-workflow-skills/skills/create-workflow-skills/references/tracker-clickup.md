# Cheatsheet: ClickUp (`cup`)

Ten plik konsultuje faza 0 (odpytanie identyfikatorów i statusów projektu) i
faza 3 (wstawienie komend i pułapek do sekcji „Kontekst trackera" oraz do tabeli
„Częste błędy" generowanego skilla) `/create-workflow-skills`. Komendy i pułapki niżej zweryfikowano
wywołaniami `--help` i realnymi (odczytowymi) wywołaniami CLI `cup` — nie są
przepisane z dokumentacji na pamięć.

## Odpytanie identyfikatorów

- `cup spaces` — listuje spaces w workspace. Każdy space w wyniku JSON niesie
  też swoją listę statusów (`statuses[].status`) — użyteczne jako pierwszy
  rzut oka, zanim policzysz statusy faktycznie używane na konkretnej liście
  (patrz sekcja niżej).
- `cup lists <spaceId>` — listuje listy w space, **łącznie z listami wewnątrz
  folderów**. `cup lists <spaceId> --json` zwraca tylko `folder`/`id`/`name` —
  **nie** zwraca statusów listy (komenda `cup list <id>` w ogóle nie istnieje).
- `cup auth` — waliduje token i mówi, **na czyim koncie** CLI działa
  (`Authenticated as @<user> (id: <id>)`). Zawsze sprawdź to przed generowaniem
  skilla, żeby wygenerowana treść nie zakładała cudzej tożsamości.
- **`workspace_id`/`team_id` nie jest potrzebny w komendach** — `cup` trzyma
  `teamId` we własnej konfiguracji (profil ustawiony przy `cup init`). Nie
  wpisuj go do generowanego skilla jako parametr komend `cup`.

## Wyliczenie statusów — nazwy ORAZ typy

**Typ statusu jest ważniejszy od nazwy** i tylko jedno źródło go podaje.
`cup spaces --json` zwraca dla każdego space'u `statuses[]` z polami `status`
i **`type`**:

```bash
cup spaces --json | python3 -c "import json,sys
d=json.load(sys.stdin); sp=d if isinstance(d,list) else d.get('spaces',[])
for s in sp:
  print(s['name'], [(x['status'], x['type']) for x in s.get('statuses',[])])"
```

Realny wynik (space „Personal"):

```
[('backlog','open'), ('to do','custom'), ('in progress','custom'),
 ('review','custom'), ('on hold','custom'), ('canceled','done'), ('Closed','closed')]
```

**To jedyne w pełni odczytowe źródło prawdy o statusach.** Zapisz je do
generowanego skilla jako komendę weryfikacyjną — nigdy komendy zapisującej
(patrz pułapka o `cup update -s`).

**Statusy zamykające rozpoznajesz po typie `done` albo `closed`, nie po nazwie.**
W przykładzie wyżej zamykające są dwa: `canceled` (typ `done`) i `Closed`
(typ `closed`) — po nazwie zgadłbyś tylko drugi.

Statusy dziedziczone są ze space'u, ale na konkretnej liście mogą być używane
tylko częściowo. Faktycznie używane na liście policzysz tak:

```bash
cup tasks --list <listId> --all --include-closed --json \
  | python3 -c "import json,sys; print(sorted({t['status'] for t in json.load(sys.stdin)}))"
```

Ta komenda daje nazwy bez typów — dlatego jest **uzupełnieniem** listingu
space'u, nie jego zamiennikiem.

`jq` bywa nieobecny na maszynie, na której skill się wykonuje — `python3` jest
w zestawie standardowo, więc parsowanie JSON-a nim jest bezpieczniejszym
domyślnym wyborem dla generowanego skilla.

## Pułapki

| Pułapka | Skutek | Obejście |
|---|---|---|
| `cup tasks`/`cup search` bez `--all` | Domyślnie CLI pokazuje tylko zadania przypisane do Ciebie — widzisz ułamek listy i dostajesz mylące „No tasks found", choć zadania istnieją | `--all` obowiązkowo w obu komendach |
| `--status` przyjmuje jedną wartość | Trzy pule statusów (np. `to do`/`backlog`/`on hold`) = trzy wywołania, i łatwo przeoczyć trzecią — realny przypadek: `on hold` zgubione, bo filtrowano tylko dwa statusy | Jedno `cup tasks --list … --all` bez `--status` — ale **przeczytaj następny wiersz**: to wywołanie nie zwraca wyłącznie statusów otwartych |
| **`cup tasks` bez `--include-closed` odsiewa tylko typ `closed`** | Statusy typu **`done`** (np. `canceled`) **przechodzą przez filtr** i trafiają do puli jako kandydaci do pracy. Zreprodukowane: na liście `900000000004` wywołanie `cup tasks --list … --all --json` zwróciło zadanie `86c0abc12` o statusie `canceled`. `cup tasks --help` opisuje flagę jako „Include **done**/closed tasks", co sugeruje symetrię, której nie ma | Po odczycie **odsiej po typie**: pobierz typy z `cup spaces --json` i odrzuć pozycje, których status ma typ `done` albo `closed`. Nie polegaj na samej nieobecności flagi. Na liście bez zadań `canceled` błąd jest niewidoczny — dlatego wymaga odsiewu, nie obserwacji |
| `--status` w `search` niewalidowany | Literówka w nazwie statusu nie zwraca błędu — cicho dostajesz zero wyników, co wygląda jak „zadań nie ma" | Sprawdź dokładną nazwę statusu na liście przed filtrowaniem (wielkość liter i spacje mają znaczenie) |
| **`cup update -s <status>` dopasowuje ROZMYTO i ZAPISUJE** | `cup update --help` mówi dosłownie: „New status (fuzzy matched, e.g. »prog« matches »in progress«)". Nazwa bliska istniejącemu statusowi **po cichu zmieni status prawdziwego zadania**. Komunikat `No matching status for "X". Available: …` pada **tylko** dla nazwy, która nie dopasowuje się do niczego — więc „nic nie zmienia" jest prawdą wyłącznie w tym jednym przypadku | **Nigdy nie używaj `cup update` do rozpoznawania statusów.** To komenda zapisująca. Odczytowe źródło prawdy to `cup spaces --json` (sekcja „Wyliczenie statusów") |
| `-d "…"` / `-m "…"` inline w shellu | Wielolinijkowy markdown (backticki, apostrofy, `\n`) rozwala się na quotingu shella — opis/komentarz trafia okrojony albo z błędami | `--description-file <plik>` / `--message-file <plik>` — zapisz treść do pliku i podaj ścieżkę |
| `--description-file` **nadpisuje cały opis** zadania | Zapis nowego opisu kasuje istniejący cel, kontekst, zakres i DoD — nieodwracalnie, bez potwierdzenia | Najpierw pobierz obecny opis (`cup task <id> --json`, pole `markdown_description`), dopisz do niego nową treść i zapisz **całość** przez `--description-file` |
| `cup get <id>` | Taka komenda **nie istnieje** w `cup` (potwierdzone `cup --help` — nie ma jej na liście komend) | `cup task <id>` |
| Kształt JSON różni się między komendami | `cup tasks --json` / `cup search --json` zwracają **tablicę** obiektów, gdzie `status` i `priority` są zwykłymi **stringami**; `cup task <id> --json` zwraca **jeden obiekt**, gdzie `status` i `priority` są **obiektami** (`status.status`, `priority.priority`) — kod parsujący na ślepo jedno pod drugie wyciągnie `None`/wyjątek | Parsuj świadomie, zależnie od komendy: `t['status']` dla listy, `t['status']['status']` dla `cup task` |
| `cup tasks --json` nie zwraca daty utworzenia | Pola w wyniku to `id`, `name`, `status`, `priority`, `due_date`, `list`, `task_type`, `url` — bez `date_created`, więc nie rozstrzygniesz remisu priorytetów „najstarsze pierwsze" z tego widoku | `cup task <id>` (widok tekstowy) pokazuje pole `Created`; JSON tego obiektu ma `date_created` |
| `jq` bywa nieobecny na maszynie wykonującej skill | Skrypt z `jq` pada z `command not found` | Parsuj JSON `python3 -c "import json,sys; ..."` — jest standardowo dostępny |

## Priorytety

`1` urgent / `2` high / `3` normal / `4` low. `cup create --priority` i
`cup update --priority` przyjmują **numer albo nazwę** zamiennie (potwierdzone
`--help`: „Priority: urgent, high, normal, low (or 1-4)"). Brak priorytetu na
zadaniu wygląda w JSON jako `"priority": "none"` (widok listowy) albo
`"priority": null` (widok pojedynczego zadania) — obie wartości oznaczają „nie
ustawiono", nie błąd parsowania.

## Tagi i przypisania

- Tagi muszą **już istnieć** w space, zanim ich użyjesz na zadaniu —
  sprawdź `cup tags <spaceId>`. Założenie nowego tagu (`cup tag-create
  <spaceId> <nazwa>`) tylko **za zgodą użytkownika**, nigdy automatycznie.
- Dodanie/odjęcie tagu na konkretnym zadaniu: `cup tag <taskId> --add
  "<tag1,tag2>"` / `--remove "<tag1,tag2>"`.
- Przypisania: ID użytkownika albo `"me"` — `cup assign <taskId> --to <userId
  albo me>` / `--remove <userId albo me>`, albo przy tworzeniu/aktualizacji
  zadania flaga `--assignee` (`cup create`/`cup update`). Listę członków
  workspace daje `cup members`.

## Kanał MCP

Gdy w sesji dostępne są narzędzia `clickup_*` (serwer MCP ClickUp), **nie
zgaduj kształtu ich parametrów z tego pliku ani z żadnego innego projektu —
serwery MCP ClickUp różnią się między implementacjami.** Przed opieraniem na
nich wygenerowanego skilla, przeczytaj schemat narzędzia faktycznie
dostępnego w sesji (nazwa, opis, lista parametrów) — to jest źródło prawdy,
nie ten cheatsheet.

- **`workspace_id`: nie zakładaj z góry, czy trzeba go podać.** Jeden
  z projektów referencyjnych tego wzorca (`projekt-gra`) opisuje
  serwer MCP, gdzie `workspace_id` **jest** jawnym parametrem. Kontrastowy,
  realnie sprawdzony przykład z tej sesji: serwer `claude_ai_ClickUp`
  (narzędzia `clickup_filter_tasks`, `clickup_create_task`,
  `clickup_update_task`, `clickup_get_task`, `clickup_search`,
  `clickup_get_workspace_hierarchy`) — w schemacie **żadnego** z tych
  sześciu narzędzi nie istnieje parametr `workspace_id` ani `team_id`; zakres
  workspace jest tam albo ustalony po stronie serwera, albo wynika z innych
  parametrów (`list_ids`, `task_id`, `space_ids`). Oba stany są prawdziwe —
  zależnie od tego, **jaki konkretnie serwer** stoi za `clickup_*` w danym
  projekcie. Traktuj to jako rzecz do sprawdzenia w schemacie, nie do
  wpisania na pamięć.
- Listowanie zadań: w serwerze `claude_ai_ClickUp` idzie przez
  `clickup_filter_tasks` z parametrem `list_ids` (analogon `cup tasks --list
  <listId> --all`) — nazwa narzędzia i parametru potwierdzone jego realnym
  schematem.
- Opis zadania (tworzenie/aktualizacja): w tym samym serwerze idzie przez
  parametr `markdown_description` na `clickup_create_task`/
  `clickup_update_task` — potwierdzone schematem. Analogon `--description-file`,
  ale strukturalny (bez pliku pośredniczącego), więc pułapka „nadpisuje cały
  opis" z tabeli wyżej dotyczy go **równie mocno**: pobierz obecny opis przed
  zapisem nowego (`clickup_get_task` z `include: ["description"]`) — nazwę
  pola, w którym wraca sam opis, potwierdź w schemacie/odpowiedzi tego
  narzędzia, bo nie została zweryfikowana tutaj.

**Ostrzeżenie:** konfiguracja MCP widoczna w sesji **nie jest dowodem**, że
serwer żyje — bywa, że narzędzia `clickup_*` są zarejestrowane, a każde ich
wywołanie kończy się błędem (serwer martwy mimo widocznej konfiguracji, tak
jak w jednym z projektów referencyjnych tego wzorca). **Sprawdź jednym
wywołaniem** (np. odczyt listy albo jednego zadania), zanim oprzesz na tym
kanale cały wygenerowany skill — inaczej skill trafia w martwy punkt na
pierwszym realnym użyciu.
