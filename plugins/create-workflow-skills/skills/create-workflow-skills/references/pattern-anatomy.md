# Anatomia wzorca `next-task` / `add-task`

Ten plik opisuje **strukturalny kontrakt** dobrego skilla workflow. Czyta go
model w fazie 3 (generowanie) razem z `references/template-next-task.md` i
`references/template-add-task.md` — precyzja ma pierwszeństwo przed prozą.

Wzorzec wyekstrahowano z czterech prawdziwych, działających skilli z dwóch
projektów (nazwy projektów, identyfikatory i dane w cytatach zanonimizowane):

- `projekt-restauracje/.claude/skills/next-task/SKILL.md` — 13 kroków, STOP-bramki 1/6/9/11,
  bramka „dowód z produkcji", push = deploy.
- `projekt-restauracje/.claude/skills/add-task/SKILL.md` — 7 kroków, STOP-bramka 6.
- `projekt-gra/.claude/skills/next-task/SKILL.md` — 16 kroków (z pre-flight
  0), STOP-bramki 5/10, specka+plan do `docs/`, push wymagany.
- `projekt-gra/.claude/skills/add-task/SKILL.md` — 7 kroków, wykrywanie
  transportu (CLI/MCP).

Każdy przykład niżej jest **cytatem** z jednego z tych czterech plików, z podanym
źródłem. Nazwy sekcji muszą trafiać w synonimy z `SECTIONS` walidatora
(`${CLAUDE_PLUGIN_ROOT}/scripts/validate-generated.js`) — sekcja
„Zgodność z walidatorem" na końcu wypisuje je wprost.

---

## Anatomia `next-task` (8 sekcji)

| # | Sekcja | Warunkowa | Osie (`references/interview.md`) |
|---|---|---|---|
| 1 | Frontmatter z triggerami | nie | 1, język projektu |
| 2 | Overview + zasada nadrzędna | nie | 4, 8, 13 |
| 3 | Kontekst trackera (stałe) | nie | 1–2, 5, 7 + odpytanie |
| 4 | Ostrzeżenia o zasobach | tak — gdy oś 3 wykazała zasób piszący do produkcji | 3 |
| 5 | Definicja ukończenia (bramka) | nie | 11, 13 |
| 6 | Workflow — numerowane kroki | nie | warunkowo: 3–4, 6, 8–11, 13–17; przez podstawienia: 5, 12, 16–17 |
| 7 | Git | tak — gdy projekt jest repo git (fakt z fazy 0, nie oś) | 14 (cała sekcja), 15 (tylko podsekcja sesji równoległych) |
| 8 | Częste błędy (tabela) | nie | wszystkie |

