#!/usr/bin/env node
/**
 * Walidacja wygenerowanych SKILL.md (next-task / add-task).
 * Uzycie: node validate-generated.js <SKILL.md> [<SKILL.md>...]
 * Wyjscie: 0 = zielone (ostrzezenia dozwolone), 1 = blad, 2 = zle uzycie.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const TRACKER_CLI = ['cup', 'gh', 'jira', 'linear'];

// Synonimy PL/EN — nagłówek zależy od języka dokumentacji projektu,
// więc dopasowanie jest po fragmencie, bez rozróżniania wielkości liter.
const SECTIONS = {
  overview: ['overview', 'przegląd'],
  tracker: ['kontekst', 'context', 'stałe', 'constants'],
  workflow: ['workflow', 'przepływ'],
  mistakes: ['częste błędy', 'common mistakes', 'pitfalls'],
  template: ['szablon opisu', 'description template', 'task template'],
};

const REQUIRED = {
  'next-task': ['overview', 'tracker', 'workflow', 'mistakes'],
  'add-task': ['overview', 'tracker', 'workflow', 'mistakes', 'template'],
};

function unquote(value) {
  const m = /^(["'])(.*)\1$/.exec(value);
  return m ? m[2] : value;
}

// Minimalny parser YAML dla name/description: wartosc w linii (z cudzyslowami
// lub bez) albo blok wieloliniowy `>` / `|` (z modyfikatorami -/+), czytany
// do pierwszej linii bez wciecia.
function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { name: null, description: null, body: text };
  const out = { name: null, description: null, body: text.slice(m[0].length) };
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const kv = /^(name|description):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    const raw = kv[2].trim();
    const block = /^([>|])[-+]?$/.exec(raw);
    if (!block) {
      out[kv[1]] = unquote(raw);
      continue;
    }
    const parts = [];
    while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1].trim() === '')) {
      parts.push(lines[++i].trim());
    }
    out[kv[1]] = parts.join(block[1] === '>' ? ' ' : '\n').trim();
  }
  return out;
}

function findTemplateMarkers(text) {
  const patterns = [
    // Znaczniki szablonow pluginu: {{NAZWA_WIELKIMI}}, {{#JEŚLI ...}}, {{/JEŚLI}}.
    // Szablony Go w komendach gh ({{range .}}, {{.title}}) sa legalna trescia
    // wygenerowanego skilla — zaczynaja sie mala litera albo kropka.
    { marker: '{{', re: /\{\{\s*[#/]?[A-ZĄĆĘŁŃÓŚŹŻ]/ },
    { marker: 'TBD', re: /\bTBD\b/ },
    { marker: 'FIXME', re: /\bFIXME\b/ },
    // Notka dla skladajacego z szablonow references/template-*.md. Bez {{ }}
    // przechodzila walidacje i trafiala do wygenerowanego skilla, gdzie model
    // wykonujacy probuje ja wykonac. Dopasowanie wielkoscia liter — zwykle
    // polskie slowo "notka" w tresci skilla nie jest bledem.
    { marker: 'NOTKA/SKŁADAJĄCEGO', re: /NOTKA|SKŁADAJĄCEGO/ },
  ];
  const found = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const p of patterns) {
      if (p.re.test(line)) found.push({ line: i + 1, marker: p.marker });
    }
  });
  return found;
}

// Numeracja osi wywiadu jest wewnetrzna dla generatora. W wygenerowanym skillu
// odwolanie w rodzaju "os 11" nic nie znaczy — to wyciek prozy adresowanej do
// modelu skladajacego. Polskie formy "oś"/"osi"/"osie" (pierwsza litera
// dowolnej wielkosci, reszta mala) oraz "os" bez ogonka pisane malymi
// literami — "OS 24" czy "OSI 7" to nie wyciek.
function findAxisLeaks(text) {
  const re = /(?<![\p{L}\p{N}])(?:[oO](?:ś|si|sie)|os)\s+\d{1,2}(?!\d)/u;
  const found = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const m = re.exec(line);
    if (m) found.push({ line: i + 1, snippet: m[0] });
  });
  return found;
}

function findMissingSections(body, kind) {
  const headings = (body.match(/^#{2,4}\s+.*$/gm) || []).map((h) => h.toLowerCase());
  return (REQUIRED[kind] || []).filter(
    (key) => !SECTIONS[key].some((syn) => headings.some((h) => h.includes(syn)))
  );
}

function bashBlocks(text) {
  const out = [];
  const re = /```(?:bash|sh|shell)\r?\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

function findMissingTrackerCli(text) {
  const body = bashBlocks(text).join('\n');
  const used = TRACKER_CLI.filter((cli) =>
    new RegExp(`(^|[\\s|(&;$])${cli}\\s`, 'm').test(body)
  );
  return used.filter((cli) => {
    try {
      execFileSync('command', ['-v', cli], { shell: '/bin/bash', stdio: 'ignore' });
      return false;
    } catch {
      return true;
    }
  });
}

function validateSkill(filePath) {
  const res = { file: filePath, errors: [], warnings: [] };
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    res.errors.push('nie da sie odczytac pliku');
    return res;
  }

  const dirName = path.basename(path.dirname(filePath));
  const fm = parseFrontmatter(text);

  if (fm.name === null && fm.description === null) {
    res.errors.push('brak bloku frontmatter (---)');
  }
  if (!fm.name) res.errors.push('frontmatter bez pola name');
  else if (fm.name !== dirName) {
    res.errors.push(`name "${fm.name}" nie zgadza sie z katalogiem "${dirName}"`);
  }

  if (!fm.description) res.errors.push('frontmatter bez pola description');
  else if (fm.name && !fm.description.includes(`/${fm.name}`)) {
    res.errors.push(`description bez triggera "/${fm.name}"`);
  }

  for (const mk of findTemplateMarkers(text)) {
    res.errors.push(`pozostal marker szablonu "${mk.marker}" w linii ${mk.line}`);
  }

  for (const ax of findAxisLeaks(text)) {
    res.errors.push(
      `wyciekla numeracja osi wywiadu ("${ax.snippet}") w linii ${ax.line}`
    );
  }

  if (REQUIRED[dirName]) {
    for (const key of findMissingSections(fm.body, dirName)) {
      res.errors.push(`brak wymaganej sekcji: ${key} (synonimy: ${SECTIONS[key].join(', ')})`);
    }
  } else {
    res.warnings.push(`nieznany typ skilla "${dirName}" — pomijam kontrole sekcji`);
  }

  for (const cli of findMissingTrackerCli(text)) {
    res.warnings.push(`skill uzywa "${cli}", ktorego nie ma w PATH`);
  }

  const lines = text.split(/\r?\n/).length;
  if (lines > 500) {
    res.warnings.push(`${lines} linii — rozwaz przeniesienie szczegolow do references/`);
  }

  return res;
}

function main(argv) {
  if (argv.length === 0) {
    console.error('Uzycie: validate-generated.js <SKILL.md> [<SKILL.md>...]');
    return 2;
  }
  let failed = false;
  for (const file of argv) {
    const r = validateSkill(file);
    const status = r.errors.length ? 'BLAD' : 'OK';
    console.log(`\n[${status}] ${r.file}`);
    for (const e of r.errors) console.log(`  x ${e}`);
    for (const w of r.warnings) console.log(`  ! ${w}`);
    if (r.errors.length) failed = true;
  }
  console.log(failed ? '\nWalidacja nieudana.' : '\nWalidacja zielona.');
  return failed ? 1 : 0;
}

module.exports = {
  parseFrontmatter,
  findTemplateMarkers,
  findMissingSections,
  findAxisLeaks,
  findMissingTrackerCli,
  validateSkill,
  main,
  TRACKER_CLI,
  SECTIONS,
  REQUIRED,
};

if (require.main === module) process.exit(main(process.argv.slice(2)));
