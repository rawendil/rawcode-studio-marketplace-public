# Wywiad — siatka pytań fazy 1

Ten plik jest siatką pytań, którą faza 1 skilla `/create-workflow-skills`
zadaje modelowi prowadzącemu wywiad z użytkownikiem. 17 osi w 5 grupach — każda
grupa to jedno wywołanie `AskUserQuestion`, **maksymalnie 4 pytania na
wywołanie** (limit narzędzia), stąd podział 3-3-4-3-4. Numeracja osi jest
wiążąca dla całego pluginu: `template-next-task.md` i `template-add-task.md`
odwołują się do osi jako `{{#JEŚLI oś N = wartość}}`, a `pattern-anatomy.md`
cytuje numery osi w kolumnie „Osie". **Nie przenumerowywać.**

Każda oś ma: numer, pytanie, 2–4 opcje z konsekwencją dla wygenerowanego
skilla, oraz regułę wyboru opcji rekomendowanej na podstawie sondowania z fazy
0 (patrz tabela „Reguły wnioskowania domyślnych" niżej). Rekomendacja jest
zawsze **odrzucalna** — użytkownik widzi ją jako pierwszą opcję w
`AskUserQuestion`, nie jako ustawienie na pamięć.

Identyfikatory trackera (list_id, nazwy statusów, workspace) **nie są
pytaniem tej siatki** — są odpytywane przez wybrany kanał (oś 2) i potwierdzane
komendą trackera, nie wpisywane na pamięć z wywiadu.

**Reguła kolejności rekomendacji.** Grupy są prezentowane po kolei, a **każda
grupa to jedno wywołanie `AskUserQuestion`** — wszystkie osie w danej grupie są
więc odpowiadane jednocześnie, jednym kliknięciem. Dlatego reguła rekomendacji
danej osi może się odwoływać **wyłącznie** do sygnałów z fazy 0 i do osi z
**grup wcześniejszych** niż grupa tej osi — nigdy do osi z tej samej grupy,
nigdy do osi z grupy późniejszej. W momencie prezentacji grupy N odpowiedzi na
osie z grup > N (a także inne odpowiedzi z tej samej grupy N, zadawane tym
samym wywołaniem) jeszcze nie istnieją, więc reguła, która by na nich polegała,
nie da się ocenić na żywo.

Przypisanie osi do grup (patrz nagłówki „Grupa N" niżej):

- Grupa 1 — osie 1–3
- Grupa 2 — osie 4–6
- Grupa 3 — osie 7–10
- Grupa 4 — osie 11–13
- Grupa 5 — osie 14–17

To ograniczenie dotyczy wyłącznie akapitu **„Rekomendacja"** każdej osi.
Odwołanie do osi z późniejszej (albo tej samej) grupy w treści **opcji**
(kolumna „konsekwencja") jest legalne — opcja opisuje skutek dla
**wygenerowanego skilla**, ustalany w fazie 3, gdy wszystkie odpowiedzi już
istnieją, nie regułę wyboru rekomendacji pokazywaną na żywo w wywiadzie.

---

### Grupa 1 — tracker i zasoby

#### Oś (1) — system śledzenia zadań

**Pytanie:** Jakim systemem śledzenia zadań posługuje się ten projekt?

**Opcje:**
- **A. ClickUp** — konsekwencja: kanał to CLI `cup` i/lub MCP ClickUp (patrz oś
  2); sekcja „Kontekst trackera" wygenerowanego skilla zawiera `list_id`,
  workspace i statusy odczytane z listingu, nie zgadywane.
- **B. GitHub Issues** — konsekwencja: kanał to `gh issue list/view/comment/close`;
  statusy = `open`/`closed` + etykiety, priorytet trzeba emulować etykietą
  (`priority:high` itp.), bo GitHub nie ma natywnego pola priorytetu.
- **C. Jira** — konsekwencja: kanał to CLI `jira` lub MCP Jira; workflow statusów
  jest specyficzny per-projekt, więc sekcja „Kontekst trackera" musi wymienić
  realne nazwy przejść odczytane z projektu, nie standardowe „To Do/In
  Progress/Done".
- **D. Plik w repo (np. `docs/backlog.md`) albo inny tracker** — konsekwencja:
  brak API; „status" to sekcja/checkbox w pliku, a odczyt puli otwartych zadań
  to `grep`/`Read`, nie wywołanie CLI. Workflow traci kroki oparte na API
  (komentarz-podsumowanie staje się wpisem w pliku).

**Rekomendacja:** faza 0 sprawdza `command -v cup gh jira` i listę narzędzi MCP.
`cup` w PATH → A. `gh` obecny, brak innych CLI trackera → B. Nic z powyższego,
ale w repo istnieje plik typu backlog/TODO → D. Brak jakiegokolwiek sygnału →
zadaj pytanie bez podświetlonej rekomendacji.

#### Oś (2) — kanał komunikacji

**Pytanie:** Jak skill ma się łączyć z trackerem — CLI, MCP, czy oba z
wykrywaniem na starcie, i co robić, gdy dostępny jest tylko jeden?

**Opcje:**
- **A. Tylko CLI** — konsekwencja: prostsza, jedna sekcja „Kontekst trackera";
  nie zadziała w sesji bez zainstalowanego CLI (np. Claude Code on the web).
- **B. Tylko MCP** — konsekwencja: działa w każdej sesji z podłączonym
  serwerem; traci lokalne flagi CLI (np. `--message-file` do wielolinijkowych
  komentarzy) — trzeba znaleźć odpowiednik po stronie MCP albo zapisać
  ograniczenie wprost.
- **C. Oba, z wykrywaniem na starcie** (`command -v <cli>` + rzut oka na
  narzędzia MCP) i regułą „użyj tego, co faktycznie działa" — konsekwencja:
  sekcja „Kontekst trackera" rośnie o osobny akapit wykrywania i o dwie wersje
  każdej komendy (CLI/MCP); skill nigdy nie zgłasza braku dostępu, zanim nie
  sprawdzi obu kanałów.

**Rekomendacja z fazy 0:** `cup` w PATH i brak narzędzi `mcp__*ClickUp*` →
A (kanał CLI). Dostępne narzędzia MCP trackera i brak CLI → B (kanał MCP). Oba
dostępne → C.

#### Oś (3) — zasoby do użycia

**Pytanie:** Jakie zasoby poza trackerem skill ma znać i wykorzystywać — bazy
wiedzy, dokumentacja-źródło-prawdy, customowe MCP, mikroserwisy — i **które z
nich zapisują do produkcji**?

**Opcje:**
- **A. Brak dodatkowych zasobów** — konsekwencja: warunkowa sekcja
  „Ostrzeżenia o zasobach" (`pattern-anatomy.md`, sekcja 4) nie występuje w
  ogóle w wygenerowanym `next-task`.
- **B. Dokumentacja-źródło-prawdy w `docs/`, bez zapisu do produkcji** —
  konsekwencja: workflow dostaje krok „sprawdź spójność z `docs/`"; oś 11
  (warstwy DoD) zyskuje kandydata na warstwę „dokumentacja".
- **C. Customowy serwer MCP projektu, który zapisuje do produkcji** (np. baza
  danych restauracji, CMS, sklep) — konsekwencja: wygenerowany skill dostaje
  sekcję ostrzeżenia z nagłówkiem „⚠️ Serwer MCP `<nazwa>` pisze do PRODUKCJI",
  z regułami adresowania rekordów (id lokalne ≠ produkcyjne) i weryfikacji
  przed zapisem.
- **D. Mikroserwisy/inne API pomocnicze, bez zapisu do produkcji** —
  konsekwencja: wymienione w „Kontekście trackera" jako narzędzia pomocnicze,
  bez sekcji ostrzeżenia.

**Rekomendacja:** faza 0 czyta listę narzędzi MCP; customowy serwer MCP projektu
(nie tracker, nie ogólnego przeznaczenia) w tej liście → **dopytaj wprost, czy
zapisuje do produkcji** (nie zgaduj bezpieczeństwa zasobu). Katalog `docs/` z
numerowanymi plikami źródła prawdy → zaproponuj B i podświetl warstwę
„dokumentacja" jako kandydata obowiązkowego w osi 11.

---

### Grupa 2 — wybór zadania

#### Oś (4) — potwierdzanie wyboru zadania

**Pytanie:** Zanim skill zacznie pracę nad zadaniem, ma poprosić o potwierdzenie
wyboru, czy wybrać sam i tylko poinformować?

**Opcje:**
- **A. STOP-bramka** — przedstaw 2–3 kandydatów (priorytet + jednozdaniowe
  „dlaczego ten"), zapytaj `AskUserQuestion`, czekaj na jawną odpowiedź —
  konsekwencja: krok 1 workflow staje się STOP-bramką; żaden status ani praca
  nie rusza bez odpowiedzi, nawet gdy kandydat jest jeden.
- **B. Wybór samodzielny + informacja** — skill wybiera wg reguły priorytetu
  (oś 5) i tylko mówi „biorę zadanie X, bo Y" — konsekwencja: cykl startuje
  natychmiast, ale użytkownik traci punkt kontroli przed ustawieniem statusu
  „w toku" na zadaniu, które mógłby chcieć odłożyć.

**Rekomendacja:** brak sygnału repo, który by to wnioskował — pytanie pada
zawsze bez podświetlonej rekomendacji z fazy 0; w treści pytania warto
zasugerować A jako bezpieczniejszy wybór domyślny.

#### Oś (5) — pula statusów otwartych, priorytet, remisy

**Pytanie:** Które statusy trackera stanowią „pulę otwartą" do wyboru zadania,
i jaka reguła rozstrzyga priorytet oraz remisy?

**Opcje:**
- **A. Pula = wszystkie statusy poza zamykającymi i anulowanym** (np. `to do` +
  `backlog` + `on hold`), pobierane **jednym** wywołaniem bez filtra po
  statusie — konsekwencja: żadna zaparkowana pula nie jest trwale gubiona, ale
  filtrowanie „które są naprawdę otwarte" przechodzi na model.
- **B. Pula = wąski, jawnie wymieniony podzbiór** (np. tylko `to do` +
  `backlog`, bez statusów typu „wstrzymane") — konsekwencja: prostszy filtr,
  ale zadania zaparkowane na zależności nigdy nie wracają do rotacji
  automatycznie.

  Reguła priorytetu i remisu (ustalana niezależnie od A/B): kolejność
  priorytetów (np. urgent → high → normal → low) i reguła remisu — najstarsze
  zadanie pierwsze albo logika zależności.

**Rekomendacja:** brak automatycznego sygnału z repo — pytanie pada zawsze;
gdy tracker ma status typu „wstrzymane"/„on hold", zasugeruj A z jego
włączeniem (case referencyjny: `on hold` zgubione, gdy filtr obejmował tylko
`to do`/`backlog`).

#### Oś (6) — bramka blokerów i zależności

**Pytanie:** Jak traktować zależności/blokery zadania przed podjęciem pracy?

**Opcje:**
- **A. Twarda** — niedomknięty bloker (`waiting_on` inny niż
  `Closed`/`canceled`) → nie startujesz, bierzesz następnego kandydata —
  konsekwencja: workflow dostaje osobny numerowany krok „bramka zależności" z
  jawnym sprawdzeniem statusu blokera osobnym zapytaniem, nie z pola tekstowego.
- **B. Ostrzegawcza** — sprawdź i zgłoś, ale pozwól kontynuować za zgodą
  użytkownika — konsekwencja: krok istnieje, ale nie jest STOP-bramką; decyzję
  o kontynuacji podejmuje użytkownik, nie skill.
- **C. Brak** — tracker nie ma pola zależności albo projekt go nie używa —
  konsekwencja: krok „bramka zależności" nie występuje w ogóle w wygenerowanym
  workflow (reguła pisania #8 z `pattern-anatomy.md`: krok nieistotny nie
  pojawia się, numeracja pozostałych jest przeliczona).

**Rekomendacja:** faza 0 sprawdza, czy tracker ma pole zależności i czy jest
używane w istniejących zadaniach; brak pola/brak realnego użycia → C.

---

### Grupa 3 — statusy i domknięcie

#### Oś (7) — mapa statusów

**Pytanie:** Jakie role muszą mieć odpowiednik w statusach trackera: w toku, do
oceny, zamykający, anulowany?

**Opcje:**
- **A. Cztery odrębne role istnieją** (np. `in progress` / `review` / `Closed` /
  `canceled`) — konsekwencja: każdy krok workflow mapuje się wprost na
  dedykowany status.
- **B. Tracker ma mniej ról niż cztery** (np. bez osobnego statusu „do oceny" —
  ocena dzieje się w komentarzu, status zostaje `in progress`) — konsekwencja:
  krok „oddaj do oceny" opisuje inny sygnał (komentarz + brak zmiany statusu),
  nie zmianę statusu.
- **C. Nazwy nieznane z góry** — muszą być potwierdzone komendą trackera przed
  użyciem — konsekwencja: sekcja „Kontekst trackera" w wygenerowanym skillu
  zawiera komendę-źródło-prawdy do wylistowania statusów, nie wpisane na
  pamięć nazwy z wywiadu.

**Rekomendacja:** brak sygnału z fazy 0 dla tej osi — realne statusy trackera
są odpytywane dopiero **po** wywiadzie, przez kanał ustalony w osi 2, więc w
momencie zadawania tego pytania nie ma jeszcze danych, na których dałoby się
oprzeć podświetloną rekomendację. Pytanie pada **zawsze**, bez rekomendowanej
opcji. Literalne nazwy statusów **nie są ustalane tym pytaniem** (odpytuje je
kanał trackera, nie użytkownik w wywiadzie) — ta oś ustala tylko, które
**role** (A/B) mają swój status, żeby faza 3 wiedziała, ile kroków workflow
potrzebuje dedykowanej zmiany statusu.

**Obowiązkowo do odpytania, niezależnie od wybranej opcji: pełny zbiór statusów
zamykających wraz z ich typami.** Nie wystarczy nazwa statusu „zamkniętego" —
tracker może mieć kilka statusów kończących o różnych typach (np. ClickUp
rozróżnia typ `done` i `closed`, a listowanie „otwartych zadań" potrafi odsiać
tylko jeden z nich). Ten zbiór wypełnia marker `{{STATUSY_ZAMYKAJACE}}` w obu
szablonach i jest podstawą odsiewu puli w kroku wyboru zadania. Komenda
odpytująca **musi być odczytowa** — cheatsheet trackera wskazuje właściwą.

#### Oś (8) — akceptacja użytkownika przed zamknięciem

**Pytanie:** Czy zakończenie zadania wymaga jawnej akceptacji użytkownika, czy
skill może zamknąć zadanie samodzielnie po zielonej weryfikacji?

**Opcje:**
- **A. Wymagana jawna akceptacja** — status „do oceny" trzyma się, aż
  użytkownik potwierdzi; poprawki wracają do tego samego kroku i cyklu —
  konsekwencja: workflow dostaje STOP-bramkę „oddaj do oceny" z pętlą poprawek
  przed krokiem zamknięcia.
- **B. Brak wymogu** — automatyczne zamknięcie po przejściu bramy jakości
  (oś 12) — konsekwencja: nie ma kroku oczekiwania na ocenę; ryzyko zamknięcia
  czegoś, co nie spełnia oczekiwań, bez punktu kontroli człowieka.

**Rekomendacja:** brak sygnału repo — domyślnie rekomenduj A (obie
implementacje referencyjne mają STOP przed zamknięciem), ale pytanie pada
zawsze.

#### Oś (9) — oznaczenie wykonania i zawartość komentarza

**Pytanie:** Jak oznaczyć wykonane zadanie, i co musi się znaleźć w
komentarzu-podsumowaniu?

**Opcje:**
- **A. Zmiana statusu + komentarz obowiązkowy** z: wykonaną pracą, zmienionymi
  plikami, wynikiem weryfikacji, dowodem „na żywo" (jeśli oś 13 go wymaga),
  odstępstwami od DoD — konsekwencja: komentarz staje się jedynym trwałym
  zapisem decyzji; treść zawsze przez plik (np. `--message-file`), nigdy
  inline (quoting w shellu rozwala markdown).
- **B. Sama zmiana statusu, komentarz opcjonalny** — konsekwencja: szybciej,
  ale brak trwałego uzasadnienia przy późniejszym audycie; krok
  „komentarz-podsumowanie" nie jest wymagany w wygenerowanym workflow.

**Rekomendacja:** brak sygnału z fazy 0, który różnicowałby A/B — w momencie
zadawania Grupy 3 (jedno wywołanie `AskUserQuestion` na osie 7–10) odpowiedzi
na oś 8 i oś 13 jeszcze nie istnieją, więc rekomendacja nie może na nich
polegać na żywo. Domyślnie podświetl **A** (trwały zapis decyzji jest
bezpieczniejszy niż jego brak); pytanie i tak pada zawsze, do potwierdzenia.
Dokładna treść wymaganych pól komentarza — czy musi zawierać dowód „na żywo"
(oś 13) — jest dopisywana **w fazie 3**, gdy wszystkie odpowiedzi z Grupy 3 i 4
już są znane; to synteza przy generowaniu, nie rekomendacja pokazana w
wywiadzie.

#### Oś (10) — kolejność domknięcia

**Pytanie:** W jakiej kolejności następują komentarz / commit / zmiana statusu
/ push / dowód wdrożenia?

**Opcje:**
- **A. Komentarz → commit → status zamykający → push** (commit i push są
  krokami domknięcia) — konsekwencja: zamknięcie w trackerze następuje
  **przed** pushem; push jest osobnym wymaganym krokiem po zamknięciu.
- **B. Commit → dowód z produkcji → komentarz → status zamykający**, push
  wcześniej i tylko na wyraźną prośbę (push = deploy) — konsekwencja: status
  zamykający jest **najpóźniejszym** krokiem, warunkowanym dowodem
  produkcyjnym; push nie jest zsynchronizowany z zamknięciem w ogóle.
- **C. Inna kolejność ustalona z użytkownikiem** — konsekwencja: wypisz ją
  explicite jako numerowaną listę w wygenerowanym workflow — nie ma domyślnego
  wzorca referencyjnego do skopiowania.

**Rekomendacja z fazy 0:** ten sam surowy sygnał, który w Grupie 4 i 5 daje
rekomendacje dla osi 13 i 14, jest dostępny już tutaj — nie trzeba (i nie
można: Grupa 4/5 jeszcze nie padły) odwoływać się do ich odpowiedzi. Workflow w
`.github/workflows/` deployujący na push do głównej gałęzi → **B** (push =
deploy, więc naturalna kolejność to dowód produkcyjny przed zamknięciem, a push
jest ograniczony). Brak takiego workflow → **A**. Niezależnie od wyboru:
**komentarz zawsze przed zamknięciem statusu**, **commit zawsze przed
zamknięciem statusu** — nie zamykasz zadania z niezacommitowaną pracą.

---

### Grupa 4 — definicja ukończenia

#### Oś (11) — warstwy obowiązkowe w jednym zadaniu

**Pytanie:** Jakie warstwy muszą być zrobione w ramach **jednego** zadania, by
uznać je za kompletne — bez odkładania na przyszłe zadania?

**Opcje:**
- **A. Warstwy stałe, wypisane z góry** (np. dokumentacja + logika/silnik + UI)
  — konsekwencja: sekcja „Definicja ukończenia" ma stałą listę N punktów, z
  nakazem uzasadnienia, gdy któryś **faktycznie** nie dotyczy danego zadania.
- **B. DoD czytany z opisu zadania w trackerze**, bez stałej listy z góry —
  konsekwencja: bramką jest „DoD z taska"; brak DoD w tasku wymaga propozycji
  od skilla, zatwierdzenia przez użytkownika i dopisania do opisu zadania
  przed startem pracy.
- **C. Kombinacja** — stałe warstwy globalne (np. „zawsze test") + DoD z taska
  dla reszty zakresu — konsekwencja: sekcja definicji ukończenia ma dwie
  części; obie muszą być spełnione niezależnie.

**Rekomendacja z fazy 0:** `CLAUDE.md`/`AGENTS.md` wspomina TDD lub obowiązkowe
testy → warstwa „test" obowiązkowa (kandydat do A/C). Katalog `docs/` z
numerowanymi plikami źródła prawdy → warstwa „dokumentacja" obowiązkowa
(kandydat do A/C). Brak takich sygnałów, a istniejące taski mają sekcję DoD w
opisie → rekomenduj B.

#### Oś (12) — brama jakości

**Pytanie:** Jakie konkretne komendy stanowią bramę jakości przed oddaniem
zadania do oceny?

**Opcje:**
- **A. Skrypt zbiorczy** (np. `composer ci`, `npm run ci`) wykonujący
  lint+typecheck+test+build jedną komendą — konsekwencja: workflow cytuje
  **jedną** komendę jako bramę, z adnotacją, co wchodzi w jej skład (żeby nie
  było niejasności, czy węższy skrypt, np. `composer test`, to już brama).
- **B. Zestaw kilku odrębnych komend** (np. `test` + `typecheck` + `build`) —
  konsekwencja: workflow wylicza wszystkie komendy jawnie w kolejności; każda
  musi zwrócić sukces, żadna nie jest opcjonalna.
- **C. Brak zdefiniowanej bramy w manifestach** — użytkownik podaje ręcznie —
  konsekwencja: skill dopytuje wprost o polecenia i zapisuje je jako stałą w
  sekcji „Kontekst trackera"/„Definicja ukończenia", bez zgadywania nazw
  skryptów.

**Rekomendacja z fazy 0:** skrypt `ci` w `composer.json` → A z `composer ci`.
`test` + `typecheck` + `build` w `package.json` → B z tymi trzema komendami.
Gdy oba manifesty istnieją i się rozjeżdżają → dopytaj, które środowisko
(backend/frontend) dotyczy tego repo, albo połącz obie bramy.

#### Oś (13) — dowód „na żywo"

**Pytanie:** Czy zamknięcie zadania wymaga dowodu „na żywo" (produkcja,
staging), czy zielone testy lokalne wystarczają?

**Opcje:**
- **A. Wymagany dowód na żywo** — zadanie zostaje w statusie „do oceny", aż
  efekt jest potwierdzony tam, gdzie żyje (`curl` na publicznym URL, odczyt po
  zapisie przez MCP, workflow deploy z `conclusion: success`), nie tylko w
  repo — konsekwencja: workflow dostaje osobną STOP-bramkę „weryfikacja na
  produkcji" z tabelą „co zadanie zmienia → jaki dowód", niezależną od bramy
  jakości (oś 12).
- **B. Zielone testy/build lokalnie wystarczają** — konsekwencja: brama
  jakości (oś 12) jest jednocześnie ostatnim warunkiem zamknięcia; nie ma
  osobnego kroku weryfikacji produkcyjnej.

**Rekomendacja z fazy 0:** workflow w `.github/workflows/` deployujący na push
do głównej gałęzi → sygnał, że coś w projekcie **żyje** na produkcji, więc
rekomenduj A. Brak takiego workflow i brak środowiska produkcyjnego/stagingowego
→ B.

---

### Grupa 5 — git, dokumentacja i metodyka pracy

#### Oś (14) — commit, push, konwencja wiadomości

**Pytanie:** Kiedy skill ma commitować, czy push jest wymagany / na wyraźną
prośbę / zakazany, i jaka jest konwencja wiadomości commita (język, format,
obecność ID zadania)?

**Opcje:**
- **A. Commit po akceptacji użytkownika; push tylko na wyraźną prośbę**
  (push = deploy) — konsekwencja: sekcja Git ostrzega wprost, że push
  uruchamia wdrożenie, i zabrania pushowania „przy okazji"; zadanie może zostać
  zamknięte w trackerze bez pusha.
- **B. Commit i push wymagane** jako kroki domknięcia zadania — konsekwencja:
  push staje się numerowanym, wymaganym krokiem workflow, z regułą
  synchronizacji przed pushem (`git pull --rebase` lub push bez `--force`,
  nigdy `--force`).
- **C. Commit lokalny, push nie dotyczy** (brak remote) — konsekwencja: sekcja
  Git nie wspomina pusha w ogóle; workflow kończy się na commicie.

  Konwencja wiadomości commita (ustalana niezależnie od A/B/C): język (PL/EN),
  format `typ(zakres): opis`, obecność ID zadania w nawiasie.

**Rekomendacja z fazy 0:** workflow w `.github/workflows/` deployujący na push
do głównej gałęzi → A. Brak remote w `git remote -v` → C. Historia commitów
(`git log`) pokazująca już używany format/język → przyjmij go jako
rekomendację konwencji wiadomości.

#### Oś (15) — sesje równoległe i pre-flight fetch

**Pytanie:** Czy użytkownik pracuje w kilku sesjach na tym samym repo, i czy
skill ma wykonywać pre-flight `git fetch` z porównaniem do upstream przed
wyborem zadania?

**Opcje:**
- **A. Tak, kilka sesji równolegle** — dodaj krok 0 (pre-flight): `git fetch` +
  `git status -sb` / `git rev-list --left-right --count @{u}...HEAD`; przy
  „behind" zatrzymaj się i zapytaj, nigdy automatyczny `pull --rebase` —
  konsekwencja: workflow dostaje dodatkowy krok 0 przed wyborem zadania, a
  sekcja Git dostaje ostrzeżenie „nigdy `git add -A`/`reset`/`checkout` w
  środku pracy" (working tree jest współdzielony między sesjami).
- **B. Nie, jedna sesja na repo naraz** — konsekwencja: krok pre-flight nie
  występuje w ogóle; sekcja Git jest krótsza, bez ostrzeżeń o współdzielonym
  working tree.

**Rekomendacja:** brak automatycznego sygnału z repo (to fakt o sposobie pracy
użytkownika, nie o kodzie) — pytanie pada zawsze. Wiele niedawnych commitów w
krótkich odstępach od tego samego autora jest słabym sygnałem wielosesyjności,
ale nie zastępuje pytania.

#### Oś (16) — specka/plan i sprzątanie

**Pytanie:** Czy specka i plan implementacyjny idą do `docs/`, czy plan
zostaje w czacie — i czy sprzątanie po sobie jest wymaganym krokiem
domknięcia?

**Opcje:**
- **A. Specka + plan do `docs/`** (dwa pliki) — konsekwencja: workflow
  dostaje kroki „specka" i „plan wdrożenia" jako osobne, poprzedzające
  wykonanie. Katalogi (`{{KATALOG_SPECEK}}`, `{{KATALOG_PLANOW}}`): istniejące
  w repo, a gdy ich nie ma — `docs/superpowers/specs/` i
  `docs/superpowers/plans/` przy oś 17 = A, w pozostałych wariantach
  `docs/specs/` i `docs/plans/`.
- **B. Plan zostaje w czacie**; kod i testy są dokumentacją; osobna specka/plan
  do `docs/` jest **zakazana** — konsekwencja: workflow nie ma kroków
  „specka"/„plan wdrożenia", tylko STOP-bramkę „ustalenia z użytkownikiem" z
  planem w wiadomości czatu.

  Sprzątanie po sobie (ustalane niezależnie od A/B): domyślnie zawsze wymagany
  krok końcowy — zatrzymanie procesów w tle uruchomionych przez skill,
  usunięcie plików tymczasowych z weryfikacji, bez ubijania procesów, które
  już działały przed sesją.

**Rekomendacja z fazy 0:** istniejące katalogi specek i planów w repo
(`docs/superpowers/specs/` + `plans/` albo `docs/specs/` + `docs/plans/`) → A.
Brak takich katalogów → B.

#### Oś (17) — metodyka pracy (skille procesowe)

**Pytanie:** Na jakich skillach procesowych ma się opierać wykonanie zadania
— specka, plan, TDD i weryfikacja przed zamknięciem?

**Opcje:**
- **A. Superpowers** (plugin `superpowers`) — konsekwencja: kroki workflow
  wołają wprost `superpowers:brainstorming` (specka), `superpowers:writing-plans`
  (plan), `superpowers:test-driven-development` (wykonanie) i
  `superpowers:verification-before-completion` (weryfikacja). Wygenerowany
  skill **zależy od tego pluginu** — powiedzieć to w szkicu fazy 2.
- **B. Bez zewnętrznych skilli** — konsekwencja: te same etapy opisane wprost
  w treści kroków (co ma zawierać specka i plan, cykl RED → GREEN → REFACTOR,
  „uruchom i pokaż wynik, zanim powiesz, że działa"), bez odwołań do
  jakiegokolwiek pluginu. Skill działa na każdej instalacji Claude Code.
- **C. Własny workflow** — użytkownik podaje, czym realizuje każdy z czterech
  etapów: specka, plan, wykonanie, weryfikacja. Dla każdego etapu: nazwa
  **własnego skilla** (projektowego, użytkownikowego albo z innego pluginu),
  krótki opis własnej procedury, albo „brak" — wtedy etap nie wnosi do kroku
  nic ponad ogólną treść. Konsekwencja: podstawienia `{{WLASNY_KROK_SPECKI}}`,
  `{{WLASNY_KROK_PLANU}}`, `{{WLASNY_KROK_WYKONANIA}}`,
  `{{WLASNY_KROK_WERYFIKACJI}}`. **Każdą podaną nazwę skilla sprawdzić**
  (`.claude/skills/`, `~/.claude/skills/`, lista skilli w sesji) i nieistniejącą
  zgłosić przed szkicem — skill wołający nieistniejący skill jest gorszy niż
  opis procedury.

**Rekomendacja z fazy 0:** skille `superpowers:*` na liście skilli dostępnych w
sesji → A. Brak → B. Opcja C nigdy nie jest rekomendowana automatycznie —
wybiera ją użytkownik, gdy ma własny proces.

---

## Reguły wnioskowania domyślnych (faza 0 → rekomendacje)

Tabela „sygnał w repo → rekomendowana opcja → oś" — to, co faza 0 ustala samodzielnie
i pokazuje w tabeli „co ustaliłem sam" przed wywiadem:

| Sygnał | Rekomendacja | Oś |
|---|---|---|
| workflow w `.github/workflows/` deployujący na push do głównej gałęzi | „push tylko na wyraźną prośbę, push = deploy" | 14 |
| workflow w `.github/workflows/` deployujący na push do głównej gałęzi | **B** (commit → dowód z produkcji → komentarz → status zamykający; push wcześniej i tylko na prośbę). Brak takiego workflow → **A** | 10 |
| workflow w `.github/workflows/` deployujący na push do głównej gałęzi (sygnał, że coś w projekcie **żyje** na produkcji) | **A** — dowód „na żywo" wymagany. Brak takiego workflow i brak środowiska produkcyjnego/stagingowego → **B** | 13 |
| istniejące katalogi specek i planów (`docs/superpowers/specs/` + `plans/` albo `docs/specs/` + `docs/plans/`) | „specka + plan do `docs/`" | 16 |
| skille `superpowers:*` na liście skilli dostępnych w sesji | **A** (superpowers); brak → **B** (bez zewnętrznych skilli) | 17 |
| skrypt `ci` w `composer.json` | brama jakości = `composer ci` | 12 |
| `test` + `typecheck` + `build` w `package.json` | brama = te trzy komendy | 12 |
| `command -v cup gh jira` i lista narzędzi MCP | `cup` w PATH → **A** (ClickUp); `gh` obecny, brak innych CLI trackera → **B** (GitHub Issues); nic z powyższego, ale w repo istnieje plik typu backlog/TODO → **D** (plik w repo); brak jakiegokolwiek sygnału → zadaj pytanie bez podświetlonej rekomendacji | 1 |
| `cup` w PATH, brak narzędzi `mcp__*ClickUp*` | kanał = CLI `cup` | 2 |
| dostępne narzędzia MCP trackera i brak CLI | kanał = MCP | 2 |
| oba dostępne | „wykrywaj na starcie, użyj tego co działa" | 2 |
| `CLAUDE.md` wspomina TDD lub obowiązkowe testy | warstwa „test" obowiązkowa w osi 11 | 11 |
| katalog `docs/` z numerowanymi plikami źródła prawdy | warstwa „dokumentacja" obowiązkowa | 11 |
| customowy serwer MCP projektu w liście narzędzi | dopytaj wprost, czy zapisuje do produkcji | 3 |
| brak remote w `git remote -v` | oś 14 = „commit lokalnie, push nie dotyczy" | 14 |
| tracker nie ma pola zależności albo pole nie jest realnie używane w istniejących zadaniach | bramka blokerów = **C** („brak" — krok bramki zależności nie występuje w wygenerowanym workflow) | 6 |

---

## Test kompletności siatki

Tabela niżej wymienia **dziesięć** osi, na których dwa projekty referencyjne
(patrz `references/pattern-anatomy.md`) rozjeżdżały się w praktyce — każda ma
tu swoje pytanie. Dodanie nowej osi różnicującej wymaga dodania odpowiadającego
pytania do jednej z pięciu grup wyżej.

| Oś różnicująca | Wariant projekt-restauracje | Wariant projekt-gra | Pytanie w tym pliku |
|---|---|---|---|
| Potwierdzanie wyboru zadania | STOP-bramka, 2–3 kandydaci, `AskUserQuestion` | wybiera sam, tylko informuje | Oś (4) |
| Pula statusów otwartych | `to do` + `backlog` + `on hold` | `to do` / `backlog` / `in progress` | Oś (5) |
| Bramka zależności | twarda (`waiting_on`) | brak | Oś (6) |
| Specka i plan w `docs/` | zakazane — plan zostaje w czacie | wymagane, dwa pliki | Oś (16) |
| Definicja ukończenia | DoD z taska + dowód na produkcji | trzy warstwy: docs + silnik + UI | Oś (11) (warstwy) i Oś (13) (dowód) |
| Polityka pusha | tylko na wyraźną prośbę (push = deploy) | wymagany krok domknięcia | Oś (14) |
| Wiadomość commita | angielski, `typ(zakres): opis` | polski, `typ(zakres): opis (idZadania)` | Oś (14) (konwencja wiadomości) |
| Kolejność domknięcia | commit → dowód prod → komentarz → status | komentarz → commit → status → push | Oś (10) |
| Pre-flight git | brak | krok 0: `fetch` + porównanie z upstream | Oś (15) |
| Kanał trackera | tylko CLI `cup` (MCP martwy) | wykrywany: CLI albo MCP | Oś (2) |

Wszystkie dziesięć wierszy mapują się na istniejące osie 2, 4, 5, 6, 10, 11,
13, 14, 15, 16. Osie 1, 3, 7, 8, 9 i 12 nie
pochodzą z tej tabeli (dotyczą wyboru trackera, zasobów,
mapy statusów, akceptacji, treści komentarza i bramy jakości — kwestii, które
w obu projektach referencyjnych są zgodne albo są faktami do ustalenia, nie
osiami rozjazdu), ale są potrzebne do złożenia kompletnego, samowystarczalnego
skilla wg `pattern-anatomy.md`. Oś 17 (metodyka pracy) też nie pochodzi z tej
tabeli — oba projekty referencyjne używały superpowers; oś istnieje, żeby
wygenerowany skill nie zależał od pluginu, którego użytkownik nie ma.