**1. Frontmatter z triggerami.** `name` = nazwa katalogu skilla, `description`
w formacie `Use when the user invokes /next-task or asks to...` — po angielsku
w obu projektach referencyjnych, **nawet gdy** cała reszta skilla jest po polsku
(oś „język projektu" dotyczy ciała skilla, nie frontmattera).

> Źródło: `projekt-restauracje/.claude/skills/next-task/SKILL.md:1-4`
> ```
> ---
> name: next-task
> description: Use when the user invokes /next-task or asks to pick up / start the next task from the Restauracje ClickUp list ("weź następne zadanie", "co dalej z listy", "następny task") — selects, executes and hands over a task from the Restauracje list.
> ---
> ```

**2. Overview + zasada nadrzędna.** Krótki opis cyklu (wybór → rozeznanie →
ustalenia → wykonanie → oddanie do oceny → domknięcie), zamknięty
**„Zasadą nadrzędną"** — warunkami, bez których nie zaczyna się pracy. Składa w
jeden akapit oś 4 (potwierdzać wybór), oś 8 (wymaga akceptacji) i oś 13
(wzmianka o potwierdzeniu efektu „na żywo" przy domknięciu) — dokładnie te trzy
osie bramkują bloki warunkowe tej sekcji w `references/template-next-task.md`.
Warstwy definicji ukończenia (oś 11) **nie** są tu warunkiem: overview tylko
odsyła do sekcji 5, która je trzyma.

> Źródło: `projekt-restauracje/.claude/skills/next-task/SKILL.md:26-29`
> ```
> **Zasada nadrzędna:** nie zaczynasz pracy, dopóki nie masz (1) **potwierdzonego
> przez użytkownika wyboru zadania**, (2) rozeznania w kodzie/stanie faktycznym,
> (3) **jasnego DoD** i (4) zgody użytkownika na decyzje projektowe. Konflikt z
> `CLAUDE.md`, `.ai/guidelines/` lub specką w `docs/superpowers/specs/` →
> **zgłaszasz wprost**, nigdy nie nadpisujesz po cichu.
> ```

**3. Kontekst trackera (stałe).** Identyfikatory listy/projektu, statusy, kanał
(CLI/MCP), zasady odpytywania „nie zgaduj nazw" — wszystko, co model musi znać
**bez** ponownego odpytywania trackera w każdej sesji. Odpowiada osiom 1–2, 5, 7;
adnotacja „+ odpytanie" oznacza, że identyfikatory nie są wpisywane na pamięć z
wywiadu, tylko potwierdzone komendą trackera (patrz „Zgodność z walidatorem" —
identyfikatory nie są pytaniem).

> Źródło: `projekt-restauracje/.claude/skills/next-task/SKILL.md:38-45`
> ```
> - **list_id:** `900000000001` (lista „restauracje.example", folder „restauracje.example"
>   `900000000002`, space „Personal" `90000000003`).
> - **`workspace_id` nie jest już potrzebny** — `cup` trzyma `teamId` w swojej
>   konfiguracji. `cup auth` mówi, na czyim koncie działasz.
> - **Statusy:** `backlog` → `to do` → `in progress` → `review` → `on hold`;
>   zamykające `Closed` / `canceled`. **Nie zgaduj nazw** — `--status` dopasowuje
>   rozmyto (exact > starts-with > contains) i przyjmuje **jedną** wartość, nie
>   listę.
> ```

**4. Ostrzeżenia o zasobach — warunkowa.** Pojawia się **tylko** gdy oś 3
(zasoby do użycia) wykazała coś piszącego do produkcji bez środowiska
stagingowego. Dowód warunkowości: sekcja istnieje w `projekt-restauracje/next-task`
(serwer MCP `projekt-restauracje` pisze do bazy produkcyjnej restauracji), ale jest
**całkowicie nieobecna** w `projekt-gra/next-task` — tam nie ma
takiego zasobu, więc sekcja nie występuje wcale (nie jako puste nagłówek, nie
jako „nie dotyczy").

> Źródło: `projekt-restauracje/.claude/skills/next-task/SKILL.md:61-69`
> ```
> ## ⚠️ Serwer MCP `projekt-restauracje` pisze do PRODUKCJI
>
> Każde `add-venue`, `update-venue`, `add-venue-photo`, `create-photo-upload-link`
> i `lookup-venue-hours` działa na **bazie produkcyjnej**, nie lokalnej. Stąd
> twarda zasada:
>
> - **Id lokali w bazie lokalnej i produkcyjnej się rozjeżdżają.** Realny przykład:
>   lokal „A" ma lokalnie id 39, a na produkcji 18 — gdzie 39 to zupełnie inna
>   restauracja.
> ```

**5. Definicja ukończenia (bramka).** Treść zależy od projektu — może być listą
warstw obowiązkowych w każdym zadaniu (oś 11), albo odczytem DoD z opisu taska
plus regułą „co gdy go nie ma". Oba warianty są tą samą sekcją: **bramką**, przez
którą zadanie musi przejść, zanim trafi do oceny. Oś 13 (dowód „na żywo") dodaje
warunek, że lokalne testy nie wystarczają.

> Źródło: `projekt-gra/.claude/skills/next-task/SKILL.md:27-34`
> ```
> Zanim uznasz je za gotowe do oddania (krok 10), musisz wykonać **wszystkie trzy**
> poniższe elementy w ramach **tego** zadania — nie wolno ich odkładać na osobne,
> przyszłe zadania:
>
> 1. **Dokumentacja gry** (`docs/`) zaktualizowana i spójna (źródło prawdy).
> 2. **Silnik reguł** (czysty TS) — zmiany wdrożone i przetestowane (TDD).
> 3. **UI prototypu** — zmiany wdrożone, tak by funkcja była **realnie używalna** w
>    hot-seat (nie tylko w silniku).
> ```
>
> Kontrast — wariant „DoD z opisu taska", `projekt-restauracje/.claude/skills/next-task/SKILL.md:81-89`:
> ```
> Bramką jest **DoD z opisu taska** ... **Brak DoD w tasku** (dużo starszych
> tasków go nie ma) → **nie startujesz na ślepo**: proponujesz DoD w bramce 5,
> użytkownik zatwierdza, a Ty dopisujesz go do opisu taska (…).
> ```

**6. Workflow — numerowane kroki.** Największa sekcja. Bloki warunkowe
`{{#JEŚLI oś N …}}` w sekcji „Workflow" szablonu
`references/template-next-task.md` nazywają **jedenaście** osi: 3 (spójność z
dokumentacją-źródłem-prawdy w kroku researchu), 4 (wybór zadania), 6 (bramka
blokerów), 8 (oddanie do oceny), 9 (komentarz-podsumowanie), 10 (kolejność
domknięcia), 11 (zakres wykonania), 13 (STOP „na żywo"), 14 (push), 15 (**krok
0 pre-flight** i ostrzeżenie przy `git add`), 16 (specka/plan oraz sprzątanie).
Osie 5 (pula otwarta, priorytety, remisy) i 12 (brama jakości) wchodzą do tej
sekcji **przez podstawienia** (`{{PULA_OTWARTA}}`, `{{PRIORYTETY}}`,
`{{REGULA_REMISU}}`, `{{BRAMA_JAKOSCI}}`), nie przez blok warunkowy — dlatego
kolumna „Osie" rozdziela te dwie listy. Nagłówek sekcji **musi** wypisywać,
które kroki są STOP-bramkami i które są wymagane — zasada pisania #3 niżej.

> Źródło: `projekt-restauracje/.claude/skills/next-task/SKILL.md:113-118`
> ```
> Utwórz TODO na każdy krok. Kroki **1**, **6**, **9** i **11** to **STOP-bramki** —
> nie przechodzisz dalej bez spełnienia warunku. Kroki **10** (git), **12**
> (komentarz + zamknięcie) i **13** (sprzątanie) są **wymagane** — zadanie nie
> jest zrobione, dopóki praca nie jest zacommitowana, efekt nie jest potwierdzony
> **na produkcji**, ...
> ```

**7. Git — warunkowa.** Pojawia się, gdy projekt jest repozytorium git — to
**fakt z fazy 0** (marker `{{#JEŚLI projekt jest repo git}}`), którego nie
ustala żadna z 17 osi wywiadu; praktycznie zawsze prawdziwy, ale nadal
sprawdzany, nie stała. **Oś 15 nie bramkuje tej sekcji**, a trzy
miejsca w jej wnętrzu: dopisek „(uwaga na sesje równoległe)" w nagłówku, jedną
klauzulę w akapicie głównym i całą podsekcję o sesjach równoległych:
projekt pracujący w jednej sesji naraz (oś 15 = B) **nadal ma** sekcję Git z
dyscypliną `git add <pliki>` i zakazem `git add -A`/`reset`. Treść **odwraca
się** między projektami: w jednym push jest zakazany bez wyraźnej prośby
(push = deploy), w drugim push jest wymaganym krokiem workflow — ta sama sekcja,
przeciwna reguła, bo o tym decyduje oś 14.

> Źródło: `projekt-restauracje/.claude/skills/next-task/SKILL.md:299-301`
> ```
> Commituj **dopiero po akceptacji** użytkownika (krok 10); **push tylko na
> wyraźną prośbę** — bo push = deploy. Stage **tylko pliki, które sam edytowałeś**
> (`git add <pliki>`), **nigdy `git add -A` ani `reset`**
> ```
>
> Kontrast, `projekt-gra/.claude/skills/next-task/SKILL.md:159-160`:
> ```
> W tym workflow **commit i push są wymaganymi krokami** (inaczej niż domyślna
> zasada „push tylko na prośbę" — tu push jest częścią domknięcia zadania).
> ```

**8. Częste błędy (tabela).** Dwie kolumny: `Błąd | Zamiast tego`. Każdy wiersz
odsyła do konkretnego kroku lub reguły ustalonej wcześniej w pliku — to
destylacja **wszystkich** osi, nie nowa treść.

> Źródło: `projekt-restauracje/.claude/skills/next-task/SKILL.md:343,350`
> ```
> | **Start zadania bez potwierdzenia wyboru** | Krok 1 to STOP-bramka: 2–3
> kandydatów, `AskUserQuestion`, dopiero potem status i praca |
> | **`Closed` przed dowodem z produkcji** | Krok 11 to STOP-bramka: zadanie
> siedzi w `review`, aż efekt jest potwierdzony na produkcji |
> ```

---

## Anatomia `add-task` (7 sekcji)

Sekcje 1–3 jak w `next-task` (frontmatter, overview + zasady nadrzędne, kontekst
trackera), z jedną różnicą: overview `add-task` zawsze zawiera zasadę „priorytet
ustalasz zawsze" i „nie tworzysz bez potwierdzenia szkicu" jako osobne punkty, nie
jeden akapit — bo `add-task` ma jedną bramkę (krok 6), nie kilka rozłożonych w
czasie.

| # | Sekcja | Warunkowa | Osie |
|---|---|---|---|
| 1 | Frontmatter z triggerami | nie | 1, język projektu |
| 2 | Overview + zasady nadrzędne | nie | brak — „potwierdzenie szkicu" i „priorytet zawsze" są zachowaniem stałym ze specki (patrz akapit wyżej), nie derywatem osi; 1 (tracker — zmienia mechanizm wymuszenia priorytetu: natywne pole vs etykieta) i 3 (dokumentacja-źródło-prawdy — dodaje regułę nazewnictwa wg słownika, gdy wykryta) |
| 3 | Kontekst trackera (stałe) | nie | 1–2, 7 + odpytanie |
| 4 | Szablon opisu zadania | sekcja „Konsekwencje/spójność" tak — gdy oś 3 wykazała dokumentację-źródło-prawdy | 3 |
| 5 | Workflow — 7 kroków | nie | brak |
| 6 | Domyślne DoD | nie | 11–12 |
| 7 | Częste błędy (tabela) | nie | wszystkie |

**1. Frontmatter z triggerami.**

> Źródło: `projekt-gra/.claude/skills/add-task/SKILL.md:1-4`
> ```
> ---
> name: add-task
> description: Use when the user invokes /add-task or asks to add / create a new task on the project's ClickUp KNŚ list ("dodaj zadanie", "utwórz taska", "zapisz to jako zadanie").
> ---
> ```

**2. Overview + zasady nadrzędne.**

> Źródło: `projekt-restauracje/.claude/skills/add-task/SKILL.md:18-23`
> ```
> **Zasady nadrzędne:**
>
> - **Nie tworzysz zadania bez potwierdzenia** szkicu przez użytkownika.
> - **Priorytet ustawiasz zawsze** — proponujesz go w szkicu z krótkim
>   uzasadnieniem, użytkownik potwierdza lub koryguje. `cup create` **nigdy** nie
>   leci bez `--priority`.
> ```

**3. Kontekst trackera (stałe).** Gdy oś 2 (kanał) wykazała, że dostępne są
oba transporty (CLI i MCP) i wybór zależy od środowiska sesji, ta sekcja rośnie
o osobny akapit wykrywania — nie zgaduje z góry, którym kanałem sesja gada z
trackerem.

> Źródło: `projekt-gra/.claude/skills/add-task/SKILL.md:41-47`
> ```
> ClickUp jest w tym projekcie **zawsze**, ale **kanał zależy od środowiska**:
> lokalnie zwykle CLI `cup`, w sesjach zdalnych (Claude Code on the web) — serwer
> **MCP ClickUp** ... **Na starcie ustal, co masz** — `command -v cup` i rzut oka
> na dostępne narzędzia MCP — i użyj tego, co faktycznie działa. **Nie zgłaszaj
> braku dostępu do ClickUpa, zanim nie sprawdzisz obu.**
> ```

**4. Szablon opisu zadania.** Stała struktura cztero-sekcyjna: `Cel` /
`Kontekst / stan obecny` / `Zakres` (checklista `- [ ]`) / `Kryteria ukończenia
(DoD)`. Gdy oś 3 wykazała, że projekt ma dokumentację-źródło-prawdy w `docs/`
(spójność krzyżowa, słownik terminów), szablon **dostaje piątą sekcję**
warunkową „Konsekwencje / spójność" — nieobecną, gdy dokumentacji nie ma.

> Baza, źródło: `projekt-restauracje/.claude/skills/add-task/SKILL.md:141-154`
> ```
> ## Cel
> <jedno zdanie: po co to robimy>
>
> ## Kontekst / stan obecny
> <skąd wynika potrzeba; odnośniki do kodu jako plik:linia>
>
> ## Zakres
> - [ ] <mierzalny krok>
> - [ ] ...
>
> ## Kryteria ukończenia (DoD)
> <kiedy uznajemy za zrobione>
> ```
>
> Rozszerzenie warunkowe, źródło: `projekt-gra/.claude/skills/add-task/SKILL.md:120-123`
> ```
> ## Konsekwencje / spójność
> <sync docs↔prototyp (pamięć: sync-docs-with-prototype), spójność krzyżowa
> docs (CLAUDE.md §5), nazewnictwo wg docs/00; decyzje balansowe → docs/91>
> ```

**5. Workflow — 7 kroków.** Ten sam szkielet w obu projektach referencyjnych:

zbierz treść → odczytaj statusy i tagi → sprawdź duplikaty (zawsze, z
zamkniętymi) → złóż opis z szablonu → ustal status i priorytet →
**STOP: pokaż szkic** → utwórz i zweryfikuj zapis.

Szkielet jest **niezmienny wobec osi wywiadu** — stąd `brak` w kolumnie „Osie":
sekcja „Workflow" w `references/template-add-task.md` nie zawiera ani jednego
bloku `{{#JEŚLI oś N = wartość}}`. Osie 4–5 (potwierdzanie wyboru, pula otwarta
i remisy) dotyczą wybierania spośród **istniejących** zadań, a oś 6 bramkuje
**rozpoczęcie pracy** nad już wybranym zadaniem — obie rzeczy są wyłącznie
sprawą `next-task`; `add-task` nigdy nie wybiera z puli i nie startuje pracy.

`projekt-gra` dokłada do tych siedmiu kroków **realny, opcjonalny
krok 8 „(Opcjonalnie) Relacje"** — zapis zależności („blokowane przez") albo
zwykłego powiązania dwóch zadań, źródło:
`projekt-gra/.claude/skills/add-task/SKILL.md:98-100`; `projekt-restauracje`
kończy na kroku 7. Ten krok jest warunkowany **faktem o trackerze** (czy ma
pole relacji/zależności między zadaniami), nie odpowiedzią z wywiadu — dlatego
nie zmienia `brak` w kolumnie „Osie"; szczegóły w regule składania #2 w
`references/template-add-task.md`.

> Źródło: `projekt-restauracje/.claude/skills/add-task/SKILL.md:54-55`
> ```
> Utwórz TODO na każdy krok. Krok **6 to STOP-bramka** — nie tworzysz zadania bez
> akceptacji szkicu.
> ```
>
> Krok 7 („utwórz i zweryfikuj zapis") nie jest samym `create` — po utworzeniu
> odczytuje się zadanie z powrotem i porównuje status/priorytet z uzgodnionymi,
> źródło: `projekt-restauracje/.claude/skills/add-task/SKILL.md:128-131`:
> ```
> ⚠️ To `cup task <id>`, **nie `cup get`** — takiej komendy nie ma. W tym
> widoku `status` i `priority` to **obiekty** (`.status.status`,
> `.priority.priority`), inaczej niż w `cup tasks --json`, gdzie `status` jest
> zwykłym stringiem.
> ```

**6. Domyślne DoD.** Dla zadań dotykających kodu — zestaw testowo-lintowy
domyślny; dla zadań niekodowych — **jawne pominięcie**, nie domyślne wklejenie
testu tam, gdzie nie ma czego testować.

> Źródło: `projekt-restauracje/.claude/skills/add-task/SKILL.md:158-167`
> ```
> Dla każdego zadania **dotykającego kodu** DoD zawiera:
>
> - test Pest pokrywający zmianę (nowy albo zaktualizowany istniejący),
> - `php artisan test --compact --filter=<nazwa>` przechodzi,
> - przy zmianach w PHP: `vendor/bin/pint --dirty` czysty.
>
> ... Dla zadań **niekodowych** ... **pomiń ten warunek i napisz w szkicu, że go
> pomijasz**
> ```

**7. Częste błędy (tabela).**

> Źródło: `projekt-gra/.claude/skills/add-task/SKILL.md:132-133`
> ```
> | Założenie z góry, którym kanałem gadasz z ClickUpem | **Sprawdź oba**
> (`command -v cup`, narzędzia `mcp__ClickUp__*`) — lokalnie zwykle CLI, w
> sesjach zdalnych MCP |
> | „ClickUp niedostępny" po nieudanej próbie **jednym** kanałem | ClickUp jest
> zawsze — brakuje najwyżej jednego transportu; spróbuj drugiego, zanim zgłosisz
> brak |
> ```

---

## Zasady pisania

Osiem reguł obowiązujących przy składaniu obu skilli w fazie 3. Każda ma
jednozdaniowe uzasadnienie — bez niego reguła jest tylko preferencją stylistyczną.

1. **Każdy krok podaje konkretną komendę, nie „sprawdź zadanie".**
   Uzasadnienie: komenda bez konkretnych flag zostaje odgadnięta na nowo przy
   każdym wykonaniu skilla, a odgadywanie jest właśnie tym, co ten wzorzec ma
   eliminować (patrz `cup tasks --list … --all --include-closed --json` w
   `projekt-restauracje/next-task:48-49` — nie „pobierz zadania").
2. **„Utwórz TODO na każdy krok" na wejściu w sekcję Workflow.**
   Uzasadnienie: bez jawnego TODO model gubi ślad, który krok z 13–16 już
   wykonał, i albo powtarza krok, albo go przeskakuje.
3. **STOP-bramki i kroki wymagane wypisane w nagłówku sekcji Workflow, nie ukryte w treści kroku.**
   Uzasadnienie: model decydujący „czy mogę iść dalej" skanuje nagłówek sekcji
   najpierw — bramka schowana w środku akapitu kroku 9 zostaje przeoczona przy
   szybkim czytaniu.
4. **Treść wielolinijkowa (opis, komentarz) zawsze przez plik, nigdy inline.**
   Uzasadnienie: quoting w shellu (backticki, apostrofy, `\n`) rozwala markdown
   przekazany przez `-m "..."` / `-d "..."` — potwierdzone w komentarzach obu
   par skilli („inline psuje wielolinijkowy markdown").
5. **„Evidence, nie deklaracje" przy każdej weryfikacji.**
   Uzasadnienie: bez pokazanego outputu deklaracja „testy przechodzą" maskuje
   realne niepowodzenie, które wychodzi na jaw dopiero po oddaniu zadania.
6. **Tabela częstych błędów zawiera wyłącznie pułapki wynikające z konfiguracji projektu; ogólniki odpadają.**
   Uzasadnienie: ogólnik typu „nie zapomnij przetestować" nie mówi modelowi, co
   konkretnie w **tej** konfiguracji pójdzie źle, więc nie zapobiega niczemu.
7. **Pula zadań odczytywana jednym wywołaniem, gdy CLI na to pozwala.**
   Uzasadnienie: filtr po jednym statusie naraz to N wywołań i łatwe przeoczenie
   trzeciej puli — realny przypadek: `on hold` zgubione, gdy filtrowano tylko
   `to do`/`backlog` (`projekt-restauracje/next-task:342`).
8. **Kroki nieistotne dla konfiguracji nie pojawiają się w ogóle, a numeracja pozostałych jest przeliczona.**
   Uzasadnienie: krok z adnotacją „nie dotyczy" jest szumem, który model przy
   wykonywaniu i tak próbuje zinterpretować, i psuje odwołania „patrz krok N"
   gdzieś dalej w pliku.

---

## Zgodność z walidatorem

`${CLAUDE_PLUGIN_ROOT}/scripts/validate-generated.js` sprawdza
wygenerowane pliki `SKILL.md` automatycznie (faza 4 skilla-orkiestratora). To,
co wypisano tu, jest wiążące dla treści generowanej w fazie 3 — nagłówki i
frazy muszą trafić w te dopasowania.

**Nagłówki sekcji muszą trafiać w synonimy** (dopasowanie jest fragmentem,
bez rozróżniania wielkości liter):

| Sekcja anatomii | Wymagana dla | Synonimy (`SECTIONS`) |
|---|---|---|
| Overview | `next-task`, `add-task` | `overview`, `przegląd` |
| Kontekst trackera | `next-task`, `add-task` | `kontekst`, `context`, `stałe`, `constants` |
| Workflow | `next-task`, `add-task` | `workflow`, `przepływ` |
| Częste błędy | `next-task`, `add-task` | `częste błędy`, `common mistakes`, `pitfalls` |
| Szablon opisu zadania | tylko `add-task` | `szablon opisu`, `description template`, `task template` |

Dodatkowo, poza dopasowaniem nagłówków:

- **`name` we frontmatterze musi być równe nazwie katalogu skilla** (`next-task`
  albo `add-task`) — walidator porównuje `fm.name` z `path.basename(dirname)`.
- **`description` musi zawierać `/next-task` albo `/add-task`** (trigger ze
  slashem, dopasowany do `name`).
- **Zero znaczników szablonu w wygenerowanym pliku.** Marker szablonu (`{{NAZWA}}`,
  `{{#JEŚLI oś N = wartość}} … {{/JEŚLI}}`) jest legalny w plikach
  `references/template-next-task.md` i `references/template-add-task.md` —
  to źródła, nie wynik. W pliku, który trafia do `.claude/skills/`, **każdy**
  marker musi być już podstawiony albo usunięty razem z blokiem warunkowym.
  Walidator zgłasza znaczniki szablonu (`{{` + wielka litera, `{{#…`, `{{/…`),
  `TBD`, `FIXME` oraz `NOTKA`/`SKŁADAJĄCEGO` jako **błąd**, nie ostrzeżenie.
  Szablony Go w komendach (`gh … --template '{{range .}}{{.title}}{{end}}'`)
  są legalne — zaczynają się małą literą albo kropką.
- **Zero notek dla składającego w wygenerowanym pliku.** Akapit
  `[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku]` z szablonu jest instrukcją
  dla modelu **składającego**; przepisany do `.claude/skills/` kazałby modelowi
  **wykonującemu** skill robić rzeczy w trakcie zadania. Walidator dopasowuje
  wielkością liter (`NOTKA`, `SKŁADAJĄCEGO`), więc zwykłe polskie słowo „notka"
  w treści skilla nie jest błędem.

**Najważniejsze dla generatora — co jest legalne i NIE jest zgłaszane:**

- **`<id>` w komendach jest legalne.** Placeholder typu `cup update <id> -s
  "in progress"` w treści kroku workflow **nie** jest markerem szablonu —
  walidator sprawdza tylko znaczniki szablonu `{{…}}`, `TBD`, `FIXME` oraz
  `NOTKA`/`SKŁADAJĄCEGO`. `<id>` zostaje w
  wygenerowanym pliku i to jest zamierzone: to instrukcja dla człowieka/modelu
  wykonującego skill, nie dziura po niewypełnionym szablonie.
- **Słowo `TODO` jest legalne.** Zasada pisania #2 nakazuje literalnie „Utwórz
  TODO na każdy krok" w treści wygenerowanego skilla — to jest wymagana fraza,
  nie zapomniany placeholder. Walidator go nie zgłasza (lista markerów to
  wyłącznie znaczniki szablonu `{{…}}`, `TBD`, `FIXME`, `NOTKA`/`SKŁADAJĄCEGO` oraz **wyciek
  numeracji osi** (`oś 11`, `osi 12` — wewnętrzna numeracja generatora, w wyniku
  nic nie znaczy) — `TODO` nie jest
  na niej).

Innymi słowy: model składający skille w fazie 3 nie ma czyścić `<id>` ani
`TODO` z wyniku — usuwa **wyłącznie** nierozwiązane markery `{{...}}` i puste
bloki warunkowe.
