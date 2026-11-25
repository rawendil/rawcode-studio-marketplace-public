---
name: create-planned-tasks
description: This skill should be used when the user asks to "create planned-tasks skill", "wygeneruj przegląd zadań", "skill z listą zaplanowanych zadań", "pokaż zadania jako skill", "create-planned-tasks", or wants a project-tailored read-only /planned-tasks overview of open tasks. Probes where the project keeps its tasks (any tracker, API, MCP or file), interviews the user about the overview's shape, then writes the skill (and, if chosen, a script written from scratch) into .claude/skills/planned-tasks/.
---

# Generator skilla przeglądu zadań

Skill sonduje projekt, ustala, **gdzie i jak** przechowywane są zadania,
przeprowadza wywiad o formie przeglądu i zapisuje dopasowany skill
`.claude/skills/planned-tasks/SKILL.md` — przegląd otwartych zadań **tylko do
odczytu**. Gdy w wywiadzie pobieranie to skrypt, zapisuje obok skrypt
napisany **od zera** dla systemu zadań tego projektu.

System zadań może być dowolny: tracker z API albo CLI, serwer MCP, plik w
repo, własne API, arkusz. Generator nie zakłada żadnego z nich — rozpoznaje
go z danych.

Wygenerowany skill jest samowystarczalny i działa po wyłączeniu pluginu.

Prompt użytkownika: **$ARGUMENTS** (opcjonalny — np. nazwa systemu albo
listy).

Przebieg: sześć faz po kolei. **Fazy 2 i 5 są STOP-bramkami**, faza 4 ma
bramkę kontroli krzyżowej. Utworzyć TODO na każdą fazę.

## Faza 0 — sondowanie (bez pytań)

| Co czytać | Po co |
|---|---|
| `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/` | **język dokumentacji** (= język skilla), wzmianki o trackerze, listach, backlogu |
| `.claude/skills/` **oraz** `~/.claude/skills/` | czy jest `planned-tasks` (kolizja); czy jest `next-task`/`add-task` — z ich sekcji „Kontekst trackera" odczytać system, kanał, identyfikatory i pułapki → rekomendacje osi 1–3 |
| `description` każdego skilla z obu katalogów | **przegląd zadań pod inną nazwą** (ten sam cel, podobne frazy) — to kolizja jak przy tej samej nazwie: dwa skille na jedno pytanie to błąd |
| `command -v cup gh jira linear glab` + lista narzędzi MCP w sesji | dostępne kanały (oś 1–2, 9) |
| pliki `TODO.md`, `ROADMAP.md`, `docs/backlog.md`, `*.todo` | tracker w repo (oś 1 = plik) |
| `node`, `python3`, `php`, `bash` w PATH + manifesty projektu | język skryptu — ten, którego projekt już używa (oś 9) |
| konfiguracje CLI (`gh auth status`, plik konfiguracji `cup`), `.env.example` | skąd skrypt weźmie dostęp, bez wpisywania sekretu (oś 2) |
| `git check-ignore -v .claude/skills/planned-tasks` | czy wynik trafi do repo — powiedzieć **przed** zapisem |
| **struktura systemu zadań, odpytana komendą odczytową** | miejsca w zakresie, statusy **z typami**, priorytety, podzadania, terminy, osoby, etykiety |

Odpytanie struktury: przez kanał z najlepszym sygnałem, wg cheatsheetu
`${CLAUDE_PLUGIN_ROOT}/skills/create-workflow-skills/references/tracker-clickup.md`
albo `…/tracker-github.md` (sekcje „Odczyt przeglądowy" i „Pułapki").
Cheatsheet to **hipoteza** — wywołać komendę dokładnie w tej postaci, w jakiej
trafi do wyniku, i wpisać rozjazd do tabeli. **Komend zapisujących nie
uruchamiać nigdy**, także „żeby sprawdzić".

**Nieznany system** (żaden kanał, żaden plik, albo system bez cheatsheetu):
nie zgadywać. Przeczytać
`${CLAUDE_PLUGIN_ROOT}/skills/create-planned-tasks/references/tracker-unknown.md`
i przejść jego kroki (pytanie otwarte, dokumentacja, jedno wywołanie
odczytowe) **przed** wywiadem.

