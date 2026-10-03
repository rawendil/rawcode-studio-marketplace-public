# Cheatsheet: GitHub Issues (`gh`)

Ten plik konsultuje faza 0 (odpytanie identyfikatorów i statusów projektu) i
faza 3 (wstawienie komend i pułapek do sekcji „Kontekst trackera" oraz do tabeli
„Częste błędy" generowanego skilla) `/create-workflow-skills`. Komendy niżej zweryfikowano wywołaniami
`--help` CLI `gh` i (dla pól `--json`) walidacją nazw pól po stronie klienta —
nie są przepisane z dokumentacji na pamięć.

## Odpytanie

- `gh repo view --json nameWithOwner` — potwierdza, w którym repo (`owner/repo`)
  skill faktycznie działa; bez tego repo jest zgadywane z katalogu roboczego.
- `gh auth status` — potwierdza, że token jest aktywny i pod jakim kontem/hostem
  (wynik pokazuje też **scope** tokena — `read:project` scope jest wymagany do
  odczytu GitHub Projects v2, patrz sekcja „Pula otwarta").
- `gh label list` — listuje etykiety repo. Jeśli „status" workflow ma być
  realizowany etykietami (patrz „Statusy" niżej), to jest miejsce, żeby
  potwierdzić realne nazwy, nie zgadywać `status:in-progress` na pamięć.
- `gh issue list --limit 5` — szybki test dostępu: potwierdza, że token widzi
  issues repo, zanim zbuduje się na tym cały skill.

## Pula otwarta

```bash
gh issue list --state open --json number,title,labels,assignees,createdAt
```

`number`, `title`, `labels`, `assignees`, `createdAt` są prawdziwymi polami
`--json` (`gh issue list --json <cokolwiek-złego>` wypisuje pełną listę
dostępnych pól przy błędzie — tak to zweryfikowano). `--state open` jest
technicznie domyślne, ale wypisz je jawnie w generowanym skillu — czytelnik
skilla nie musi znać domyślnej wartości flagi.

Gdy projekt używa **GitHub Projects (v2)** jako warstwy statusów/planowania:

```bash
gh project list                                        # projekty zalogowanego tokena (domyślny --owner)
gh project item-list <number> --owner <owner> --format json
```

`gh project list` **nie wymaga** `--owner` — bez flagi zwraca projekty
zalogowanego tokena (potwierdzone przykładem z `gh project list --help`:
„# list the current user's projects" → `gh project list`, bez `--owner`).
Podaj `--owner <login>` tylko, gdy chcesz projekty innego użytkownika/
organizacji. `gh project item-list <numer-projektu>` **wymaga** `--owner` w
wywołaniu nieinteraktywnym — bez niego zwraca `owner is required when not
running interactively` (potwierdzone live) — i przyjmuje `--format json`
(jedyna obecnie wspierana wartość tej flagi). Obie komendy wymagają scope
**`read:project`** na tokenie (`gh auth refresh -s read:project`, jeśli `gh
auth status` go nie pokazuje — potwierdzone realnym błędem `gh project list`
bez tego scope: `error: your authentication token is missing required scopes
[read:project]`).

## Statusy

GitHub Issues ma **tylko dwa** stany: `open` / `closed` — nie ma natywnego
pola „w toku" / „do oceny" / „zablokowane". „Status" w sensie workflow musi
więc być zrealizowany **jednym z dwóch mechanizmów, wybranym jawnie**, nie
domyślnie:

1. **Etykietami** (np. `status:in-progress`, `status:review`) — prostsze,
   działa z samym `gh issue`, ale etykiety nie mają wbudowanej kolejności ani
   wzajemnej wyłączności (nic nie stoi na przeszkodzie, by issue miało dwie
   sprzeczne etykiety `status:*` naraz — trzeba to pilnować ręcznie w skillu).
2. **Polem `Status` w GitHub Projects (v2)** — ma kolejność i jest
   jednowartościowe, ale żyje w innym API niż samo Issues i wymaga scope
   **`read:project`** na tokenie, żeby je odczytać. `projectItems` jest
   **realnym polem `--json`** zarówno dla `gh issue list`, jak i `gh issue
   view` (potwierdzone: `gh issue view <n> --json bogusfield` wypisuje
   `projectItems` na liście dostępnych pól) — więc powiązanie issue z
   Projects jest wprost widoczne przez `gh issue *`, nie tylko przez
   `gh project item-list`. Czego **nie** zweryfikowano na dostępnym tutaj
   tokenie: dokładny kształt zawartości tego pola po realnym wypełnieniu
   (np. czy i jak eksponuje wartość pola `Status`) — token użyty do
   weryfikacji nie ma scope `read:project`, więc zapytanie z tym polem zwraca
   błąd autoryzacji GraphQL (pola zagnieżdżone `id`/`title`/`optionId`/`name`
   wymagają `['read:project']`) zamiast danych. `gh project item-list
   <numer> --owner <owner> --format json` zostaje **bardziej bezpośrednią**
   drogą, gdy chcesz sam widok „board" (kolumny, pole `Status`) w czystym
   kształcie Projects, bez domieszki pozostałych pól issue.

Tę decyzję (etykiety vs. pole Projects) generowany skill musi zapisać jako
**jawne ustalenie z wywiadu w sekcji „Kontekst trackera"**, nie jako domysł —
to samo dotyczy **priorytetu**: Issues **nie ma natywnego pola priorytetu**
(potwierdzone listą dostępnych pól `--json` wyżej — priorytetu na niej nie
ma). Priorytet trzeba **emulować**: etykietą (`priority:high`, `priority:low`
itd.) albo custom-polem w Projects — źródło ustala się w wywiadzie, generowany
skill nie zgaduje nazwy.

## Domknięcie

```bash
gh issue comment <n> --body-file <plik>
gh issue close <n> --reason completed   # albo: --reason "not planned"
gh issue edit <n> --add-label "<etykieta>" --remove-label "<etykieta>"
```

`--body-file` (krótka forma `-F`) czyta treść z pliku (albo `-` dla stdin) —
to jedyny bezpieczny sposób wielolinijkowego komentarza. `--reason` przyjmuje
wyłącznie `completed` albo `not planned` (potwierdzone `gh issue close --help`).

## Pułapki

| Pułapka | Skutek | Obejście |
|---|---|---|
| `--body "…"` inline w shellu | Wielolinijkowy markdown (backticki, apostrofy, `\n`) rozwala się na quotingu shella — treść komentarza/opisu trafia okrojona albo z błędami | `--body-file <plik>` (`gh issue comment`, `gh issue edit`) — zapisz treść do pliku i podaj ścieżkę |
| `gh issue list` domyślnie zwraca **30** wyników | Gdy pula otwartych issues jest większa, część jej po prostu nie widać w wyniku — bez błędu, bez ostrzeżenia | `--limit <n>` jawnie, z liczbą wystarczającą dla realnej puli projektu |
| Brak pola priorytetu w Issues | Nie ma natywnego „po czym sortować" — próba odczytu `priority` z `--json` po prostu nie istnieje jako pole | Emuluj priorytet etykietą `priority:*` albo custom-polem w Projects — źródło ustal w wywiadzie, nie zgaduj |
| Założenie, że `gh issue` nie widzi Projects **w ogóle** | Błędne założenie: `projectItems` jest realnym polem `--json` na `gh issue list`/`gh issue view` (potwierdzone listą dostępnych pól) — ale jego **odczyt wymaga** scope `read:project` na tokenie; bez niego zapytanie z tym polem zwraca błąd GraphQL, nie dane, co łatwo pomylić z „pole nie istnieje" | Dodaj `read:project` do scope tokena, gdy potrzebujesz `projectItems` przez `gh issue`; dla samego widoku „board" (kolumny, pole `Status`) w czystym kształcie Projects prostszy jest `gh project item-list <numer> --owner <owner> --format json` |
| Zamknięcie bez `--reason` | Issue zamyka się, ale bez rozróżnienia „zrobione" vs. „nie będziemy robić" — audyt później nie odróżni jednego od drugiego | `gh issue close <n> --reason completed` albo `--reason "not planned"` — zawsze jawnie |
