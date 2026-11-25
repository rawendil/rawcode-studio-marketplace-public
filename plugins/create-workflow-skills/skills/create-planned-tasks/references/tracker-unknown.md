# Nieznany system zadań — rozpoznanie

Ten plik czyta model w **fazie 0** `/create-planned-tasks`, gdy sondowanie nie
znalazło znanego kanału (CLI, MCP, plik backlogu) albo gdy w wywiadzie
użytkownik wybierze „inny system". Cel: ustalić **z danych**, jak czytać
otwarte zadania, zanim cokolwiek trafi do wywiadu albo do skryptu.

Generator nie zakłada, jak „zwykle" wyglądają trackery. Arkusz, własne API,
Notion, Trello, YouTrack, plik w innym repo, eksport CSV — każdy ma inne
pojęcie zadania, statusu i rodzica.

## 1. Pytanie otwarte

Jedno pytanie, bez opcji do kliknięcia:

> „Gdzie trzymasz zadania tego projektu i jak się do nich dostać? Nazwa
> systemu, link do dokumentacji API albo eksportu, i jak się logujesz (token,
> CLI, plik)."

Gdy odpowiedź wskazuje znany system (ClickUp, GitHub, Jira…), wróć do jego
cheatsheetu z `create-workflow-skills/references/`.

## 2. Rozpoznanie z dokumentacji

- Gdy w sesji są WebFetch/WebSearch — przeczytaj dokumentację endpointu
  listującego zadania: parametry zakresu, stronicowanie (P1), filtr stanu
  (P2), podzadania (P4), limity (P9), uwierzytelnienie.
- Bez dostępu do sieci — poproś użytkownika o fragment dokumentacji albo
  przykładową odpowiedź.
- Zapisz w notatkach, co dokumentacja **twierdzi** — to hipoteza do
  potwierdzenia, nie ustalenie.

## 3. Jedno wywołanie odczytowe

Wywołaj **jeden** odczyt, który ma trafić do skryptu, na małym zakresie, i
pokaż użytkownikowi kształt odpowiedzi. Potwierdź na danych, które pole jest:

| Potrzebne | Przykładowe nazwy |
|---|---|
| identyfikator i link | `id`, `key`, `number`, `url`, `permalink` |
| tytuł | `name`, `title`, `summary` |
| stan otwarty/zamknięty | `status.type`, `state`, `statusCategory`, `closed`, `done` |
| priorytet | `priority`, etykieta, pole własne |
| termin | `due`, `due_date`, `deadline` |
| rodzic | `parent`, `parent_id`, `epic` |
| miejsce | lista, projekt, tablica, arkusz |

Pole, którego system nie ma, odpada z wywiadu (np. brak rodzica → oś
podzadań nie pada).

## 4. Czego nie robić

- Nie zgadywać endpointów ani nazw pól z innych systemów.
- **Nie wywoływać niczego zapisującego „na próbę"** — także endpointów, które
  „tylko sprawdzają", jeśli dokumentacja opisuje je jako zmianę stanu.
- Nie prosić o wklejenie tokenu do rozmowy. Token idzie do zmiennej
  środowiskowej albo konfiguracji CLI; skrypt czyta go stamtąd.
- Nie kończyć rozpoznania bez potwierdzenia pola stanu (P2) — to od niego
  zależy, czy przegląd pokaże zamknięte zadania.

## 5. Plik jako tracker

Gdy zadania leżą w pliku (Markdown, CSV, YAML, arkusz eksportowany do pliku):

- ustal, co jest zadaniem (punkt listy, wiersz, nagłówek), co oznacza
  zamknięcie (`[x]`, przekreślenie, sekcja „Zrobione", kolumna stanu) i co
  priorytet/termin — **na przykładach z pliku**, pokazanych użytkownikowi;
- kontrola krzyżowa w fazie 4: zliczenie `grep` niezależne od parsera
  skryptu.
