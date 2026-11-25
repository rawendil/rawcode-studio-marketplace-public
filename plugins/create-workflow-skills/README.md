# Create Workflow Skills

Generatory skilli workflow dopasowanych do konkretnego projektu:

- `/create-workflow-skills` — `/next-task` i `/add-task` wg trackera zadań, statusów, definicji ukończenia i polityki git,
- `/create-planned-tasks` — `/planned-tasks`, przegląd otwartych zadań tylko do odczytu, dla dowolnego systemu zadań.

## Cykl życia

Plugin jest jednorazowy:

1. Zainstaluj na nowym projekcie.
2. Uruchom `/create-workflow-skills` i/lub `/create-planned-tasks`.
3. Sprawdź wygenerowane skille.
4. Wyłącz plugin.

Skille zapisane do `.claude/skills/` działają dalej niezależnie od stanu pluginu — wyłączenie pluginu nie usuwa i nie wpływa na ich działanie.

## Metodyka pracy

Wywiad pyta, na czym ma się opierać wykonanie zadania (specka, plan, TDD, weryfikacja):

- **Superpowers** — kroki wołają skille `superpowers:*`; wygenerowany skill wymaga tego pluginu.
- **Bez zewnętrznych skilli** — te same etapy opisane wprost w treści kroków; działa na każdej instalacji.
- **Własny workflow** — podajesz własne skille albo opis procedury dla każdego etapu.

Domyślnie rekomendowane są superpowers, jeśli są zainstalowane, w przeciwnym razie wariant bez zewnętrznych skilli.

## Co generuje

| Plik | Opis |
|:-----|:-----|
| `.claude/skills/next-task/SKILL.md` | Prowadzi zadanie od wyboru do oddania: wybór z puli otwartej, rozeznanie w kodzie, bramka ustaleń, wykonanie, brama jakości, commit, komentarz-podsumowanie i zamknięcie w trackerze — wg statusów i polityki git ustalonych w wywiadzie. |
| `.claude/skills/planned-tasks/SKILL.md` (+ skrypt) | Przegląd otwartych zadań z ustalonego zakresu: grupowanie, kolejność, podzadania, terminy i kolumny wg wywiadu, sekcje wydzielone (np. zgłoszenia). Tylko odczyt. Przy formie „skrypt" obok leży skrypt napisany od zera dla systemu zadań projektu, sprawdzony na żywym trackerze kontrolą krzyżową liczby zadań. Generuje `/create-planned-tasks`. |
| `.claude/skills/add-task/SKILL.md` | Tworzy kompletne, samowystarczalne zadanie w trackerze: sprawdzenie duplikatów, opis wg szablonu (cel / kontekst / zakres / kryteria ukończenia), status i priorytet, STOP na akceptację szkicu, weryfikacja zapisu. Bez sekcji git — nie dotyka repo. |

## Przegląd zadań — `/create-planned-tasks`

Osobny generator, bo przegląd przydaje się też w projektach, które mają już `/next-task`. Przebieg:

1. **Sondowanie** — gdzie są zadania (CLI, API, MCP, plik w repo, inny system), jakie statusy z typami, priorytety, podzadania, terminy; ustalenia `/next-task`, gdy istnieje; przegląd zadań pod inną nazwą jako kolizja.
2. **Wywiad** (10 pytań w 3 grupach) — zakres, sekcje wydzielone, grupowanie, kolejność, podzadania, kolumny, forma pobierania (skrypt / komendy / MCP), komentarz pod tabelami.
3. **Szkic** z przykładową tabelą z prawdziwych zadań — do akceptacji.
4. **Zapis, walidacja i kontrola krzyżowa** — liczba zadań w przeglądzie porównana z niezależnym odczytem.

Nieznany system rozpoznaje z dokumentacji i jednego wywołania odczytowego — nic nie zapisuje w trackerze.

## Instalacja

```bash
/plugin marketplace add rawendil/rawcode-studio-marketplace-public
/plugin install create-workflow-skills@rawcode-studio-marketplace-public
```

## Wyłączenie po użyciu

Faza 5 obu generatorów proponuje wyłączenie pluginu komendą `/plugin disable create-workflow-skills`. Zmiana jest odwracalna (`/plugin enable create-workflow-skills`) i nie usuwa pluginu z dysku.

## Wzorzec źródłowy

Anatomia generowanych skilli pochodzi z działających skilli w dwóch prawdziwych projektach (w referencjach zanonimizowanych jako `projekt-restauracje` i `projekt-gra`).