Fazę zamyka tabela **„co ustaliłem sam"**: `Sygnał | Skąd (plik/komenda) |
Wniosek | Oś`, z każdą wywołaną komendą i tym, co faktycznie zwróciła.
Każdy wniosek trafia do wywiadu jako **rekomendacja**, nie ustalenie.

## Faza 1 — wywiad: 10 osi w 3 grupach

Siatka: **`${CLAUDE_PLUGIN_ROOT}/skills/create-planned-tasks/references/interview.md`**
— przeczytać **przed** pierwszym pytaniem.

- Trzy wywołania `AskUserQuestion`: grupa 1 = osie 1–3 (źródło), grupa 2 =
  osie 4–7 (co i jak pokazać), grupa 3 = osie 8–10 (forma).
- Rekomendacja pierwsza, tylko z fazy 0 i grup wcześniejszych.
- Oś bez sensu dla tego systemu (np. podzadania, gdy system ich nie ma) —
  pominąć i zapisać w tabeli decyzji z powodem.
- **Identyfikatory nie są pytaniem** — odpytane komendą i pokazane.
- Gdy oś 1 = „inny system", a faza 0 go nie rozpoznała — najpierw
  `tracker-unknown.md`, dopiero potem grupy 2–3.

## Faza 2 — STOP: szkic do akceptacji

Bez zapisu na dysk przedstawić:

1. **Tabelę decyzji** — `Oś | Decyzja | Skutek dla skilla`, wszystkie 10
   (pominięte z powodem).
2. **Przykładową tabelę przeglądu** — 3–6 **prawdziwych** otwartych zadań z
   systemu w docelowym układzie (grupowanie, kolejność, kolumny, podzadania).
   Użytkownik ocenia to, co zobaczy, nie opis.
3. **Nagłówki sekcji** skilla i, przy formie „skrypt", nazwę i język skryptu
   z jednym zdaniem o tym, co robi.
4. **Docelowe ścieżki**: `.claude/skills/planned-tasks/SKILL.md` (+ skrypt).
5. **Kolizje** z fazy 0.

**Kolizja — nigdy cicho.** Dla każdego kolidującego skilla (ta sama nazwa
albo ten sam cel) pokazać **pełną ścieżkę i zasięg** (skill projektu w
`.claude/skills/` albo skill użytkownika w `~/.claude/skills/`, działający we
wszystkich projektach), `name`, `description` i nagłówki sekcji, potem
`AskUserQuestion` z opcjami pasującymi do rodzaju kolizji:

| Kolizja | Opcje |
|---|---|
| ta sama nazwa (`planned-tasks` w projekcie) | **nadpisz** (`SKILL.md` i skrypt przepadają) · **zapisz obok** · **przerwij** |
| ten sam cel, skill projektu pod inną nazwą | **zastąp i usuń stary** (po zapisie nowego usunąć katalog starego) · **zostaw oba** (dwa skille na jedno pytanie — ostrzec) · **przerwij** |
| ten sam cel, skill użytkownika w `~/.claude/skills/` | **zostaw, nowy działa w tym projekcie** (ostrzec o dwóch skillach na jedno pytanie) · **przerwij** — skilla użytkownika **nigdy nie usuwać** |

**Zapisz obok:** nowy `SKILL.md.new`, a skrypt z sufiksem przed
rozszerzeniem (`zadania.new.cjs`), wywoływany z `SKILL.md.new` tą nazwą —
dotychczasowe pliki zostają nietknięte, scalenie po stronie użytkownika.

Poprawki → szkic od nowa. **Milczenie nie jest zgodą.**

## Faza 3 — generowanie

1. **Powtórzyć sondowanie** tuż przed zapisem: `ls .claude/skills/`, opisy
   skilli (kolizje po celu), `git check-ignore`, `CLAUDE.md`. Różnicę wobec
   fazy 0 pokazać i zapytać.
2. **`SKILL.md`** — złożyć z
   `${CLAUDE_PLUGIN_ROOT}/skills/create-planned-tasks/references/template-planned-tasks.md`
   wg `…/references/pattern-anatomy.md`: bloki warunkowe bez spełnionego
   warunku usunąć z treścią, żaden `{{` nie zostaje, notki dla składającego
   usunięte, nagłówki trafiają w synonimy walidatora, kroki przenumerowane.
3. **Skrypt** (oś 9 = skrypt) — napisać **od zera** wg
   `…/references/script-contract.md`. Przed zapisem przejść
   `…/references/pitfalls.md` **punkt po punkcie** i dla każdej pułapki
   P1–P10 zapisać w notatkach: jak skrypt ją obsługuje w tym systemie albo
   dlaczego nie dotyczy. Pułapka bez odpowiedzi = faza niedokończona.
4. **Pułapki do skilla** — 2–3 najgroźniejsze dla tego systemu i formy
   wpisać wprost do tabeli „Częste błędy" (bez identyfikatorów `P…`).
   W formie „komendy"/„MCP" — wszystkie dotyczące pułapki jako reguły kroku 1.
5. Język skilla i skryptu = język dokumentacji projektu; `description` po
   angielsku.

Wygenerowany skill **nie odsyła** do plików pluginu ani do numerów osi.

## Faza 4 — walidacja i kontrola krzyżowa

1. Walidator — na pliku **faktycznie zapisanym** w fazie 3 (przy „zapisz
   obok" `SKILL.md.new`; walidator rozpoznaje typ po katalogu, więc sufiks
   mu nie przeszkadza):

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/validate-generated.js" <ścieżka zapisanego SKILL.md>
   ```

   Kod ≠ 0 → naprawa i ponowienie. Ostrzeżenia zaraportować; ostrzeżenie o
   metodzie POST — potwierdzić, że to odczyt (komentarz w skrypcie).
2. **Uruchomienie na żywym systemie** — skrypt (albo komendy formy B/C)
   kończy się powodzeniem; błąd → naprawa.
3. **Kontrola krzyżowa** — **zbiór identyfikatorów** otwartych zadań z
   przeglądu (głównego i każdej sekcji wydzielonej) porównany z
   **niezależnym** odczytem: inna komenda CLI, inny endpoint, widok MCP,
   zapytanie z innym filtrem, dla pliku — zliczenie `grep`. Same liczby nie
   wystarczą, gdy oba źródła dają identyfikatory: jedno przepuszczone
   zamknięte i jedno zgubione otwarte dają zgodną liczbę. Niezależny odczyt
   nie może dzielić z przeglądem limitu ani filtra (ta sama komenda z tym
   samym `--limit` obetnie się tak samo). Przy podzadaniach ukrytych porównać
   zadania główne. Pokazać oba wyniki. Rozbieżność → wyjaśnić przyczynę i
   naprawić, nie zaokrąglać.
   - Brak drugiego źródła: wystarczy ten sam kanał z innym filtrem albo
     zliczenie z surowej odpowiedzi.
   - Gdy i to niemożliwe — `AskUserQuestion`, czy użytkownik świadomie
     odstępuje od kontroli. Zgoda → blok „bez kontroli krzyżowej" w sekcji
     „Kontekst trackera" i wzmianka w raporcie fazy 5. **Bez zgody faza 5
     się nie zaczyna.**

Pokazać rzeczywisty output walidatora i obu odczytów — dowód, nie deklaracja.

## Faza 5 — STOP: domknięcie

1. **Raport** — pełne ścieżki, forma pobierania, liczby z kontroli
   krzyżowej (albo informacja o odstąpieniu), które bloki warunkowe weszły.
2. **Instrukcja testu** — `/planned-tasks` w **nowej sesji** (skille
   projektowe wczytują się na starcie sesji).
3. **Pytanie o wyłączenie pluginu** (`AskUserQuestion`). Po zgodzie poprosić
   użytkownika o wpisanie:

   ```
   /plugin disable create-workflow-skills
   ```

   Nie edytować `settings.json` samodzielnie. Powiedzieć wprost, że wyłącza
   to **oba** generatory pluginu (`/create-workflow-skills` też), jest
   odwracalne (`/plugin enable create-workflow-skills`) i nie wpływa na
   wygenerowane skille.

## Zasady

1. **Pytania po polsku** — chyba że użytkownik pisze po angielsku.
2. **Tylko odczyt** systemu zadań przez cały przebieg — także w fazie 0 i 4.
3. **Żadnego sekretu** w rozmowie, skrypcie ani `SKILL.md` — token z
   konfiguracji CLI albo zmiennej środowiskowej.
4. **`${CLAUDE_PLUGIN_ROOT}`** w każdym odwołaniu do plików pluginu.
5. **Nie tworzyć pustych katalogów** — po „przerwij" nie zostaje nic.
6. **Nie zgadywać** identyfikatorów, statusów, pól ani endpointów.
7. **STOP znaczy stop.**

## Dodatkowe zasoby

- **`references/interview.md`** — 10 osi, opcje, skutki, rekomendacje; fazy 0–1.
- **`references/tracker-unknown.md`** — rozpoznanie nieznanego systemu i
  pliku jako trackera; faza 0.
- **`references/pattern-anatomy.md`** — sekcje skilla, zasady pisania,
  zgodność z walidatorem; faza 3.
- **`references/template-planned-tasks.md`** — szablon `SKILL.md`; faza 3.
- **`references/script-contract.md`** — kontrakt skryptu; faza 3.
- **`references/pitfalls.md`** — pułapki odczytu P1–P10; faza 3.
- **`${CLAUDE_PLUGIN_ROOT}/skills/create-workflow-skills/references/tracker-clickup.md`**,
  **`…/tracker-github.md`** — cheatsheety trackerów (sekcja „Odczyt
  przeglądowy").
