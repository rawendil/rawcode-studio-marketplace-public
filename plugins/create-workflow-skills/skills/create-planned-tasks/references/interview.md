# Wywiad — siatka pytań `/create-planned-tasks`

Ten plik czyta model w **fazach 0 i 1** `/create-planned-tasks`. 10 osi w 3
grupach — każda grupa to jedno wywołanie `AskUserQuestion` (najwyżej 4
pytania), podział **3-4-3**. Numeracja osi jest wiążąca dla
`template-planned-tasks.md` (`{{#JEŚLI oś N = wartość}}`) i
`pattern-anatomy.md`. **Nie przenumerowywać.** Numeracja nie trafia do
wygenerowanego skilla (walidator zgłasza „oś N" jako wyciek).

Zasady wspólne z `/create-workflow-skills`:

- **Rekomendacja idzie pierwsza** i jest odrzucalna. Opiera się **wyłącznie** na
  fazie 0 i osiach z **grup wcześniejszych** — odpowiedzi z tej samej grupy w
  chwili pytania jeszcze nie istnieją.
- Brak sygnału z fazy 0 → pytanie bez podświetlonej rekomendacji.
- **Identyfikatory nie są pytaniem**: id list/repo/projektów, nazwy statusów z
  typami, priorytety, etykiety — odpytane komendą odczytową i pokazane
  użytkownikowi.
- **Oś pomijana**, gdy faza 0 wykazała, że pytanie nie ma sensu (np. tracker
  bez podzadań — oś 7). Pominięta oś trafia do tabeli decyzji fazy 2 z
  uzasadnieniem, a grupa ma wtedy mniej pytań.

**Gdy projekt ma `next-task`/`add-task`** (faza 0): ich sekcja „Kontekst
trackera" daje rekomendację osi 1–2 i identyfikatory zakresu (oś 3). To
rekomendacja, nie ustalenie — użytkownik może chcieć przeglądu z szerszego
zakresu niż lista, z której `next-task` bierze zadania.

---

## Grupa 1 — źródło

### Oś (1) — system zadań

**Pytanie:** Gdzie są zadania, które przegląd ma pokazywać?

- **A. Tracker z CLI lub API** (ClickUp, GitHub Issues, Jira, Linear, GitLab…)
  — konsekwencja: sekcja „Kontekst trackera" z identyfikatorami i pułapkami
  tego systemu; cheatsheet z `create-workflow-skills/references/`, gdy jest.
- **B. Plik w repo** (`TODO.md`, `docs/backlog.md`, CSV) — konsekwencja:
  odczyt plikiem, stan zamknięcia z konwencji pliku (`tracker-unknown.md`,
  „Plik jako tracker").
- **C. Serwer MCP** (bez CLI i API dostępnych z powłoki) — konsekwencja:
  forma bez skryptu, kroki na narzędziach MCP sprawdzonych w sesji.
- **D. Inny system** — konsekwencja: rozpoznanie wg `tracker-unknown.md`
  przed dalszymi pytaniami.

**Rekomendacja:** tracker z `next-task`, gdy istnieje; inaczej `cup`/`gh`/
`jira`/`linear`/`glab` w PATH z konfiguracją → A z nazwą systemu w etykiecie;
plik backlogu w repo i brak CLI → B; tylko narzędzia MCP trackera → C. Brak
sygnału — bez rekomendacji.

### Oś (2) — dostęp i uwierzytelnienie

**Pytanie:** Skąd przegląd ma brać dostęp do zadań?

- **A. Konfiguracja istniejącego CLI** (np. token `cup`, `gh auth`) —
  konsekwencja: skrypt czyta token z pliku konfiguracji albo komendy CLI;
  brak → podpowiedź logowania tym CLI.
- **B. Zmienna środowiskowa** — konsekwencja: nazwa zmiennej w „Kontekście
  trackera"; skrypt kończy się błędem z podpowiedzią, gdy jej brak.
- **C. Samo CLI, bez API** — konsekwencja: skrypt (albo kroki) woła CLI;
  zakres przeglądu ograniczony do tego, co CLI zwraca.
- **D. Bez uwierzytelnienia** (plik w repo, publiczne API).

**Rekomendacja:** oś 1 = B → D. CLI trackera zalogowane i jego `--json` daje
pola potrzebne do przeglądu (rodzic, termin, stan) → C; nie daje (np. brak
`parent`) → A. Brak CLI → B.

### Oś (3) — zakres

**Pytanie:** Z jakiego zakresu przegląd ma zbierać zadania?

- **A. Jedno miejsce** (lista, repo, projekt, plik) — konsekwencja: jedno
  id w konfiguracji skryptu.
- **B. Cały kontener** (folder, organizacja, przestrzeń) — konsekwencja:
  skrypt pobiera listę miejsc przy każdym uruchomieniu; nowe miejsca
  dochodzą same; kolumna/dopisek z nazwą miejsca.
- **C. Wybrane miejsca** — konsekwencja: lista id w konfiguracji; nowe
  miejsca trzeba dopisać ręcznie.

**Rekomendacja:** kontener z więcej niż jednym aktywnym miejscem (faza 0
odpytała strukturę) → B; jedno miejsce → A. Pokazać nazwy miejsc, które
weszłyby do zakresu.

---

## Grupa 2 — co i jak pokazać

### Oś (4) — sekcje wydzielone

**Pytanie:** Czy część zadań ma być pokazana osobno, pod przeglądem głównym?

- **A. Nie** — jedna sekcja.
- **B. Wskazane miejsca osobno** (np. lista zgłoszeń od użytkowników, lista
  błędów) — konsekwencja: id miejsc i nagłówki sekcji w konfiguracji.
- **C. Wskazane etykiety/typy osobno** (np. `bug`, `feedback`) —
  konsekwencja: zadanie z etykietą idzie tylko do swojej sekcji.

**Rekomendacja:** oś 3 = B/C i w zakresie jest miejsce o nazwie wskazującej
inny rodzaj pracy (zgłoszenia, feedback, bugi, support) → B z tym miejscem.
Inaczej A.

### Oś (5) — grupowanie

**Pytanie:** Jak pogrupować zadania w przeglądzie?

- **A. Priorytet** (od najwyższego, „bez priorytetu" na końcu).
- **B. Status** (kolejność statusów z trackera, otwarte typy).
- **C. Termin** (po terminie → ten tydzień → później → bez terminu).
- **D. Miejsce** (lista, repo, projekt).
- **E. Bez grupowania** — jedna tabela, kolejność z osi 6.

Opcja, której dane systemu nie niosą, **odpada z pytania**: priorytet, gdy
żadne otwarte zadanie go nie ma; status, gdy system zna tylko otwarte/
zamknięte; termin, gdy nikt nie ustawia terminów; miejsce, gdy oś 3 = jedno
miejsce. E jest zawsze. Zostaje najwyżej 4 opcji (limit narzędzia) — przy
pięciu odpada ta z najmniejszym pokryciem w danych z fazy 0.

**Rekomendacja:** faza 0 widzi priorytety na większości otwartych zadań → A.
Większość ma terminy, priorytetów brak → C. Po odpadnięciu opcji zostaje tylko
E → oś **pomijana** z decyzją „bez grupowania" i powodem w tabeli fazy 2.
Inaczej bez rekomendacji.

### Oś (6) — kolejność w grupie

**Pytanie:** W jakiej kolejności zadania wewnątrz grupy?

- **A. Najbliższy termin, potem najstarsze.**
- **B. Najnowsze najpierw.**
- **C. Kolejność ręczna z trackera** (pozycja na liście, `orderindex`, rank)
  — tylko gdy system ją udostępnia.
- **D. Alfabetycznie.**

**Rekomendacja:** A.

### Oś (7) — podzadania

**Pytanie:** Jak pokazać podzadania?

- **A. Pod rodzicem z wcięciem** — konsekwencja: podzadanie zamkniętego albo
  niewidocznego rodzica pokazane samo, z dopiskiem (pułapka P5).
- **B. Płasko**, jak zwykłe zadania, z dopiskiem rodzica.
- **C. Ukryte** — konsekwencja: przegląd pokazuje tylko zadania główne;
  licznik mówi to wprost.

**Rekomendacja:** A. **Oś pomijana**, gdy system nie ma podzadań albo żadne
otwarte zadanie w zakresie nie ma rodzica ani dzieci (faza 0) — decyzja
„płasko" z powodem. Sprawdzić przy tym, czy podzadania w tym systemie są
zwykłymi zadaniami w odczycie (wtedy płasko nic nie gubi, np. sub-issues
GitHuba w `gh issue list`), czy wymagają osobnego odczytu (pułapka P4).

---

## Grupa 3 — forma

### Oś (8) — kolumny (wybór wielokrotny)

**Pytanie:** Jakie kolumny ma mieć tabela? (tytuł jest zawsze)

- **Identyfikator z linkiem**
- **Status**
- **Termin** (z „po terminie" dla przeterminowanych; start → termin, gdy jest
  data startu)
- **Osoba / tagi / miejsce** — jedna opcja, doprecyzowana w szkicu fazy 2

Kolumna, której dane system nie niesie albo która w zakresie ma jedną
wartość dla wszystkich (status przy samych `open`, termin bez terminów),
**odpada z pytania** — jak opcje osi 5.

**Rekomendacja:** identyfikator, status, termin — z tych, które zostały po
odsiewie; gdy zostaje sam identyfikator, dołączyć opcję z danymi (osoba,
etykiety). `AskUserQuestion` z `multiSelect: true`.

### Oś (9) — pobieranie danych

**Pytanie:** Jak skill ma pobierać zadania?

- **A. Skrypt w projekcie** — konsekwencja: plik obok `SKILL.md` pisany od
  zera wg `script-contract.md`; ten sam wynik przy każdym uruchomieniu; skill
  ma jeden krok pobrania.
- **B. Komendy CLI wprost w skillu** — konsekwencja: model wykonujący skill
  woła komendy i sam składa tabele; wolniej i za każdym razem trochę inaczej;
  pułapki wpisane do skilla jako reguły.
- **C. Narzędzia MCP** — konsekwencja: jak B, na narzędziach MCP sprawdzonych
  w sesji (nazwy i parametry z ich schematów, nie z pamięci).

**Rekomendacja:** A, gdy faza 0 znalazła interpreter projektu (manifest albo
skrypty w danym języku) i dostęp API/CLI; C, gdy oś 1 = C; B, gdy brak
interpretera. **Projekt bez kodu** (żadnego manifestu ani skryptów — np.
dokumentacja, kurs, notatki) → B, nawet gdy w PATH są `node`/`python3`:
skrypt w obcym dla projektu języku to kod, którego nikt tam nie utrzymuje.
Przy oś 1 = plik z kilkunastoma pozycjami B wystarcza zawsze.

### Oś (10) — komentarz pod tabelami

**Pytanie:** Czy model ma dopisywać coś od siebie pod przeglądem?

- **A. Nie** — same tabele.
- **B. 2–3 zdania, tylko gdy coś się wyróżnia** (po terminie, rozpoczęte i
  stojące, dużo zadań bez priorytetu) — bez streszczania pozycji.

**Rekomendacja:** B.
