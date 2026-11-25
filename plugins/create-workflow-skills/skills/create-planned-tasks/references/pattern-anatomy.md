# Anatomia wzorca `planned-tasks`

Ten plik czyta model w **fazie 3** `/create-planned-tasks` razem z
`template-planned-tasks.md`. Opisuje kontrakt wygenerowanego skilla przeglądu
zadań. Wzorzec pochodzi z działającego skilla w jednym projekcie (dalej
„projekt-gra", dane zanonimizowane): `SKILL.md` z dwoma krokami i skrypt
Pythona czytający API trackera.

## Sekcje (5)

| # | Sekcja | Warunkowa | Osie (`interview.md`) |
|---|---|---|---|
| 1 | Frontmatter z triggerami | nie | język projektu |
| 2 | Przegląd | nie | 1, 3, 4 |
| 3 | Kontekst trackera | nie | 1–4, 9 + odpytanie |
| 4 | Workflow | nie | 4, 9, 10 |
| 5 | Częste błędy | nie | 1, 2, 9 + pułapki P1–P10 |

**1. Frontmatter.** `name: planned-tasks`; `description` po angielsku, z
`/planned-tasks` i frazami w języku projektu, kończy się zdaniem o tym, że
skill tylko czyta. Gdy projekt ma `next-task` — dopisek, że wybór zadania to
`next-task`.

> Źródło (projekt-gra, przetłumaczony trigger):
> `description: Use when the user asks what tasks are planned or open — "jakie mamy zaplanowane zadania", "co jest na liście", "co zostało do zrobienia" — shows open tasks by priority, with dates and subtasks. Read-only; picking and starting a task is next-task.`

**2. Przegląd.** Dwa–trzy zdania: z jakiego zakresu, co pokazuje, że niczego
nie zmienia w trackerze. Przy sekcjach wydzielonych — ich nazwy.

**3. Kontekst trackera.** Jedno źródło prawdy dla wykonującego:

- system i kanał (skrypt / komendy CLI / narzędzia MCP),
- zakres z identyfikatorami i nazwami,
- skąd uwierzytelnienie (miejsce, nie wartość),
- statusy uznawane za zamknięte — **po typie/stanie**, z nazwami,
- gdy skrypt: co robi, w punktach (jak w źródle: „bierze wszystkie listy
  folderu na bieżąco", „odsiewa zamknięte po typie statusu", „podzadanie
  stoi pod rodzicem z wcięciem"),
- zapis o braku kontroli krzyżowej, gdy użytkownik od niej odstąpił.

**4. Workflow.** Krok 1 — pobierz (blok `bash` z wywołaniem skryptu albo
komendami); krok 2 — przedstaw. „Przedstaw" mówi: wklej tabele bez zmian,
kolejność sekcji, komentarz wg osi 10, zawężanie na prośbę („tylko wysokie",
„co ma termin", „sam feedback") — wycinek z wyniku, bez ponownego
pobierania. W formie bez skryptu krok 1 ma podkroki z regułami pułapek
(stronicowanie, odsiew po typie, sieroty).

**5. Częste błędy.** Tabela `Błąd | Zamiast tego`, 4–6 wierszy. Zawsze:
„lista z pamięci przy błędzie sieci" → „powiedz wprost, nie zgaduj";
„szukanie tokenu poza ustalonym miejscem" → „podpowiedź logowania z
Kontekstu". Do tego 2–3 pułapki tego systemu (z P1–P10), opisane bez
identyfikatora.

## Zasady pisania

1. Wygenerowany skill jest krótki — źródło miało ok. 50 linii. Szczegóły
   działania są w skrypcie, nie w `SKILL.md`.
2. Tylko odczyt — żaden krok nie zmienia statusu, nie komentuje, nie tworzy.
3. Nie odsyłać do `references/` pluginu ani do numerów osi i pułapek.
4. Liczby i nazwy z trackera wpisane wprost (id, statusy), nie „Twoja lista".
5. Język ciała = język dokumentacji projektu.

## Zgodność z walidatorem

`${CLAUDE_PLUGIN_ROOT}/scripts/validate-generated.js` dla katalogu
`planned-tasks` sprawdza:

| Sprawdzenie | Wynik |
|---|---|
| `name` = `planned-tasks`, `description` zawiera `/planned-tasks` | błąd |
| nagłówki: przegląd (`overview`/`przegląd`), kontekst (`kontekst`/`context`/`stałe`/`constants`), workflow (`workflow`/`przepływ`), częste błędy (`częste błędy`/`common mistakes`/`pitfalls`) | błąd przy braku |
| markery `{{` (wielka litera, `#`, `/`), `TBD`, `FIXME`, `NOTKA`/`SKŁADAJĄCEGO`, „oś N" — **tylko w `SKILL.md`** | błąd |
| skrypt wskazany w bloku `bash` ścieżką `.claude/skills/planned-tasks/<plik>` istnieje obok `SKILL.md` | błąd przy braku |
| składnia skryptu (`.js/.cjs/.mjs`, `.py`, `.php`, `.sh/.bash`) | błąd; inny język — ostrzeżenie |
| `PUT`/`PATCH`/`DELETE`/`POST` w skrypcie | ostrzeżenie (odczyt POST potwierdzić) |
| literał tokenu (ClickUp `pk_`, GitHub `ghp_`/`github_pat_`, Linear, Slack, `Bearer …`) w skrypcie albo w `SKILL.md` | błąd |

Blok `bash` wywołujący skrypt musi zawierać ścieżkę
`.claude/skills/planned-tasks/<plik>` — inaczej walidator nie znajdzie
skryptu i nie sprawdzi go wcale.
