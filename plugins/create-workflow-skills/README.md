# Create Workflow Skills

Generator dwóch skilli workflow (`/next-task`, `/add-task`) dopasowanych do tracker zadań, statusów, definicji ukończenia i polityki git konkretnego projektu.

## Cykl życia

Plugin jest jednorazowy:

1. Zainstaluj na nowym projekcie.
2. Uruchom `/create-workflow-skills`.
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
| `.claude/skills/add-task/SKILL.md` | Tworzy kompletne, samowystarczalne zadanie w trackerze: sprawdzenie duplikatów, opis wg szablonu (cel / kontekst / zakres / kryteria ukończenia), status i priorytet, STOP na akceptację szkicu, weryfikacja zapisu. Bez sekcji git — nie dotyka repo. |

## Instalacja

```bash
/plugin marketplace add rawendil/rawcode-studio-marketplace-public
/plugin install create-workflow-skills@rawcode-studio-marketplace-public
```

## Wyłączenie po użyciu

Faza 5 skilla proponuje wyłączenie pluginu komendą `/plugin disable create-workflow-skills`. Zmiana jest odwracalna (`/plugin enable create-workflow-skills`) i nie usuwa pluginu z dysku.

## Wzorzec źródłowy

Anatomia generowanych skilli pochodzi z działających skilli w dwóch prawdziwych projektach (w referencjach zanonimizowanych jako `projekt-restauracje` i `projekt-gra`).
