const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const v = require('./validate-generated.js');

function fixture(dirName, fileBody) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cws-'));
  const dir = path.join(root, dirName);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'SKILL.md');
  fs.writeFileSync(file, fileBody);
  return file;
}

const GOOD_NEXT_TASK = `---
name: next-task
description: Use when the user invokes /next-task or asks to pick up the next task.
---

# Następne zadanie

## Overview

Zasada nadrzędna: nie zaczynasz pracy bez potwierdzenia.

## Kontekst ClickUp (stałe)

- list_id: 900000000001

## Workflow — bramki po kolei

Utwórz TODO na każdy krok.

1. Wybór zadania: \`cup task <id>\`

## Git

Stage tylko własne pliki.

## Częste błędy

| Błąd | Zamiast tego |
|------|--------------|
| Auto-zamknięcie | Czekaj na ocenę |
`;

test('parseFrontmatter wyciąga name i description', () => {
  const r = v.parseFrontmatter(GOOD_NEXT_TASK);
  assert.strictEqual(r.name, 'next-task');
  assert.match(r.description, /\/next-task/);
  assert.match(r.body, /## Overview/);
});

test('parseFrontmatter czyta wieloliniowy description (> i |)', () => {
  for (const style of ['>', '>-', '|']) {
    const text = `---\nname: next-task\ndescription: ${style}\n  Use when the user invokes /next-task\n  or asks for the next task.\n---\n\n## Overview\n`;
    const r = v.parseFrontmatter(text);
    assert.match(r.description, /\/next-task/, `styl ${style}`);
    assert.match(r.description, /next task\.$/, `styl ${style}`);
  }
});

test('parseFrontmatter zdejmuje cudzysłowy z wartości', () => {
  const r = v.parseFrontmatter('---\nname: "next-task"\ndescription: \'Use /next-task\'\n---\n');
  assert.strictEqual(r.name, 'next-task');
  assert.strictEqual(r.description, 'Use /next-task');
});

test('validateSkill: wieloliniowy description nie jest brakiem triggera', () => {
  const multi = GOOD_NEXT_TASK.replace(
    'description: Use when the user invokes /next-task or asks to pick up the next task.',
    'description: >\n  Use when the user invokes /next-task\n  or asks to pick up the next task.'
  );
  const r = v.validateSkill(fixture('next-task', multi));
  assert.deepStrictEqual(r.errors, []);
});

test('parseFrontmatter bez bloku --- nie rzuca, zwraca null-e', () => {
  const r = v.parseFrontmatter('# Sam nagłówek\n');
  assert.strictEqual(r.name, null);
  assert.strictEqual(r.description, null);
  assert.strictEqual(r.body, '# Sam nagłówek\n');
});

test('findTemplateMarkers NIE zgłasza <id> ani TODO', () => {
  const found = v.findTemplateMarkers(GOOD_NEXT_TASK);
  assert.deepStrictEqual(found, [], 'poprawny skill nie ma markerów');
});

test('findTemplateMarkers zgłasza {{ }} TBD FIXME z numerem linii', () => {
  const text = 'linia1\nlist_id: {{LIST_ID}}\nTBD\nFIXME później\n';
  const found = v.findTemplateMarkers(text);
  const markers = found.map((f) => f.marker).sort();
  assert.deepStrictEqual(markers, ['FIXME', 'TBD', '{{']);
  assert.strictEqual(found.find((f) => f.marker === '{{').line, 2);
  assert.strictEqual(found.find((f) => f.marker === 'TBD').line, 3);
  assert.strictEqual(found.find((f) => f.marker === 'FIXME').line, 4);
});

test('findTemplateMarkers zgłasza bloki warunkowe {{#JEŚLI}} i {{/JEŚLI}}', () => {
  const text = 'a\n{{#JEŚLI oś 4 = wybieraj sam}}tekst\n{{/JEŚLI}}\n';
  const found = v.findTemplateMarkers(text);
  assert.deepStrictEqual(found.map((f) => f.line), [2, 3]);
});

test('findTemplateMarkers NIE zgłasza szablonów Go w komendach gh', () => {
  const text = [
    "gh issue list --json number,title --template '{{range .}}{{.number}} {{.title}}{{\"\\n\"}}{{end}}'",
    "gh pr view 1 --template '{{ .title }}'",
  ].join('\n');
  assert.deepStrictEqual(v.findTemplateMarkers(text), []);
});

test('findTemplateMarkers zgłasza notkę dla składającego (bez {{ }})', () => {
  const text = [
    'linia1',
    '[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku] Tabela ma minimum 12 wierszy.',
    'linia3',
  ].join('\n');
  const found = v.findTemplateMarkers(text);
  assert.deepStrictEqual(found, [{ line: 2, marker: 'NOTKA/SKŁADAJĄCEGO' }]);
});

test('findTemplateMarkers łapie notkę także po samym słowie SKŁADAJĄCEGO', () => {
  const found = v.findTemplateMarkers('instrukcja dla SKŁADAJĄCEGO skill\n');
  assert.deepStrictEqual(found.map((f) => f.marker), ['NOTKA/SKŁADAJĄCEGO']);
});

test('validateSkill: pozostała notka dla składającego to błąd', () => {
  const bad = GOOD_NEXT_TASK.replace(
    '## Częste błędy',
    '## Częste błędy\n\n[NOTKA DLA SKŁADAJĄCEGO — nie trafia do wyniku] Dopisz wiersze.'
  );
  const file = fixture('next-task', bad);
  const r = v.validateSkill(file);
  assert.ok(
    r.errors.some((e) => /NOTKA/.test(e)),
    `oczekiwano błędu o notce dla składającego, dostano: ${JSON.stringify(r.errors)}`
  );
  assert.strictEqual(v.main([file]), 1);
});

test('findMissingSections na poprawnym next-task zwraca pustą listę', () => {
  const { body } = v.parseFrontmatter(GOOD_NEXT_TASK);
  assert.deepStrictEqual(v.findMissingSections(body, 'next-task'), []);
});

test('findMissingSections wykrywa brak tabeli częstych błędów', () => {
  const body = GOOD_NEXT_TASK.replace('## Częste błędy', '## Coś innego');
  assert.deepStrictEqual(v.findMissingSections(body, 'next-task'), ['mistakes']);
});

test('findMissingSections rozpoznaje angielskie synonimy nagłówków', () => {
  const body = `## Overview\n\n## Tracker context\n\n## Workflow\n\n## Common mistakes\n`;
  assert.deepStrictEqual(v.findMissingSections(body, 'next-task'), []);
});

test('add-task wymaga dodatkowo szablonu opisu', () => {
  const body = `## Overview\n\n## Kontekst\n\n## Workflow\n\n## Częste błędy\n`;
  assert.deepStrictEqual(v.findMissingSections(body, 'add-task'), ['template']);
  const withTpl = body + `\n## Szablon opisu\n`;
  assert.deepStrictEqual(v.findMissingSections(withTpl, 'add-task'), []);
});

test('findMissingTrackerCli ignoruje CLI poza zamkniętą listą', () => {
  const text = '```bash\nnarzedzie-ktorego-nie-ma --flag\n```\n';
  assert.deepStrictEqual(v.findMissingTrackerCli(text), []);
});

test('findMissingTrackerCli zgłasza brakujące CLI z listy', () => {
  const text = '```bash\nlinear issue list\n```\n';
  const missing = v.findMissingTrackerCli(text);
  assert.deepStrictEqual(missing, ['linear']);
});

test('findAxisLeaks zgłasza wyciek numeracji osi z numerem linii', () => {
  const found = v.findAxisLeaks('linia1\nBramę jakości określa oś 12: composer ci\n');
  assert.strictEqual(found.length, 1);
  assert.strictEqual(found[0].line, 2);
  assert.strictEqual(found[0].snippet, 'oś 12');
});

test('findAxisLeaks łapie odmianę "osi N"', () => {
  const found = v.findAxisLeaks('warstwy określa osi 11\n');
  assert.deepStrictEqual(found.map((f) => f.snippet), ['osi 11']);
});

test('findAxisLeaks NIE zgłasza "OS 24" ani "OSI 7"', () => {
  assert.deepStrictEqual(v.findAxisLeaks('Wymagany Ubuntu OS 24 i warstwa OSI 7\n'), []);
});

test('findAxisLeaks łapie odmianę z wielkiej litery "Oś 3"', () => {
  assert.deepStrictEqual(v.findAxisLeaks('Oś 3 mówi, że\n').map((f) => f.snippet), ['Oś 3']);
});

test('findAxisLeaks NIE zgłasza poprawnego skilla', () => {
  assert.deepStrictEqual(v.findAxisLeaks(GOOD_NEXT_TASK), []);
});

test('validateSkill: wyciek numeracji osi to błąd', () => {
  const bad = GOOD_NEXT_TASK.replace('Utwórz TODO na każdy krok.', 'Bramę określa oś 12.');
  const file = fixture('next-task', bad);
  const r = v.validateSkill(file);
  assert.ok(
    r.errors.some((e) => /numeracja osi/i.test(e)),
    `oczekiwano błędu o wycieku osi, dostano: ${JSON.stringify(r.errors)}`
  );
});

test('validateSkill: poprawny plik bez błędów', () => {
  const file = fixture('next-task', GOOD_NEXT_TASK);
  const r = v.validateSkill(file);
  assert.deepStrictEqual(r.errors, []);
});

test('validateSkill: name musi zgadzać się z nazwą katalogu', () => {
  const file = fixture('add-task', GOOD_NEXT_TASK);
  const r = v.validateSkill(file);
  assert.ok(
    r.errors.some((e) => /katalog/i.test(e)),
    `oczekiwano błędu o rozjeździe z katalogiem, dostano: ${JSON.stringify(r.errors)}`
  );
});

test('validateSkill: description bez triggera to błąd', () => {
  const bad = GOOD_NEXT_TASK.replace(
    'description: Use when the user invokes /next-task or asks to pick up the next task.',
    'description: Robi rzeczy z zadaniami.'
  );
  const file = fixture('next-task', bad);
  const r = v.validateSkill(file);
  assert.ok(
    r.errors.some((e) => /trigger/i.test(e)),
    `oczekiwano błędu o triggerze, dostano: ${JSON.stringify(r.errors)}`
  );
});

test('validateSkill: pozostały marker szablonu to błąd', () => {
  const bad = GOOD_NEXT_TASK.replace('900000000001', '{{LIST_ID}}');
  const file = fixture('next-task', bad);
  const r = v.validateSkill(file);
  assert.ok(
    r.errors.some((e) => /\{\{/.test(e)),
    `oczekiwano błędu o markerze, dostano: ${JSON.stringify(r.errors)}`
  );
});

test('validateSkill: nieznany katalog skilla dostaje ostrzeżenie i nie sprawdza sekcji', () => {
  const body = `---
name: some-other-skill
description: Use when the user invokes /some-other-skill or asks to do custom stuff.
---

# Coś innego

Brak standardowych sekcji next-task/add-task.
`;
  const file = fixture('some-other-skill', body);
  const r = v.validateSkill(file);
  assert.ok(
    r.warnings.some((w) => /nieznany typ skilla/i.test(w)),
    `oczekiwano ostrzeżenia o nieznanym typie skilla, dostano: ${JSON.stringify(r.warnings)}`
  );
  assert.ok(
    r.errors.every((e) => !/brak wymaganej sekcji/i.test(e)),
    `nie oczekiwano błędów o brakujących sekcjach, dostano: ${JSON.stringify(r.errors)}`
  );
});

test('validateSkill: plik ktory nie istnieje nie rzuca, zwraca blad odczytu', () => {
  const missing = path.join(os.tmpdir(), `cws-nieistniejacy-${Date.now()}`, 'SKILL.md');
  let r;
  assert.doesNotThrow(() => {
    r = v.validateSkill(missing);
  });
  assert.deepStrictEqual(r.errors, ['nie da sie odczytac pliku']);
  assert.deepStrictEqual(r.warnings, []);
});

test('validateSkill: kompletny brak bloku frontmatter przez validateSkill', () => {
  const body = `# Sam nagłówek bez frontmatter\n\n## Overview\n`;
  const file = fixture('next-task', body);
  const r = v.validateSkill(file);
  assert.ok(
    r.errors.includes('brak bloku frontmatter (---)'),
    `oczekiwano błędu o braku frontmatter, dostano: ${JSON.stringify(r.errors)}`
  );
});

test('main zwraca 0 dla poprawnego pliku i 1 dla wadliwego', () => {
  const ok = fixture('next-task', GOOD_NEXT_TASK);
  assert.strictEqual(v.main([ok]), 0);
  const bad = fixture('next-task', GOOD_NEXT_TASK.replace('900000000001', '{{LIST_ID}}'));
  assert.strictEqual(v.main([bad]), 1);
});

test('main bez argumentów zwraca 2', () => {
  assert.strictEqual(v.main([]), 2);
});
