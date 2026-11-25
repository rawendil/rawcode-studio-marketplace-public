# Katalog pułapek odczytu — przegląd zadań

Ten plik czyta model w **fazie 3** `/create-planned-tasks`, zanim napisze
skrypt (albo komendy) dla wygenerowanego `planned-tasks`. Każda pułapka
sprawia, że przegląd **wygląda poprawnie, a kłamie** — gubi zadania, pokazuje
zamknięte albo przesuwa terminy. Żadna nie rzuca błędu, dlatego walidator ich
nie złapie.

Pułapki są niezależne od systemu zadań. Dla **każdej** model składający
zapisuje w notatkach fazy 3 jedno z dwojga:

- **jak skrypt ją obsługuje w tym systemie** (konkretne pole, parametr, pętla),
- **dlaczego nie dotyczy** (np. „plik w repo nie ma stronicowania").

Pułapka bez odpowiedzi to niedokończona faza 3. Dwie–trzy pułapki istotne dla
wybranego systemu trafiają **wprost** do tabeli „Częste błędy" wygenerowanego
skilla — bez identyfikatora `P…` (wygenerowany skill nie zna tego pliku).

Przykłady oznaczone „Przykład" pochodzą z realnych przypadków; nie są
konfiguracją domyślną.

---

### P1 — stronicowanie i limity wyniku

- **Objaw:** przegląd ma równo 30, 50, 100 pozycji; nowsze albo starsze zadania
  „zniknęły".
- **Przyczyna:** API i CLI oddają pierwszą stronę wyniku bez ostrzeżenia.
- **Jak sprawdzić:** w dokumentacji albo odpowiedzi szukaj `page`, `cursor`,
  `next`, `hasNextPage`, `last_page`, nagłówka `Link`; w CLI — domyślnego
  `--limit`. Czytaj do końca, nie do pierwszej strony.
- **Przykład:** `gh issue list` bez `--limit` zwraca 30 issues; ClickUp
  `/list/{id}/task` zwraca stronę z polem `last_page`.

### P2 — zamknięty status rozpoznany po nazwie zamiast po typie albo stanie

- **Objaw:** w przeglądzie są zadania anulowane, odrzucone, „won't do".
- **Przyczyna:** filtr po nazwach (`!= "closed"`) albo zaufanie fladze API, która
  odsiewa tylko część zamkniętych typów. Nazwy statusów są per projekt i
  zmieniają się; typ/stan (`open`/`closed`, kategoria statusu) — nie.
- **Jak sprawdzić:** odpytaj listę statusów **z typami** (kategorią); odsiewaj
  po typie. Sprawdź na danych, czy flaga „bez zamkniętych" naprawdę usuwa
  wszystkie zamknięte typy.
- **Przykład:** ClickUp z `include_closed=false` zwraca status `canceled` typu
  `done`; Jira — kategoria statusu `Done` obejmuje różne nazwy.

### P3 — zadania zarchiwizowane i ukryte

- **Objaw:** przegląd pokazuje martwe pozycje albo pomija całe listy.
- **Przyczyna:** archiwum bywa domyślnie włączone w jednym endpointcie, a
  wyłączone w innym; zarchiwizowana lista albo projekt wciąż ma „otwarte"
  zadania.
- **Jak sprawdzić:** parametr `archived` przy pobieraniu kontenerów i zadań;
  ustal z użytkownikiem, czy archiwum się liczy (zwykle nie).

### P4 — podzadania poza domyślnym odczytem

- **Objaw:** przegląd ma mniej pozycji niż widok w trackerze; podzadania nie
  istnieją.
- **Przyczyna:** API zwraca domyślnie tylko zadania główne; podzadania są pod
  osobnym parametrem albo innym API.
- **Jak sprawdzić:** porównaj liczbę z widokiem trackera z rozwiniętymi
  podzadaniami; szukaj `subtasks`, `parent`, `subIssues`, `children`.
- **Przykład:** ClickUp — `subtasks=true`; GitHub — sub-issues tylko w GraphQL.

### P5 — podzadanie zamkniętego (albo niewidocznego) rodzica

- **Objaw:** otwarte podzadanie znika z przeglądu, bo jego rodzic jest
  zamknięty albo leży poza zakresem.
- **Przyczyna:** przegląd buduje drzewo tylko z rodziców obecnych w wyniku i
  gubi sieroty.
- **Jak sprawdzić:** podzadanie, którego rodzica nie ma w wyniku, pokazuj samo,
  z dopiskiem (np. „podzadanie zamkniętego zadania").

### P6 — to samo zadanie w kilku miejscach

- **Objaw:** zadanie pojawia się w przeglądzie dwa razy.
- **Przyczyna:** tracker pozwala, by zadanie należało do kilku list albo
  projektów naraz; przegląd po zakresie zbiera je z każdej.
- **Jak sprawdzić:** deduplikuj po identyfikatorze zadania.
- **Przykład:** ClickUp — „Tasks in Multiple Lists"; GitHub — issue w kilku
  Projects.

### P7 — strefa czasowa i termin całodniowy

- **Objaw:** termin w przeglądzie przesunięty o dzień; „po terminie" zapala się
  rano w dniu terminu albo nie zapala się wcale.
- **Przyczyna:** znacznik czasu w UTC wyświetlony bez strefy; termin całodniowy
  (bez godziny) zapisany jako północ UTC.
- **Jak sprawdzić:** ustal strefę (systemowa albo z konfiguracji) i to, czy
  termin ma godzinę (flaga typu `due_date_time`); termin całodniowy porównuj
  jako datę, nie chwilę.

### P8 — znaki psujące tabelę Markdown

- **Objaw:** rozjechana tabela, ucięty tytuł, kolumny przesunięte.
- **Przyczyna:** `|`, nowe linie, backticki w tytułach zadań.
- **Jak sprawdzić:** escapuj `|` jako `\|`, zamieniaj nowe linie na spację.

### P9 — limity zapytań

- **Objaw:** przegląd działa na małym projekcie, a na dużym kończy się błędem
  429 albo pustą częścią wyniku.
- **Przyczyna:** jedno zapytanie na listę i stronę; limit API na minutę.
- **Jak sprawdzić:** limit z dokumentacji; przy 429 — czytelny błąd z nazwą
  limitu, nie cichy pusty wynik. Nie zapętlaj ponowień bez końca.

### P10 — pusty wynik mylony z brakiem dostępu

- **Objaw:** „Brak otwartych zadań", choć token wygasł albo nie ma uprawnień do
  listy.
- **Przyczyna:** API zwraca pustą listę albo 404 zamiast 401/403 dla
  niedostępnych zasobów; skrypt traktuje to jak zero zadań.
- **Jak sprawdzić:** sprawdzaj kod odpowiedzi i kształt danych; pusty wynik dla
  zakresu, który na pewno ma zadania, w kontroli krzyżowej fazy 4 to sygnał
  błędu dostępu. Błąd dostępu kończy skrypt kodem ≠ 0 z podpowiedzią.
