# Szablon `next-task`

Ten plik czyta model w **fazie 3** (generowanie) skilla-orkiestratora
`/create-workflow-skills`, razem z `references/pattern-anatomy.md` (osiem
sekcji i osiem reguł pisania) i `references/interview.md` (numeracja 17 osi
wywiadu). Poniżej jest **szablon docelowego `SKILL.md`** — nie proza o nim,
ale sam tekst do złożenia, z dwoma rodzajami wstawek.

## Konwencja markerów

- **`{{NAZWA}}`** — podstawienie wartości z wywiadu albo z odpytania
  trackera, np. `{{LIST_ID}}`, `{{STATUS_W_TOKU}}`, `{{BRAMA_JAKOSCI}}`,
  `{{KONWENCJA_COMMITA}}`. Zawsze zastępowane konkretną treścią — nigdy nie
  zostaje w wygenerowanym pliku.
- **`{{#JEŚLI oś N = wartość}} … {{/JEŚLI}}`** — blok warunkowy z jawnym
  wskazaniem osi z `references/interview.md`, która o nim decyduje. `wartość`
  to skrót opcji z tej osi (np. „potwierdzać wybór", „wybieraj sam",
  „twarda") — nie literalny tekst opcji z wywiadu, tylko jego rozpoznawalny
  skrót używany konsekwentnie w całym tym pliku. Gdy oś niesie **pod-decyzję**
  ustalaną niezależnie od opcji A/B/C (oś 16: sprzątanie po sobie), warunek
  nazywa ją wprost — `{{#JEŚLI oś 16, pod-decyzja sprzątania = wymagane}} …
  {{/JEŚLI}}` — bo samo „oś 16 = wymagane" myli się z opcją A tej osi
  („specka + plan", w tabeli osi różnicujących opisana jako „wymagane, dwa pliki").
- **Wyjątek jednego markera:** `{{#JEŚLI projekt jest repo git}} … {{/JEŚLI}}`
  (sekcja „Git") nie nazywa osi, bo „czy to repo git" jest **faktem z fazy 0**
  (sondowanie), nie odpowiedzią z wywiadu — żadna z 17 osi go nie ustala.
  Wszystkie pozostałe bloki warunkowe w tym pliku nazywają oś.
- **`{{KATALOG_SPECEK}}` / `{{KATALOG_PLANOW}}`** — katalogi ustalone w osi 16
  (istniejące w repo albo domyślne dla wariantu osi 17). Gdy w repo nie ma
  katalogu specek, a oś 16 = plan w czacie, **usuń całą frazę** o speckach
  („lub specką w …", „oraz speckami w …") zamiast wpisywać nieistniejącą
  ścieżkę.

Ogrodzenie szablonu niżej jest **czterobacktickowe** (cztery znaki backtick na
otwarcie, ze słowem `markdown`, i cztery na zamknięcie), nie trzybacktickowe —
szablon zawiera zagnieżdżone bloki oznaczone trzema backtickami ze słowem
`bash`, a ogrodzenie trzybacktickowe urwałoby szablon na pierwszym z nich.

## Szablon

````markdown
---
name: next-task
description: Use when the user invokes /next-task or asks to pick up / start the next task from the {{NAZWA_LISTY}} list ({{FRAZY_WYZWALAJACE}}) — selects, executes and hands over a task from the {{NAZWA_LISTY}} list.
---

# Następne zadanie ({{NAZWA_PROJEKTU}})

## Overview

Powtarzalny schemat prowadzenia zadania z listy {{NAZWA_LISTY}} od wyboru do
oddania: {{#JEŚLI oś 4 = potwierdzać wybór}}proponujesz zadanie wg priorytetu
i **potwierdzasz wybór z użytkownikiem**{{/JEŚLI}}{{#JEŚLI oś 4 = wybieraj sam}}**sam wybierasz zadanie** wg priorytetu i tylko informujesz, które i
dlaczego{{/JEŚLI}}, robisz rozeznanie w kodzie/stanie faktycznym (w tym: czy
rzecz nie jest już zrobiona — statusy trackera bywają nieaktualne), ustalasz z
użytkownikiem to, czego nie wolno Ci rozstrzygnąć samodzielnie, wykonujesz i
**oddajesz do oceny**{{#JEŚLI oś 8 = wymaga akceptacji}} — bez auto-commita i
auto-zamknięcia{{/JEŚLI}}. {{#JEŚLI oś 8 = wymaga akceptacji}}Dopiero gdy
użytkownik potwierdzi (po ewentualnych poprawkach) — commitujesz{{#JEŚLI oś 13 = wymagany}}, **potwierdzasz efekt „na żywo"**{{/JEŚLI}}, dodajesz
komentarz-podsumowanie i zamykasz zadanie.{{/JEŚLI}}{{#JEŚLI oś 8 = brak wymogu}}Po zielonej bramie jakości zadanie zamyka się bez czekania na jawną
akceptację użytkownika.{{/JEŚLI}}

**Zasada nadrzędna:** nie zaczynasz pracy, dopóki nie masz:

- {{#JEŚLI oś 4 = potwierdzać wybór}}**potwierdzonego przez użytkownika wyboru zadania**,{{/JEŚLI}}{{#JEŚLI oś 4 = wybieraj sam}}wybranego zadania z jednozdaniowym uzasadnieniem podanym użytkownikowi,{{/JEŚLI}}
- rozeznania w kodzie/stanie faktycznym,
- **jasnej definicji ukończenia** (patrz „Definicja ukończenia" niżej),
- {{#JEŚLI oś 8 = wymaga akceptacji}}zgody użytkownika na decyzje projektowe.{{/JEŚLI}}{{#JEŚLI oś 8 = brak wymogu}}ustalonych z użytkownikiem decyzji projektowych tam, gdzie były wieloznaczne.{{/JEŚLI}}

Konflikt z `CLAUDE.md`, `.ai/guidelines/` lub specką w
`{{KATALOG_SPECEK}}` → **zgłaszasz wprost**, nigdy nie nadpisujesz po
cichu.

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
  trackera przed pierwszym użyciem.
- **Priorytety:** {{PRIORYTETY}}; reguła remisu: {{REGULA_REMISU}}.
- **Pula otwarta** (do wyboru zadania, krok 1 workflow): {{PULA_OTWARTA}} —
  pobierana jednym wywołaniem, bez filtrowania po statusie, gdy CLI na to
  pozwala.
- **Statusy zamykające:** {{STATUSY_ZAMYKAJACE}}. Rozpoznajesz je po **typie**,
  nie po nazwie. Jeśli listowanie puli ich nie odsiewa samo (a bywa, że nie
  odsiewa wszystkich), **odsiewasz je po odczycie** — patrz krok wyboru zadania.
- Wyliczenie faktycznie używanych statusów na tej liście (nie ufaj samej
  dokumentacji trackera):

  ```bash
  {{KOMENDA_WYLICZENIA_STATUSOW}}
  ```

- Gdyby te stałe rozjechały się z rzeczywistością trackera, **źródłem prawdy**
  jest `{{KOMENDA_ZRODLA_PRAWDY}}` — nie ta lista. Ta komenda jest
  **wyłącznie odczytowa**; nigdy nie diagnozuj stanu trackera komendą, która
  zapisuje.

{{#JEŚLI oś 3 = zasób pisze do produkcji}}
## ⚠️ {{NAZWA_ZASOBU}} pisze do PRODUKCJI

Każde {{OPERACJE_ZAPISU}} działa na **{{OPIS_ZASOBU_PRODUKCYJNEGO}}**, nie
lokalnie ani testowo. Stąd twarda zasada:

- **Identyfikatory w środowisku lokalnym i produkcyjnym mogą się rozjeżdżać.**
  Sprawdź to wprost, zanim zbudujesz na tym adresowanie zapisów.
- **Id ustalasz zawsze przez odczyt po nazwie/identyfikatorze biznesowym**
  (nie z lokalnej bazy/cache), **nigdy** przez zgadywanie na podstawie
  środowiska deweloperskiego.
- **Przed zapisem potwierdź, że trafiasz w ten rekord** — odczytaj go i
  porównaj z opisem zadania. Dopiero potem zapis.
- Operacja na produkcji jest **widoczna od razu** — nie ma środowiska
  stagingowego dla tego zasobu. Przy wątpliwości pytasz w bramce ustaleń
  (krok „STOP — ustalenia z użytkownikiem"), nie improwizujesz.
{{/JEŚLI}}

## Definicja ukończenia (bramka)

Zadanie traktujesz jako **jedną, kompletną całość**. Zanim uznasz je za gotowe
do oddania, musisz spełnić **wszystko** poniżej w ramach **tego** zadania —
nie wolno odkładać żadnego elementu na osobne, przyszłe zadania.

{{#JEŚLI oś 11 = warstwy stałe}}
{{WARSTWY_DOD_LISTA}}

Jeśli któraś warstwa **faktycznie nie dotyczy** tego zadania — powiedz to
**wprost** i uzasadnij, zamiast milcząco pominąć.
{{/JEŚLI}}
{{#JEŚLI oś 11 = DoD z taska}}
Bramką jest **definicja ukończenia z opisu zadania** w trackerze (sekcja
„Kryteria ukończenia (DoD)" albo „Definition of done" w starszych zadaniach).
Zanim uznasz zadanie za gotowe do oddania, **każdy punkt musi być odhaczony
dowodem**, nie deklaracją.

- **Brak definicji ukończenia w zadaniu** (starsze zadania bywają bez niej) →
  **nie startujesz na ślepo**: proponujesz ją w bramce ustaleń, użytkownik
  zatwierdza, a Ty dopisujesz ją do opisu zadania
  ({{KOMENDA_AKTUALIZACJI_OPISU}}), żeby zadanie było samowystarczalne.
{{/JEŚLI}}
{{#JEŚLI oś 11 = kombinacja}}
{{WARSTWY_DOD_LISTA}} — obowiązkowe **niezależnie** od zakresu zadania —
**plus** definicja ukończenia z opisu zadania dla reszty zakresu. Obie części
muszą być spełnione niezależnie; jeśli któraś stała warstwa faktycznie nie
dotyczy zadania, powiedz to wprost i uzasadnij.
{{/JEŚLI}}

{{#JEŚLI oś 13 = wymagany}}
**Dowód „na żywo" (twarde, zawsze).** Definicja ukończenia jest spełniona
dopiero wtedy, gdy efekt jest potwierdzony **tam, gdzie żyje** (produkcja,
staging), a nie tylko w repo czy na Twojej maszynie. Zielone testy lokalne
**nie zastępują** tego dowodu — to osobna STOP-bramka w workflow (patrz krok
„STOP — weryfikacja na żywo").
{{/JEŚLI}}

## Workflow — bramki po kolei

Utwórz TODO na każdy krok. Kroki {{NUMERY_BRAM_STOP}} to **STOP-bramki** — nie
przechodzisz dalej bez spełnienia warunku. Kroki {{NUMERY_KROKOW_WYMAGANYCH}}
są **wymagane** — zadanie nie jest zrobione, dopóki praca nie jest
zacommitowana{{#JEŚLI oś 13 = wymagany}}, efekt nie jest potwierdzony **na
żywo**{{/JEŚLI}}, podsumowanie nie trafi na taska w komentarzu, zadanie nie ma
statusu zamkniętego{{#JEŚLI oś 14 = wymagany}}, zmiany nie są
wypchnięte{{/JEŚLI}}, a środowisko nie jest posprzątane.
[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku] Uzupełnij
`{{NUMERY_BRAM_STOP}}` i `{{NUMERY_KROKOW_WYMAGANYCH}}` numerami kroków **PO**
usunięciu nieaktywnych bloków i przenumerowaniu — patrz „Reguły składania" pod
szablonem. Gdy krok `0.` (pre-flight) zostaje w wyniku, **dopisz do tego
akapitu zdanie, że workflow zaczyna się od kroku 0** — inaczej czytelnik
skanujący nagłówek nie dowie się, że przed krokiem 1 coś jest, a to jest
pierwsza rzecz do wykonania.

{{#JEŚLI oś 15 = praca w kilku sesjach}}
0. **Pre-flight — świeżość brancha wobec remote.** *Przed* wyborem zadania:
   `git fetch` i porównaj bieżącą gałąź z jej upstreamem (`git status -sb`;
   dokładne liczby: `git rev-list --left-right --count @{u}...HEAD`).
   - **Behind origin** → **zatrzymaj się i powiedz to użytkownikowi**: ile
     commitów za, czy masz lokalne/niezacommitowane zmiany. Zaproponuj
     `git pull --rebase` (lub scalenie), ale **nie rób tego automatycznie** —
     użytkownik pracuje w kilku sesjach na tym samym repo. Ruszasz dalej
     dopiero po ustaleniu z nim.
   - **Up-to-date / tylko ahead** → odnotuj krótko i kontynuuj.
   - **Brak upstreama lub brak remote** → odnotuj i kontynuuj (nie blokuj).
{{/JEŚLI}}
{{#JEŚLI oś 4 = potwierdzać wybór}}
1. **STOP — wybór zadania potwierdzony przez użytkownika.**
   {{KOMENDA_LISTOWANIA_PULI_OTWARTEJ}} — jednym wywołaniem, bez filtrowania
   po statusie, dostajesz pulę otwartą: {{PULA_OTWARTA}}.

   **Odsiej statusy zamykające ({{STATUSY_ZAMYKAJACE}}) z odczytanej listy,
   zanim ułożysz kandydatów.** Nie zakładaj, że komenda listująca zrobiła to
   za Ciebie — brak flagi „pokaż zamknięte" nie musi znaczyć, że wszystkie
   statusy zamykające są odsiane. Zadanie o statusie zamykającym
   przedstawione jako kandydat to najgorszy możliwy błąd tego kroku:
   użytkownik dostaje do zatwierdzenia pracę, która została odwołana.

   Ułóż kandydatów wg priorytetu ({{PRIORYTETY}}); przy remisie:
   {{REGULA_REMISU}}.

   **Wyboru nie wykonujesz — proponujesz go.** Przedstaw **2–3 kandydatów**
   (nazwa + link + status + jednozdaniowe „dlaczego ten"), wskaż swojego
   faworyta jako pierwszą opcję i **zapytaj `AskUserQuestion`, które brać**.
   Dopiero jawna odpowiedź otwiera kolejne kroki. **Nie ruszasz statusu ani
   pracy**, póki użytkownik nie potwierdzi — nawet gdy kandydat jest jeden.
   Użytkownik może wskazać zadanie spoza propozycji — wtedy bierzesz jego.
   Zapytaj też wprost, gdy lista jest pusta albo gdy wszyscy kandydaci
   wyglądają na zablokowanych.
{{/JEŚLI}}
{{#JEŚLI oś 4 = wybieraj sam}}
1. **Wybór zadania.** {{KOMENDA_LISTOWANIA_PULI_OTWARTEJ}} — pula otwarta:
   {{PULA_OTWARTA}}. **Odsiej statusy zamykające ({{STATUSY_ZAMYKAJACE}}) po
   odczycie** — brak flagi „pokaż zamknięte" nie gwarantuje, że komenda
   odsiała je wszystkie. Wybierz **sam** wg priorytetu ({{PRIORYTETY}}); przy
   remisie: {{REGULA_REMISU}}. Powiedz użytkownikowi, które bierzesz i
   dlaczego (1–2 zdania). Jeśli lista jest pusta lub wybór niejednoznaczny →
   zapytaj.
{{/JEŚLI}}
{{#JEŚLI oś 6 ≠ brak}}
2. **Bramka zależności** (dopiero po potwierdzeniu z kroku 1).
   {{KOMENDA_SZCZEGOLOW_ZADANIA}} — sprawdź pole zależności; status blokera
   sprawdzasz **osobnym** wywołaniem tej samej komendy na jego id, nie z pola
   tekstowego.{{#JEŚLI oś 6 = twarda}} Jeśli kandydat ma niedomknięty bloker
   (status inny niż zamykający/anulowany) → **nie startujesz**: powiedz
   wprost co blokuje (nazwa + link) i weź następnego kandydata z kroku 1.
   **Nie zamykaj blokera, żeby ruszyć.**{{/JEŚLI}}{{#JEŚLI oś 6 = ostrzegawcza}} Sprawdź i **zgłoś** blokera użytkownikowi, ale decyzję o
   kontynuacji zostaw jemu — to nie jest STOP-bramka, tylko widoczność
   ryzyka.{{/JEŚLI}}
{{/JEŚLI}}
3. **Status → {{STATUS_W_TOKU}}** *przed* rozpoczęciem pracy, ale **po**
   potwierdzeniu wyboru: {{KOMENDA_ZMIANY_STATUSU}}. Gdy zadanie mimo
   wszystko odpada (użytkownik zmienia zdanie, rzecz okazuje się zrobiona w
   kroku rozpoznania) — **przywróć poprzedni status**.
4. **Rozpoznanie + weryfikacja stanu faktycznego.** Przeczytaj pełny opis
   zadania ({{KOMENDA_SZCZEGOLOW_ZADANIA}}) i wyciągnij definicję
   ukończenia. Przeczytaj **powiązane pliki kodu** i **sprawdź w kodzie/git,
   czy rzecz nie jest już zrobiona** — statusy trackera bywają nieaktualne.
   Jeśli **już istnieje** → nie rób tego drugi raz: zgłoś użytkownikowi,
   zaproponuj domknięcie zadania i wróć do kroku 1 po następne. **Nie ufaj
   opisowi na słowo** — weryfikuj ścieżki, linie, przyczynę.
5. **Research, gdy są luki.** `grep` / `Read` / agent `Explore`, aż rozumiesz
   stan faktyczny **i konsekwencje** zmiany. Sprawdź spójność z
   `CLAUDE.md`/`AGENTS.md`{{#JEŚLI oś 3 = dokumentacja-źródło-prawdy}} i
   dokumentacją-źródłem-prawdy w `docs/`{{/JEŚLI}} oraz speckami w
   `{{KATALOG_SPECEK}}`. Namierz **wszystkie** miejsca dotknięte zmianą.

   ⚠️ **Dokumentacji projektu też nie ufaj na słowo.** Ta sama ostrożność, którą
   stosujesz do opisu zadania, obowiązuje wobec `CLAUDE.md` i `docs/`: to pliki
   pisane ręcznie i potrafią opisywać stan sprzed kilku commitów. Gdy
   dokumentacja twierdzi coś o repo (że nie ma CI, że jakiegoś katalogu nie ma,
   że coś działa inaczej), **sprawdź to w repo** przed użyciem jako podstawy
   decyzji. Rozjazd zgłoś użytkownikowi w bramce ustaleń — być może to
   dokumentacja wymaga aktualizacji w ramach tego zadania.
6. **STOP — ustalenia z użytkownikiem.** Przedstaw **zwięzły plan** (co i
   gdzie zmienisz) oraz definicję ukończenia, na której się opierasz. Wypisz
   to, czego **nie wolno Ci rozstrzygnąć samemu**: decyzje projektowe,
   konflikty z konwencjami/specką, wieloznaczności. Zadaj je
   (`AskUserQuestion`, z rekomendacją jako pierwszą opcją). **Nie ruszasz
   dalej, póki nie odpowie.**{{#JEŚLI oś 16 = plan w czacie}} **Nie piszesz
   osobnej specki ani planu do `docs/`** — plan zostaje w czacie, kod i testy
   są dokumentacją. Wyjątek: ustalenia z researchu i korekty opisu wpisujesz
   do opisu zadania.{{/JEŚLI}}{{#JEŚLI oś 16 = specka i plan}} Specka i plan
   wdrożenia idą do `docs/` — dwa kolejne kroki.{{/JEŚLI}}
{{#JEŚLI oś 16 = specka i plan}}
7. **Specka.**{{#JEŚLI oś 17 = superpowers}} Użyj skilla `superpowers:brainstorming`.{{/JEŚLI}}{{#JEŚLI oś 17 = bez zewnętrznych skilli}} Spisz projekt rozwiązania: cel,
   zakres, rozważone warianty z wybranym i uzasadnieniem, wpływ na istniejący
   kod i testy. Pokaż użytkownikowi i poczekaj na akceptację.{{/JEŚLI}}{{#JEŚLI oś 17 = własny workflow}} {{WLASNY_KROK_SPECKI}}{{/JEŚLI}} Zapis w
   `{{KATALOG_SPECEK}}RRRR-MM-DD-temat-design.md` (data z bieżącej sesji).
8. **Plan wdrożenia.**{{#JEŚLI oś 17 = superpowers}} Użyj skilla `superpowers:writing-plans`.{{/JEŚLI}}{{#JEŚLI oś 17 = bez zewnętrznych skilli}} Rozpisz pracę na małe,
   sprawdzalne kroki: które pliki, jaki test, jaka komenda potwierdza każdy
   krok.{{/JEŚLI}}{{#JEŚLI oś 17 = własny workflow}} {{WLASNY_KROK_PLANU}}{{/JEŚLI}} Zapis w `{{KATALOG_PLANOW}}RRRR-MM-DD-temat.md`.
{{/JEŚLI}}
9. **Wykonanie.** Zakres = definicja ukończenia z sekcji „Definicja
   ukończenia".{{#JEŚLI oś 11 = warstwy stałe}}
   Wdrażasz **wszystkie** warstwy: {{WARSTWY_DOD_SKROT}}.{{/JEŚLI}}{{#JEŚLI oś 11 = DoD z taska}} Wdrażasz zakres z definicji ukończenia zapisanej w
   opisie zadania.{{/JEŚLI}}{{#JEŚLI oś 11 = kombinacja}} Wdrażasz stałe
   warstwy globalne oraz zakres z definicji ukończenia zapisanej w opisie
   zadania.{{/JEŚLI}}{{#JEŚLI oś 17 = superpowers}} Przy zadaniach kodowych: skill
   `superpowers:test-driven-development` (RED → GREEN → REFACTOR).{{/JEŚLI}}{{#JEŚLI oś 17 = bez zewnętrznych skilli}} Przy zadaniach kodowych: najpierw
   test, który nie przechodzi (RED), potem minimalny kod, aż przejdzie
   (GREEN), na końcu porządki przy zielonych testach (REFACTOR).{{/JEŚLI}}{{#JEŚLI oś 17 = własny workflow}} {{WLASNY_KROK_WYKONANIA}}{{/JEŚLI}}

   **Aktywuj skille domenowe tego projektu.** Przed pisaniem kodu przejrzyj
   `.claude/skills/` i włącz te, które dotyczą warstwy, w której pracujesz
   (framework, UI, testy, styl). Czytaj katalog **za każdym razem**, nie polegaj
   na liście z dnia wygenerowania tego skilla — skille domenowe dochodzą w
   trakcie życia projektu.{{#JEŚLI oś 3 = dokumentacja-źródło-prawdy}} Gdy
   `CLAUDE.md` wymaga aktywowania takiego skilla, jest to warunek, nie
   sugestia.{{/JEŚLI}}
10. **Weryfikacja.** Brama jakości: {{BRAMA_JAKOSCI}}. Pokaż
    wynik (evidence, nie deklaracje){{#JEŚLI oś 17 = superpowers}} — skill
    `superpowers:verification-before-completion`.{{/JEŚLI}}{{#JEŚLI oś 17 = bez zewnętrznych skilli}}: uruchom komendy w tej
    sesji i pokaż ich realny wynik; bez uruchomienia nie twierdzisz, że coś
    działa.{{/JEŚLI}}{{#JEŚLI oś 17 = własny workflow}}. {{WLASNY_KROK_WERYFIKACJI}}{{/JEŚLI}}
{{#JEŚLI oś 8 = wymaga akceptacji}}
11. **STOP — oddaj do oceny.** Ustaw status **{{STATUS_DO_OCENY}}**
    ({{KOMENDA_ZMIANY_STATUSU}}). Przedstaw: definicję ukończenia odhaczoną
    punkt po punkcie, zmienione pliki, wynik weryfikacji. **Nie commituj i
    nie zamykaj zadania sam** — czekaj na ocenę. Poprawki: nanieś (nadal w
    rygorze weryfikacji) i **pokaż ponownie**; powtarzaj, aż użytkownik
    **jawnie potwierdzi**.
{{/JEŚLI}}

[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku] **Kolejność kroków „commit →
dowód → komentarz → push → zamknięcie" zależy od tego, jaki wariant wskazuje
oś 10:**
{{#JEŚLI oś 10 = wariant A}}komentarz → commit → status zamykający → push
(push jest osobnym, wymaganym krokiem **po** zamknięciu) — ułóż kroki niżej w
tej kolejności: najpierw komentarz-podsumowanie, potem commit, potem status
zamykający, na końcu push.{{/JEŚLI}}{{#JEŚLI oś 10 = wariant B}}commit →
dowód „na żywo" → komentarz → status zamykający; push wcześniej i **tylko na
wyraźną prośbę** (push = deploy), nie zsynchronizowany z zamknięciem —
domyślna kolejność kroków niżej (commit, push, dowód, komentarz, zamknięcie)
już odpowiada temu wariantowi.{{/JEŚLI}}{{#JEŚLI oś 10 = inna kolejność}}{{KOLEJNOSC_DOMKNIECIA_USTALONA}} — wypisz ją jawnie jako numerowaną listę
kroków, zamiast domyślnego układu z szablonu.{{/JEŚLI}} Niezależnie od
wariantu: **komentarz zawsze przed zamknięciem statusu**, **commit zawsze
przed zamknięciem statusu** — nie zamykasz zadania z niezacommitowaną pracą.

**Rozdzielenie kompetencji osi 10 i osi 14.** Oś 10 rozstrzyga **kolejność**
kroków, oś 14 rozstrzyga **politykę pusha** (czy wymagany, czy na prośbę, czy
repo nie ma remote). Opisy wariantów osi 10 wspominają push, żeby pokazać jego
miejsce w sekwencji — **nie są źródłem polityki**. Gdy wariant osi 10 zakłada
inną politykę niż oś 14 (np. wariant B mówi „tylko na wyraźną prośbę", a oś 14
mówi „wymagany"), **bierzesz politykę z osi 14, a kolejność z osi 10** i nie
przepisujesz sprzecznego zdania z opisu wariantu. Ten rozjazd wystąpił realnie
i musiał zostać rozstrzygnięty ręcznie — teraz ma regułę.

{{#JEŚLI oś 13 = wymagany}}[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku]
**Krok „STOP — weryfikacja na żywo" (oś 13) wchodzi zawsze bezpośrednio PRZED
krokiem „status zamykający"**, niezależnie od wariantu z oś 10 — bramkuje
zamknięcie, nie inne kroki domknięcia. Dla wariantu B to już domyślna pozycja
niżej (dowód między push i komentarzem). Dla wariantu A dowód wchodzi tuż przed
„status zamykający", czyli po commicie i przed nim w przełożonej kolejności.
**Wyjątek, który nie ma domyślnego rozstrzygnięcia — jedyna część tej notki,
która idzie do wyniku:** gdy jednocześnie oś 13 = wymagany **i** oś 10 =
wariant A, dowód „na żywo" może wymagać wcześniejszego pusha (np. weryfikujesz
workflow deployu wywołany pushem), a wariant A odkłada push na **po**
zamknięciu — obie reguły są wtedy w konflikcie. **Wpisz ten konflikt w treść
kroku „STOP — ustalenia z użytkownikiem"**: nie zgaduj, który warunek
przeważa, zgłoś go wprost użytkownikowi i ustal z nim, czy push wyjątkowo idzie
przed zamknięciem dla tego zadania. Przy wariancie B konflikt nie zachodzi —
nie dopisuj go wtedy nigdzie.{{/JEŚLI}}

12. **Commit** (wymagany{{#JEŚLI oś 8 = wymaga akceptacji}}, PO akceptacji z
    kroku „STOP — oddaj do oceny"{{/JEŚLI}}). `git add <tylko pliki, które
    sam edytowałeś>` (**nigdy `git add -A` ani `git reset`**{{#JEŚLI oś 15 = praca w kilku sesjach}} — patrz „Git"{{/JEŚLI}}), commit z wiadomością w
    konwencji {{KONWENCJA_COMMITA}}.
{{#JEŚLI oś 14 ≠ lokalnie}}
13. **Push.**{{#JEŚLI oś 14 = wymagany}} Wypchnij commit na zdalne repo
    (`git push`). Zsynchronizuj się bezpiecznie, jeśli zdalna gałąź
    wyprzedza lokalną (`git pull --rebase` lub push bez `--force`; **nigdy
    `--force`**).{{/JEŚLI}}{{#JEŚLI oś 14 = na wyraźną prośbę}} **Tylko na
    wyraźną prośbę użytkownika** — push = deploy. Nigdy nie pushujesz „przy
    okazji".{{/JEŚLI}}
{{/JEŚLI}}
{{#JEŚLI oś 13 = wymagany}}
14. **STOP — weryfikacja „na żywo". Bez niej nie ma statusu zamykającego.**
    Zadanie **zostaje w {{STATUS_DO_OCENY}}**, dopóki nie masz dowodu, że
    efekt jest potwierdzony tam, gdzie żyje. Lokalne testy i zaakceptowany
    diff **nie są** tym dowodem. Zależnie od tego, co zadanie zmienia:
    {{TABELA_DOWODU_NA_ZYWO}}. **Gdy dowodu nie da się zdobyć** — nie
    zamykasz po cichu: mówisz wprost, czego nie potwierdziłeś i jaka komenda
    by to domknęła; użytkownik decyduje jawnie o zamknięciu bez niego, a Ty
    zapisujesz tę decyzję w komentarzu z następnego kroku.
{{/JEŚLI}}
{{#JEŚLI oś 9 = komentarz}}
15. **Komentarz-podsumowanie.** {{KOMENDA_KOMENTARZA}} — treść **przez
    plik**, nigdy inline (`-m`/`-d` psuje wielolinijkowy markdown). Zawiera:
    wykonaną pracę, zmienione pliki, wynik weryfikacji{{#JEŚLI oś 13 = wymagany}}, dowód „na żywo" (albo jawnie: czego nie potwierdzono i czyją
    decyzją zamykamy){{/JEŚLI}}, odstępstwa od definicji ukończenia.
{{/JEŚLI}}
16. **Status zamykający.** {{KOMENDA_ZMIANY_STATUSU}} →
    {{STATUS_ZAMYKAJACY}}. Gdy komenda odpowie błędem walidacji nazwy — weź
    nazwę z jej komunikatu, **nie zgaduj**. Potwierdź krótko: zadanie +
    klikalny link + nowy status.
{{#JEŚLI oś 16, pod-decyzja sprzątania = wymagane}}
17. **Sprzątanie po sobie** (wymagane). Zatrzymaj procesy w tle, które sam
    uruchomiłeś (**nie ubijaj** tego, co już działało przed Tobą). Usuń
    pliki tymczasowe utworzone do weryfikacji (zrzuty, artefakty
    `.playwright-mcp/`, pliki robocze) — do scratchpada, nie do repo; **nie
    commituj** ich. Zamknij przeglądarkę Playwright, jeśli ją otwierałeś.
{{/JEŚLI}}

{{#JEŚLI projekt jest repo git}}
## Git{{#JEŚLI oś 15 = praca w kilku sesjach}} (uwaga na sesje równoległe){{/JEŚLI}}

{{#JEŚLI oś 14 = na wyraźną prośbę}}Commituj **dopiero po akceptacji**
użytkownika; **push tylko na wyraźną prośbę** — bo push = deploy.{{/JEŚLI}}{{#JEŚLI oś 14 = wymagany}}W tym workflow **commit i push są wymaganymi
krokami** (inaczej niż domyślna zasada „push tylko na prośbę" — tu push jest
częścią domknięcia zadania).{{/JEŚLI}}{{#JEŚLI oś 14 = lokalnie}}Commit jest
krokiem domknięcia; **push nie dotyczy** — repo nie ma remote.{{/JEŚLI}}
Stage **tylko pliki, które sam edytowałeś** (`git add <pliki>`), **nigdy
`git add -A` ani `git reset`**{{#JEŚLI oś 15 = praca w kilku sesjach}} —
użytkownik pracuje w kilku sesjach na tym samym repo i zgarniesz/rozbijesz
cudzą pracę{{/JEŚLI}}. Wiadomość commita w konwencji {{KONWENCJA_COMMITA}}.

{{#JEŚLI oś 15 = praca w kilku sesjach}}
**Working tree jest współdzielony między sesjami.** Sprawdź, na czym stoi
HEAD, zanim zaczniesz commitować (`git branch --show-current`) — możesz
siedzieć na branchu równoległej sesji, nie na głównej gałęzi. **Nie
przełączaj gałęzi** w środku pracy — wyrwiesz working tree drugiej sesji.
Przed każdym commitem czytaj `git status --porcelain` od nowa — nie
zakładaj, że stan z początku zadania jest aktualny.{{#JEŚLI oś 14 = wymagany}} Przy pushu **nigdy `--force`**.{{/JEŚLI}}{{#JEŚLI oś 14 = na wyraźną prośbę}} Gdy trzeba oddać pracę na główną gałąź, a HEAD jest na
cudzym branchu: sprawdź, czy fast-forward jest możliwy, i przesuń ref **bez
`checkout`** (`git branch -f {{GLOWNA_GALAZ}} HEAD`); sprawdź `git log
{{GLOWNA_GALAZ}}..HEAD` przed pushem — fast-forward zabiera ze sobą też commity
leżące poniżej Twojego, w tym z równoległej sesji.{{/JEŚLI}}
{{/JEŚLI}}
{{/JEŚLI}}

## Częste błędy

| Błąd | Zamiast tego |
|------|--------------|
| Robienie rzeczy, która już jest w repo/trackerze | Krok rozpoznania: zweryfikuj w kodzie/git; jeśli zrobione → zgłoś i domknij zadanie |
| Ciche nadpisanie ustalenia z `CLAUDE.md`/`docs/`/specki | Zgłoś konflikt wprost i zaproponuj rozwiązanie |
| Deklaracja „testy przechodzą" bez pokazanego outputu | Evidence, nie deklaracje — pokaż wynik bramy jakości |
| Skok do kodu z pominięciem bramki ustaleń | Najpierw plan + to, czego nie wolno Ci rozstrzygnąć samemu |
| Zgadywanie nazwy statusu trackera | Potwierdź `{{KOMENDA_ZRODLA_PRAWDY}}` przed użyciem, nie zgaduj |
| Wielolinijkowy opis/komentarz podany inline (`-m`/`-d`) | Treść przez plik — inline quoting rozwala markdown |
{{#JEŚLI oś 3 = zasób pisze do produkcji}}| Adresowanie zapisu do zasobu produkcyjnego lokalnym/testowym identyfikatorem | Ustal id przez odczyt po nazwie/identyfikatorze biznesowym, nigdy z lokalnej bazy |{{/JEŚLI}}
{{#JEŚLI oś 4 = potwierdzać wybór}}| Start zadania bez potwierdzenia wyboru | Krok 1 to STOP-bramka: 2–3 kandydatów, `AskUserQuestion`, dopiero potem status i praca |{{/JEŚLI}}
{{#JEŚLI oś 6 = twarda}}| Start zadania z niedomkniętym blokerem | Bramka zależności: sprawdź status blokera osobnym zapytaniem, weź następnego kandydata |{{/JEŚLI}}
{{#JEŚLI oś 8 = wymaga akceptacji}}| Auto-zamknięcie/auto-commit przed oceną użytkownika | STOP „oddaj do oceny": czekaj na jawną akceptację |{{/JEŚLI}}
{{#JEŚLI oś 9 = komentarz}}| Zamknięcie bez komentarza-podsumowania | Najpierw komentarz z wykonaną pracą, potem status zamykający |{{/JEŚLI}}
{{#JEŚLI oś 10 = wariant B}}| Zamknięcie zadania zaraz po commicie, bez pusha | Commit ≠ wdrożenie — push tylko na wyraźną prośbę, status zostaje do oceny |{{/JEŚLI}}
{{#JEŚLI oś 10 = wariant A}}| Pominięcie pushu po zamknięciu | Push to wymagany krok **po** zamknięciu w tym wariancie; bez `--force`, uważaj na sesje równoległe |{{/JEŚLI}}
{{#JEŚLI oś 11 = warstwy stałe}}| Zostawienie jednej z warstw „na osobne zadanie" | Wszystkie warstwy w tym samym zadaniu, albo jawne uzasadnienie, że nie dotyczy |{{/JEŚLI}}
{{#JEŚLI oś 12 = skrypt zbiorczy}}| Potraktowanie węższego skryptu jako bramy jakości | Bramą jest {{BRAMA_JAKOSCI}} — węższy skrypt to tylko szybka pętla |{{/JEŚLI}}
{{#JEŚLI oś 13 = wymagany}}| Zielone testy lokalnie potraktowane jako dowód wdrożenia | Dowodem jest stan „na żywo" — osobna STOP-bramka, nie brama jakości |{{/JEŚLI}}
{{#JEŚLI oś 14 = na wyraźną prośbę}}| Push „przy okazji", bez proszenia | Push = deploy — tylko na wyraźną prośbę |{{/JEŚLI}}
{{#JEŚLI oś 15 = praca w kilku sesjach}}| `git add -A` / `git reset` w środku pracy | Stage tylko własne pliki; bez reset — working tree współdzielone z inną sesją |{{/JEŚLI}}
{{#JEŚLI oś 16, pod-decyzja sprzątania = wymagane}}| Wiszące procesy/pliki tymczasowe po zakończeniu | Krok sprzątania: zamknij procesy własne, usuń pliki tymczasowe, nie commituj ich |{{/JEŚLI}}
````

## Reguły składania

Siedem reguł obowiązujących, gdy model w fazie 3 składa ten szablon w
konkretny plik `.claude/skills/next-task/SKILL.md` na podstawie odpowiedzi z
wywiadu (`references/interview.md`):

1. **Bloki `{{#JEŚLI oś N = wartość}} … {{/JEŚLI}}`, których warunek nie
   zachodzi, usuwasz razem z całą treścią.** Nie zostawiasz adnotacji „nie
   dotyczy", pustego nagłówka ani komentarza — nieaktywny blok wygląda tak,
   jakby w szablonie nigdy nie istniał.
2. **Sprzeczne pary osi rozstrzygasz jawnie, nie po cichu.** Odpowiedzi z
   różnych grup wywiadu mogą implikować wykluczające się instrukcje — para
   10×13 (dowód wymaga pusha, a wariant A odkłada push za zamknięcie) i para
   10×14 (wariant osi 10 zakłada inną politykę pusha niż oś 14) mają reguły
   w notkach przy odpowiednich krokach. **Gdy natrafisz na parę bez reguły:**
   nie wybieraj sam. Wypisz konflikt w szkicu fazy 2 i zapytaj, a rozstrzygnięcie
   wpisz do treści wygenerowanego kroku „STOP — ustalenia z użytkownikiem",
   żeby wykonawca skilla wiedział, że ta decyzja była świadoma.

3. **Po usunięciu bloków przenumeruj kroki workflow od 1** i zaktualizuj
   każde odwołanie w treści („patrz krok 6", „z kroku 11") **oraz** listę
   numerów STOP-bramek i kroków wymaganych w nagłówku sekcji „Workflow" —
   tę listę wypisujesz **na końcu**, dopiero gdy znasz finalną numerację, nie
   przed usuwaniem bloków. Wyjątek numeracji: krok pre-flight (oś 15) zostaje
   oznaczony `0.` i nie wchodzi w przenumerowanie „od 1" — reszta kroków
   zaczyna się od `1.` niezależnie od tego, czy krok `0.` jest obecny.
4. **Żaden znacznik szablonu nie może zostać w pliku wyjściowym** — dla
   walidatora (`scripts/validate-generated.js`) to błąd, nie ostrzeżenie.
   Dotyczy to markerów warunkowych i markerów `{{NAZWA}}`, które musisz
   podstawić realną wartością. Szablony Go w komendach `gh` (`{{.title}}`,
   `{{range .}}`) są treścią, nie znacznikiem — zostają.
5. **Nagłówki sekcji muszą trafiać w synonimy walidatora**
   (`references/pattern-anatomy.md`, sekcja „Zgodność z walidatorem"):
   `Overview`/`Przegląd`, `Kontekst`/`Context`/`Stałe`/`Constants`,
   `Workflow`/`Przepływ`, `Częste błędy`/`Common mistakes`/`Pitfalls`. Nie
   przeformułowuj tych nagłówków na synonimy spoza tej listy, nawet gdy
   brzmią naturalniej w danym języku.
6. **Akapity oznaczone `[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku]`
   wykonujesz i usuwasz w całości.** To instrukcje adresowane do Ciebie w
   trakcie składania (jak przenumerować, w jakiej kolejności ułożyć kroki
   domknięcia, ile wierszy musi mieć tabela błędów), a nie treść dla modelu
   wykonującego wygenerowany skill. Usuwasz razem ze znacznikiem — jedynym
   wyjątkiem jest fragment notki jawnie oznaczony „idzie do wyniku", który
   wplatasz w treść wskazanego kroku. Uzasadnienie: notka przepisana do
   `.claude/skills/next-task/SKILL.md` jest metaprozą, której model wykonujący
   skill i tak próbuje wykonać (dokładnie ten sam tryb awarii co adnotacja „nie
   dotyczy" z reguły 1), a notka nad sekcją „Workflow" niesie w sobie `{{...}}`,
   więc pozostawiona **wywala walidator**. W tym szablonie są trzy takie
   notki: pod nagłówkiem „Workflow" (numery bramek), nad krokiem commita
   (kolejność domknięcia z osi 10) i pod nim (pozycja bramki dowodu „na żywo" z
   osi 13). Walidator zgłasza też samo słowo `NOTKA` jako marker szablonu —
   notka bez `{{...}}` nie przechodzi już cicho do wyniku.
7. **Tabela „Częste błędy" ma w wyniku minimum 12 wierszy.** Sześć wierszy
   bazowych w szablonie i wiersze warunkowe (jedna wartość na oś) **nie muszą**
   same wystarczyć — przy rzadkiej konfiguracji (mało warunków trafia w `true`)
   dopisz dodatkowe wiersze **specyficzne dla tego projektu i trackera**: z
   pułapek w `references/tracker-clickup.md`/`tracker-github.md`, z rzeczy
   odkrytych w fazie 0 (nazwy komend, kształty JSON, brakujące narzędzia) i z
   konkretnych ustaleń wywiadu. Każdy dodany wiersz odnosi się do **konkretnej**
   pułapki tej konfiguracji — ogólnik typu „nie zapomnij przetestować" się nie
   liczy i nie wolno go dodawać dla samego dobicia do liczby (zasada pisania #6
   w `references/pattern-anatomy.md`). Uzasadnienie, dlaczego ta instrukcja jest
   tutaj, a nie w szablonie: wewnątrz ogrodzenia byłaby poleceniem dla modelu
   **wykonującego** wygenerowany skill, czyli kazałaby mu dopisywać wiersze do
   własnej tabeli pułapek w trakcie pracy nad zadaniem.

Dodatkowe wskazówki dla modelu składającego, nie osobne reguły:

- **Kolejność kroków 12–16 (commit/push/dowód/komentarz/zamknięcie)** jest
  parametrem, nie stałą — patrz notka nad krokiem 12 w szablonie. Warianty A
  i B z oś 10 różnią się **kolejnością**, nie treścią poszczególnych kroków;
  przełóż atomy kroków zamiast pisać je od nowa.
- **Łączenie sąsiednich, zawsze-wymaganych kroków w jeden krok z podpunktami**
  (np. commit+push jako jeden krok „Git", komentarz+zamknięcie jako jeden
  krok) jest dozwolonym wyborem stylistycznym, gdy tak wygląda w projekcie
  referencyjnym — bramki i warunki z tego szablonu obowiązują niezależnie od
  tego, czy trafiają w jeden numer kroku czy w dwa. Licz się z tym przy
  przenumerowaniu: liczba kroków w wygenerowanym pliku nie musi się zgadzać
  z liczbą bloków warunkowych w tym szablonie — to podział na numery, nie
  ubytek treści.
- **Pułapki trackera wpisujesz wprost w wynik, nigdy ich nie linkujesz.** Dwie–trzy
  pułapki faktycznie istotne dla wybranego trackera i kanału (z
  `references/tracker-clickup.md`, `references/tracker-github.md`, a dla
  pozostałych trackerów z tego, co potwierdziłeś komendą w fazie 0) trafiają
  **w treść** sekcji „Kontekst trackera" i w tabelę „Częste błędy"
  wygenerowanego pliku. Nie odsyłaj wygenerowanego skilla do plików
  `references/` tego pluginu: po fazie 5 plugin jest wyłączony i taki odnośnik
  przestaje być osiągalny, a skill ma zostać przenośny i samowystarczalny.
- **`{{#JEŚLI projekt jest repo git}} … {{/JEŚLI}}`** jest sprawdzany w fazie 0
  (sondowanie), nie w wywiadzie — praktycznie zawsze prawdziwy, ale
  wygenerowany plik nie zakłada tego bez sprawdzenia.
