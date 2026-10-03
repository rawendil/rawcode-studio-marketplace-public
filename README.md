# rawcode-studio-marketplace-public
Publiczny marketplace skilli i pluginów Claude Code prezentujący warsztat RawCode Studio w pracy z AI — gotowe do zainstalowania i przetestowania.

## Instalacja marketplace

```bash
/plugin marketplace add rawendil/rawcode-studio-marketplace-public
```

## Pluginy

### create-workflow-skills

Generator dwóch skilli workflow — `/next-task` (prowadzenie zadania od wyboru do zamknięcia) i `/add-task` (tworzenie kompletnego zadania w trackerze) — dopasowanych do konkretnego projektu. Przeprowadza wywiad o tracker zadań (ClickUp, GitHub Issues i inne), statusy, definicję ukończenia, politykę git i metodykę pracy (superpowers, bez zewnętrznych skilli albo własny workflow), a potem zapisuje oba skille do `.claude/skills/` projektu. Plugin jednorazowy: po weryfikacji wyłączasz go, wygenerowane skille zostają.

```bash
/plugin install create-workflow-skills@rawcode-studio-marketplace-public
```

Szczegóły: [`plugins/create-workflow-skills/README.md`](plugins/create-workflow-skills/README.md)

---

**RawCode Studio** — https://rawcodestudio.net
