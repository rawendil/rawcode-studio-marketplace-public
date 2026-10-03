# Szablon `add-task`

Ten plik czyta model w **fazie 3** (generowanie) skilla-orkiestratora
`/create-workflow-skills`, razem z `references/pattern-anatomy.md` (anatomia
`add-task`, siedem sekcji) i `references/interview.md` (numeracja 17 osi
wywiadu). Poniżej jest **szablon docelowego `SKILL.md`** dla skilla
`add-task` — nie proza o nim, ale sam tekst do złożenia, z tymi samymi dwoma
rodzajami wstawek co w `references/template-next-task.md`.

## Konwencja markerów

- **`{{NAZWA}}`** — podstawienie wartości z wywiadu albo z odpytania
  trackera, np. `{{LIST_ID}}`, `{{STATUS_DOMYSLNY_NOWEGO}}`,
  `{{KOMENDA_UTWORZENIA_ZADANIA}}`. Zawsze zastępowane konkretną treścią —
  nigdy nie zostaje w wygenerowanym pliku.
- **`{{#JEŚLI oś N = wartość}} … {{/JEŚLI}}`** — blok warunkowy z jawnym
  wskazaniem osi z `references/interview.md`, która o nim decyduje. `wartość`
  to skrót opcji z tej osi — nie literalny tekst opcji z wywiadu, tylko jego
  rozpoznawalny skrót używany konsekwentnie w całym tym pliku (te **same**
  skróty co w `template-next-task.md`, dla tych samych osi — np. „oba
  kanały" dla osi 2, „dokumentacja-źródło-prawdy" dla osi 3, „warstwy
  stałe"/„DoD z taska"/„kombinacja" dla osi 11).
- **Brak wyjątków w tym pliku.** `template-next-task.md` ma jeden marker bez
  nazwanej osi (`{{#JEŚLI projekt jest repo git}} … {{/JEŚLI}}`, bo to fakt z
  fazy 0, nie odpowiedź z wywiadu) — dotyczy to tylko sekcji „Git", której
  `add-task` nie ma. **Każdy** blok warunkowy w tym pliku nazywa oś.

Ogrodzenie szablonu niżej jest **czterobacktickowe** (cztery znaki backtick na
otwarcie, ze słowem `markdown`, i cztery na zamknięcie), nie trzybacktickowe —
szablon zawiera zagnieżdżone bloki oznaczone trzema backtickami ze słowem
`bash` i `markdown`, a ogrodzenie trzybacktickowe urwałoby szablon na
pierwszym z nich.

## Szablon

````markdown
---
name: add-task
description: Use when the user invokes /add-task or asks to add / create a new task on the {{NAZWA_LISTY}} list ({{FRAZY_WYZWALAJACE}}) — creates a complete, self-contained task on the {{NAZWA_LISTY}} list.
---

# Dodaj zadanie ({{NAZWA_PROJEKTU}})

## Overview

Powtarzalny schemat tworzenia **kompletnego** zadania na liście
{{NAZWA_LISTY}}: zbierasz treść → sprawdzasz duplikaty (**zawsze**, z
zamknietymi) → składasz opis wg szablonu → ustalasz status i priorytet →
**pokazujesz szkic do akceptacji** → dopiero po zgodzie tworzysz i
**weryfikujesz zapis**. Cel: zadanie ma być samowystarczalne (cel + kontekst +
mierzalny zakres + kryteria ukończenia) — sama nazwa to za mało.

**Zasady nadrzędne:**

- **Nie tworzysz zadania bez potwierdzenia** szkicu przez użytkownika.
- **Priorytet ustawiasz zawsze** — jeśli podany, użyj go; jeśli nie,
  **zaproponuj** go w szkicu z krótkim uzasadnieniem, a użytkownik potwierdza
  lub koryguje. Komenda tworząca zadanie **nigdy** nie leci bez priorytetu —
  ustawiasz go natywnym polem trackera albo etykietą, gdy pole natywne nie
  istnieje (patrz „Kontekst {{NAZWA_TRACKERA}}" niżej).
- Pozostałych metadanych (przypisania, termin, tagi) **nie zgadujesz** —
  ustawiasz tylko podane.
{{#JEŚLI oś 3 = dokumentacja-źródło-prawdy}}
- **Nazewnictwo w opisie zadania** trzymasz wg dokumentacji-źródła-prawdy w
  `docs/` (słownik terminów, jeśli projekt taki ma).
{{/JEŚLI}}

## Kontekst {{NAZWA_TRACKERA}} (stałe)

{{NAZWA_TRACKERA}} obsługujesz przez {{KANAL_OPIS}}.{{#JEŚLI oś 2 = oba kanały}} **Na starcie ustal, co faktycznie masz** — sprawdzenie dostępności obu
kanałów (np. `command -v {{CLI_TRACKERA}}` i rzut oka na dostępne narzędzia
MCP) — i użyj tego, co działa. **Nie zgłaszaj braku dostępu**, zanim nie
sprawdzisz obu.{{/JEŚLI}} Pułapki komend istotne dla tej konfiguracji masz
wpisane wprost w tym pliku — niżej w tej sekcji i w tabeli „Częste błędy". Gdy
w środowisku jest **osobny skill trackera** — projektowy albo użytkownikowy
({{ZASIEG_SKILLA_TRACKERA}}) — jest on szerszym źródłem referencyjnym, ale ten
skill działa bez niego.

- **{{LIST_ID}}** — identyfikator listy/projektu/repo, na którym skill działa
  ({{OPIS_LISTY}}).
- **Statusy:** {{MAPA_STATUSOW}}. **Nie zgaduj nazw** — potwierdź je komendą
  trackera przed pierwszym użyciem. Domyślny status dla nowo utworzonego,
  kompletnego zadania: **{{STATUS_DOMYSLNY_NOWEGO}}** (patrz tabela odstępstw
  w kroku 5 workflow).
- **Priorytety:** {{PRIORYTETY}}.{{#JEŚLI oś 1 = GitHub Issues}} Tracker nie ma
  natywnego pola priorytetu — emulujesz go etykietą ({{ETYKIETA_PRIORYTETU}},
  np. `priority:high`).{{/JEŚLI}} Ustalane **zawsze**, na każdym tworzonym
  zadaniu — patrz „Zasady nadrzędne".
- **Tagi:** muszą już istnieć w {{ZASIEG_TAGOW}} — sprawdź
  {{KOMENDA_ODCZYTU_TAGOW}}. Nowy tag tylko za zgodą użytkownika.
- Wyliczenie faktycznie używanych statusów na tej liście (nie ufaj samej
  dokumentacji trackera):

  ```bash
  {{KOMENDA_WYLICZENIA_STATUSOW}}
  ```

- Gdyby te stałe rozjechały się z rzeczywistością trackera, **źródłem prawdy**
  jest `{{KOMENDA_ZRODLA_PRAWDY}}` — nie ta lista. Ta komenda jest **wyłącznie
  odczytowa**; nigdy nie diagnozuj stanu trackera komendą, która zapisuje.

## Workflow — bramki po kolei

Utwórz TODO na każdy krok. Krok **6** to **STOP-bramka** — nie tworzysz
zadania bez akceptacji szkicu.

1. **Zbierz treść.** Weź opis z argumentu `/add-task` i/lub z kontekstu
   rozmowy (odnośniki do plików jako `plik:linia`). Dopytaj **tylko o braki**
   w celu, zakresie i kryteriach ukończenia — nie odpytuj od nowa tego, co już
   podano.
2. **Odczytaj statusy i tagi.** Statusy bierz z sekcji „Kontekst
   {{NAZWA_TRACKERA}}" wyżej; przy wątpliwości odśwież komendą wyliczenia
   statusów z tamtej sekcji. Tagi: {{KOMENDA_ODCZYTU_TAGOW}}. **Nazw nie
   zgaduj.**
3. **Sprawdź duplikaty — zawsze, z zamkniętymi.**

   ```bash
   {{KOMENDA_SPRAWDZENIA_DUPLIKATOW}}
   ```

   Szukaj po słowach z tytułu i opisu. Jeśli istnieje podobne zadanie →
   **pokaż je** i zapytaj: tworzyć mimo to, czy raczej **edytować istniejące**
   ({{KOMENDA_AKTUALIZACJI_ZADANIA}}).
4. **Złóż opis z szablonu** (sekcja „Szablon opisu zadania" niżej). Odnośniki
   do kodu jako `plik:linia`. Zakres = checklista `- [ ]` z mierzalnymi
   krokami.
5. **Ustal status i priorytet.** Tabela odstępstw od statusu domyślnego:

   | Sytuacja | Status |
   |----------|--------|
   | Zadanie kompletne, można je wziąć od ręki | **{{STATUS_DOMYSLNY_NOWEGO}}** (domyślny) |
   | „Biorę się teraz", użytkownik zaczyna od razu | {{STATUS_W_TOKU}} |
   | Czeka na inne zadanie / decyzję / dostęp z zewnątrz | {{STATUS_WSTRZYMANY}} |
   | Świadomie odłożony pomysł albo zakres wciąż nieustalony | {{STATUS_BACKLOG}} |

   **Priorytet ustalasz zawsze** — jeśli podany, użyj go; jeśli nie,
   **zaproponuj** wartość z jednozdaniowym uzasadnieniem i oznacz jako
   propozycję do potwierdzenia. Brak decyzji użytkownika nie zwalnia z
   ustawienia — przy akceptacji szkicu bez korekty leci Twoja propozycja.
   Tagi/assignees/termin ustaw **tylko jeśli podane**.
6. **STOP — pokaż szkic do akceptacji.** Przedstaw pełny szkic: **nazwa**,
   **opis (markdown)**, **status** (a jeśli inny niż domyślny — dlaczego),
   **priorytet** (z uzasadnieniem), pozostałe metadane. Szkic bez podanego
   priorytetu jest niekompletny — nie pokazuj takiego. **Nie tworzysz**,
   dopóki użytkownik nie zaakceptuje — przyjmij poprawki i pokaż ponownie.
7. **Utwórz i zweryfikuj zapis.**

   ```bash
   {{KOMENDA_UTWORZENIA_ZADANIA}}
   ```

   Podaj **klikalny link** do zadania + krótkie podsumowanie. **Zweryfikuj,
   że zapis wszedł** — odczytaj utworzone zadanie i potwierdź, że status i
   priorytet są takie, jak uzgodniono:

   ```bash
   {{KOMENDA_WERYFIKACJI_ZAPISU}}
   ```

   Jeśli status albo priorytet różnią się od uzgodnionych — dociągnij komendą
   aktualizacji i **dopiero potem** raportuj.
8. **(Opcjonalnie) Relacje między zadaniami.** Tylko gdy z treści albo z prośby
   użytkownika wynika powiązanie z innym zadaniem: zapisz relację („blokowane
   przez" albo zwykłe powiązanie) komendą trackera, np. {{KOMENDA_RELACJI}}.

## Szablon opisu zadania

Stała struktura czterosekcyjna. Sekcję pomijasz tylko, gdy faktycznie nie
dotyczy — i mówisz to wprost w szkicu.

```markdown
## Cel
<jedno zdanie: po co to robimy>

## Kontekst / stan obecny
<skąd wynika potrzeba; odnośniki do kodu jako plik:linia>

## Zakres
- [ ] <mierzalny krok>
- [ ] ...

## Kryteria ukończenia (DoD)
<kiedy uznajemy za zrobione>
```

{{#JEŚLI oś 3 = dokumentacja-źródło-prawdy}}
Plus piąta sekcja, gdy zmiana dotyka dokumentacji-źródła-prawdy albo wymaga
spójności krzyżowej z nią:

```markdown
## Konsekwencje / spójność
<co jeszcze trzeba zsynchronizować — dokumentacja↔kod/prototyp, spójność
krzyżowa w docs/, nazewnictwo wg słownika terminów, decyzje wymagające
zapisu w docs/>
```
{{/JEŚLI}}

## Domyślne DoD (zadania dotykające kodu)

Sekcja „Kryteria ukończenia (DoD)" szablonu domyślnie zawiera, dla każdego
zadania, które **dotyka kodu**:

{{#JEŚLI oś 11 = warstwy stałe}}
- Wszystkie stałe warstwy obowiązkowe w tym projekcie: {{WARSTWY_DOD_LISTA}}.
{{/JEŚLI}}
{{#JEŚLI oś 11 = DoD z taska}}
- Ta sekcja **jest** kompletnym DoD zadania — nie ma dodatkowej stałej listy
  narzuconej z góry; to, co tu wpisujesz, jest jedynym źródłem.
{{/JEŚLI}}
{{#JEŚLI oś 11 = kombinacja}}
- Stałe warstwy globalne, obowiązkowe niezależnie od zakresu: {{WARSTWY_DOD_LISTA}} — **plus** to, co tu wpisujesz jako zakres tego zadania.
{{/JEŚLI}}
- Brama jakości ustalona dla projektu: **{{BRAMA_JAKOSCI}}** — musi przechodzić
  zielono, zanim zadanie trafi do statusu „do oceny"/zamykającego.

**Zadania niekodowe** (research, decyzja, treść, konfiguracja zewnętrznego
serwisu) — **pomijasz warunek testowy/bramy jakości i mówisz o tym wprost w
szkicu**, zamiast wklejać go bezmyślnie tam, gdzie nie ma czego testować.

## Częste błędy

| Błąd | Zamiast tego |
|------|--------------|
| Utworzenie zadania bez pokazania szkicu | STOP-bramka **krok 6** — twórz dopiero po akceptacji |
| Pominięcie sprawdzenia duplikatów | Krok 3 to **zawsze**, z zamknietymi — nie tylko przy niejasnym tytule |
| Sama nazwa bez opisu | Wypełnij szablon: cel + kontekst + zakres + DoD |
| Pominięcie priorytetu w szkicu | Ustal **zawsze** — z uzasadnieniem, gdy nie podano |
| Treść wielolinijkowa (opis) podana inline w wywołaniu CLI/MCP | Zapisz do pliku i podaj przez parametr pliku/strukturalny — inline rozwala markdown |
| Raport „zadanie utworzone" bez weryfikacji zapisu | Krok 7: odczytaj utworzone zadanie, potwierdź status i priorytet |
| Zgadywanie nazwy statusu albo tagu | Potwierdź `{{KOMENDA_ZRODLA_PRAWDY}}` przed użyciem, nie zgaduj |
| Zgadywanie nie podanych metadanych (termin, assignee, tagi) | Ustaw **tylko** to, co użytkownik faktycznie podał |
| Sprawdzenie duplikatów bez pełnego zakresu (np. tylko własne zadania, tylko otwarte) | Użyj parametru pokazującego **wszystkie** zadania listy, łącznie z zamkniętymi |
| Domyślny status listy zaakceptowany bez sprawdzenia | Ustal status wg tabeli odstępstw w kroku 5, nie wg tego, co tracker podstawia sam |
{{#JEŚLI oś 2 = oba kanały}}| Założenie z góry, którym kanałem gadasz z trackerem | **Sprawdź oba** (`command -v {{CLI_TRACKERA}}`, dostępne narzędzia MCP) — użyj tego, co faktycznie działa |{{/JEŚLI}}
{{#JEŚLI oś 2 = oba kanały}}| „Tracker niedostępny" po nieudanej próbie **jednym** kanałem | Tracker jest zawsze — brakuje najwyżej jednego transportu; spróbuj drugiego, zanim zgłosisz brak |{{/JEŚLI}}
{{#JEŚLI oś 3 = dokumentacja-źródło-prawdy}}| Opis zadania bez odnośników do dokumentacji-źródła-prawdy, gdy zmiana jej dotyka | Dodaj sekcję „Konsekwencje / spójność" i odnośniki `plik:linia`/`docs/...` |{{/JEŚLI}}
{{#JEŚLI oś 1 = GitHub Issues}}| Próba ustawienia priorytetu jako natywnego pola | Ten tracker go nie ma — emuluj etykietą ({{ETYKIETA_PRIORYTETU}}), ustaw ją zawsze |{{/JEŚLI}}
{{#JEŚLI oś 11 = warstwy stałe}}| Pominięcie jednej ze stałych warstw DoD przy zadaniu kodowym | Wszystkie warstwy w DoD zadania, albo jawne uzasadnienie, że nie dotyczy |{{/JEŚLI}}
{{#JEŚLI oś 11 = kombinacja}}| Pominięcie stałej warstwy globalnej DoD przy zadaniu kodowym | Stałe warstwy globalne obowiązkowe niezależnie od DoD z taska — dodaj obie części |{{/JEŚLI}}
{{#JEŚLI oś 12 = skrypt zbiorczy}}| Potraktowanie węższego skryptu jako bramy jakości | Bramą jest {{BRAMA_JAKOSCI}} — węższy skrypt to tylko szybka pętla |{{/JEŚLI}}
````

## Reguły składania

Te same reguły co w `references/template-next-task.md`, z dopiskami
specyficznymi dla `add-task` (reguła 7 z tamtego pliku — dobicie tabeli pułapek
do minimum — tutaj nie ma zastosowania; patrz wskazówka na końcu):

1. **Bloki `{{#JEŚLI oś N = wartość}} … {{/JEŚLI}}`, których warunek nie
   zachodzi, usuwasz razem z całą treścią.** Nie zostawiasz adnotacji „nie
   dotyczy", pustego nagłówka ani komentarza.
2. **Po usunięciu bloków przenumeruj kroki workflow od 1** i zaktualizuj
   każde odwołanie w treści („krok 6", „krok 3") oraz nagłówek sekcji
   „Workflow" (numer STOP-bramki). **Krok 8 (relacje) jest wyjątkiem** —
   podobnie jak krok „0." (pre-flight) w `next-task`, nie jest gated żadną
   osią z wywiadu, tylko faktem z fazy 0 (czy tracker ma pole
   relacji/zależności między zadaniami — sprawdź to w cheatsheecie trackera
   albo `--help` jego CLI, **nie** w wywiadzie); zostaw go jako ostatni krok
   **po** przenumerowaniu 1–7, albo usuń całkowicie, gdy tracker tej
   możliwości nie ma — bez adnotacji. Warunku „czy tracker to ma" **nie
   przepisujesz** do treści kroku: w wygenerowanym pliku krok albo jest (z
   realną komendą), albo go nie ma.
3. **Żaden znacznik szablonu nie może zostać w pliku wyjściowym** — dla
   walidatora (`scripts/validate-generated.js`) to błąd, nie ostrzeżenie.
   Dotyczy to markerów warunkowych i markerów `{{NAZWA}}`, które musisz
   podstawić realną wartością. Szablony Go w komendach `gh` (`{{.title}}`,
   `{{range .}}`) są treścią, nie znacznikiem — zostają.
4. **Nagłówki sekcji muszą trafiać w synonimy walidatora**
   (`references/pattern-anatomy.md`, sekcja „Zgodność z walidatorem"):
   `Overview`/`Przegląd`, `Kontekst`/`Context`/`Stałe`/`Constants`,
   `Workflow`/`Przepływ`, `Częste błędy`/`Common mistakes`/`Pitfalls`, oraz
   **dla `add-task` dodatkowo**: `Szablon opisu`/`Description template`/
   `Task template` (walidator wymaga tej piątej sekcji tylko dla `add-task`,
   patrz `REQUIRED['add-task']`). Nie przeformułowuj tych nagłówków na
   synonimy spoza tej listy.
5. **Akapity oznaczone `[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku]`
   wykonujesz i usuwasz w całości** — razem ze znacznikiem, bez adnotacji. W
   tym szablonie **nie ma** takiej notki: jedyna, jaką miał (minimum wierszy
   tabeli pułapek), była logicznie martwa i została usunięta. Reguła zostaje
   jako zabezpieczenie i dlatego, że walidator zgłasza słowo `NOTKA` jako marker
   szablonu. Uzasadnienie i pełne brzmienie reguły: reguła 6 w
   `references/template-next-task.md`.

Dodatkowe wskazówki dla modelu składającego, nie osobne reguły:

- **Pułapki trackera wpisujesz wprost w wynik, nigdy ich nie linkujesz.** Dwie–trzy
  pułapki faktycznie istotne dla wybranego trackera i kanału (z
  `references/tracker-clickup.md`, `references/tracker-github.md`, a dla
  pozostałych trackerów z tego, co potwierdziłeś komendą w fazie 0) trafiają
  **w treść** sekcji „Kontekst trackera" i w tabelę „Częste błędy"
  wygenerowanego pliku. Nie odsyłaj wygenerowanego skilla do plików
  `references/` tego pluginu: po fazie 5 plugin jest wyłączony i taki odnośnik
  przestaje być osiągalny, a skill ma zostać przenośny i samowystarczalny.
- **Kolejność sekcji w wygenerowanym pliku:** Overview → Kontekst → Workflow
  → Szablon opisu zadania → Domyślne DoD → Częste błędy. Krok 4 workflow
  odwołuje się do „Szablon opisu zadania" **do przodu** (ta sekcja jest
  fizycznie niżej w dokumencie) — to jest zamierzone, tak samo jak w obu
  plikach referencyjnych.
- **Tabela odstępstw statusu w kroku 5** zawiera cztery role (domyślny/w
  toku/wstrzymany/backlog). Jeśli tracker realnie rozróżnia mniej stanów,
  scal odpowiadające wiersze i powiedz to wprost w wygenerowanym skillu —
  nie zostawiaj wierszy z niepodstawionymi nazwami.
- **Minimum 10 wierszy w tabeli „Częste błędy"** jest tu spełnione **z
  konstrukcji**: dziesięć wierszy bazowych jest bezwarunkowych, a siedem
  wierszy warunkowych tylko je powiększa — nic nie trzeba dobijać, inaczej niż
  w `next-task` (tam sześć wierszy bazowych przy minimum dwunastu, stąd reguła
  6 tamtego pliku). Wiersze dopisane ponad minimum i tak muszą być
  **konkretnymi** pułapkami tej konfiguracji, nigdy ogólnikami (zasada pisania
  #6 w `references/pattern-anatomy.md`).
- **`{{#JEŚLI oś 1 = GitHub Issues}} … {{/JEŚLI}}`** pojawia się tam, gdzie
  oś 1 zmienia mechanizm wymuszenia priorytetu (natywne pole vs etykieta) —
  dla wszystkich innych wartości osi 1 (ClickUp, Jira, plik w repo) blok się
  nie aktywuje i placeholder `{{PRIORYTETY}}`/`{{KOMENDA_UTWORZENIA_ZADANIA}}`
  niesie już realną, natywną komendę/pole.
