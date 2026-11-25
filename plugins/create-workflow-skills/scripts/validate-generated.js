#!/usr/bin/env node
/**
 * Walidacja wygenerowanych SKILL.md (next-task / add-task / planned-tasks).
 * Uzycie: node validate-generated.js <SKILL.md> [<SKILL.md>...]
 * Dla planned-tasks sprawdza tez skrypt wskazany w bloku bash obok SKILL.md.
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
  'planned-tasks': ['overview', 'tracker', 'workflow', 'mistakes'],
};

// Kontrola skladni bez uruchamiania, wg rozszerzenia skryptu. Python przez
// ast.parse, nie py_compile — bez __pycache__ w katalogu skilla projektu.
const SYNTAX_CHECKS = {
  '.js': ['node', (f) => ['--check', f]],
  '.cjs': ['node', (f) => ['--check', f]],
  '.mjs': ['node', (f) => ['--check', f]],
  '.py': ['python3', (f) => ['-c', 'import ast,sys;ast.parse(open(sys.argv[1]).read())', f]],
  '.php': ['php', (f) => ['-l', f]],
  '.sh': ['bash', (f) => ['-n', f]],
  '.bash': ['bash', (f) => ['-n', f]],
};

// Literaly wygladajace na sekrety. Token w kodzie albo w tresci skilla
// trafia do repo projektu — zawsze blad.
const TOKEN_PATTERNS = [
  { kind: 'ClickUp', re: /\bpk_\d+_[A-Z0-9]{20,}/ },
  { kind: 'GitHub', re: /\bgh[pousr]_[A-Za-z0-9]{30,}/ },
  { kind: 'GitHub', re: /\bgithub_pat_[A-Za-z0-9_]{30,}/ },
  { kind: 'Linear', re: /\blin_api_[A-Za-z0-9]{20,}/ },
  { kind: 'Slack', re: /\bxox[bpa]-[A-Za-z0-9-]{10,}/ },
  { kind: 'Bearer', re: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
];

// Metoda HTTP, ktora bywa zapisem — ostrzezenie, bo POST bywa odczytem
// (GraphQL, wyszukiwanie). `gh api` z polami (-f/-F/--input) domyslnie wysyla POST.
const WRITE_METHODS = [
  /['"](put|patch|delete|post)['"]/i,
  /-X\s*(PUT|PATCH|DELETE|POST)\b/i,
  /--method[ =](PUT|PATCH|DELETE|POST)\b/i,
  /\bgh\s+api\b.*\s(-f|-F|--field|--raw-field|--input)\b/,
];

// Podkomendy CLI trackerow, ktore zawsze zapisuja — blad w skilla tylko do odczytu.
const WRITE_COMMANDS = [
  /\bgh\s+(issue|pr)\s+(create|edit|close|reopen|comment|delete|lock|unlock|transfer|pin|unpin|develop|merge|review|ready)\b/,
  /\bgh\s+(label|project)\s+(create|edit|delete|item-add|item-edit|item-delete|item-archive)\b/,
  /\bcup\s+(update|create|comment|comment-edit|comment-delete|reply|assign|depend|link|attach|move|field|delete|archive|tag|checklist|time|duplicate|bulk|merge|favorite|[a-z]+-(create|update|delete|rename|edit))\b/,
];

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
  return used.filter((cli) => !hasCommand(cli));
}

// Sciezka skryptu w calej tresci SKILL.md (blok bez jezyka, inline code,
// podkatalog skilla), nie tylko w blokach bash.
function findScriptRefs(text) {
  const re = /\.claude\/skills\/planned-tasks\/((?:[\w-]+\/)*[\w.-]+\.[A-Za-z0-9]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== 'SKILL.md' && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

function hasCommand(cmd) {
  try {
    execFileSync('command', ['-v', cmd], { shell: '/bin/bash', stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkScriptSyntax(scriptPath, has = hasCommand) {
  const name = path.basename(scriptPath);
  const check = SYNTAX_CHECKS[path.extname(scriptPath).toLowerCase()];
  if (!check) return { ok: true, warning: `nie znam kontroli skladni dla ${name}` };
  const [cmd, args] = check;
  if (!has(cmd)) return { ok: true, warning: `brak "${cmd}" w PATH — pomijam skladnie ${name}` };
  try {
    execFileSync(cmd, args(scriptPath), { stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true };
  } catch (e) {
    const out = `${e.stderr || ''}${e.stdout || ''}`.trim().split(/\r?\n/).find((l) => l.trim()) || 'blad';
    return { ok: false, error: `blad skladni ${name}: ${out.trim()}` };
  }
}

function matchLines(text, patterns) {
  const found = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const re of patterns) {
      const m = re.exec(line);
      if (m) {
        found.push({ line: i + 1, snippet: m[0].trim() });
        return;
      }
    }
  });
  return found;
}

function findWriteMethods(text) {
  return matchLines(text, WRITE_METHODS);
}

function findWriteCommands(text) {
  return matchLines(text, WRITE_COMMANDS);
}

function skillFiles(dir, prefix = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix + e.name;
    if (e.isDirectory()) out.push(...skillFiles(path.join(dir, e.name), rel + '/'));
    else if (e.isFile() && rel !== 'SKILL.md') out.push(rel);
  }
  return out;
}

function findTokenLiterals(text) {
  const found = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const t of TOKEN_PATTERNS) {
      if (t.re.test(line)) found.push({ line: i + 1, kind: t.kind });
    }
  });
  return found;
}

function validateScripts(text, skillDir, res) {
  for (const tok of findTokenLiterals(text)) {
    res.errors.push(`token (${tok.kind}) wpisany w SKILL.md w linii ${tok.line}`);
  }
  for (const w of findWriteCommands(bashBlocks(text).join('\n'))) {
    res.errors.push(`komenda zapisujaca "${w.snippet}" w SKILL.md — skill jest tylko do odczytu`);
  }
  // Tokeny w kazdym pliku katalogu skilla, takze niewskazanym w SKILL.md.
  for (const rel of skillFiles(skillDir)) {
    let body;
    try {
      body = fs.readFileSync(path.join(skillDir, rel), 'utf8');
    } catch {
      continue;
    }
    for (const tok of findTokenLiterals(body)) {
      res.errors.push(`token (${tok.kind}) wpisany w ${rel} w linii ${tok.line}`);
    }
  }
  for (const name of findScriptRefs(text)) {
    const scriptPath = path.join(skillDir, name);
    let script;
    try {
      script = fs.readFileSync(scriptPath, 'utf8');
    } catch {
      res.errors.push(`brak skryptu ${name} obok SKILL.md`);
      continue;
    }
    const syntax = checkScriptSyntax(scriptPath);
    if (syntax.error) res.errors.push(syntax.error);
    if (syntax.warning) res.warnings.push(syntax.warning);
    for (const w of findWriteMethods(script)) {
      res.warnings.push(
        `${name}:${w.line} metoda ${w.snippet} — potwierdz, ze to odczyt (np. GraphQL)`
      );
    }
    for (const w of findWriteCommands(script)) {
      res.errors.push(`komenda zapisujaca "${w.snippet}" w ${name}:${w.line} — skrypt jest tylko do odczytu`);
    }
  }
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

  if (dirName === 'planned-tasks') validateScripts(text, path.dirname(filePath), res);

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
  findScriptRefs,
  checkScriptSyntax,
  findWriteMethods,
  findWriteCommands,
  findTokenLiterals,
  validateSkill,
  main,
  TRACKER_CLI,
  SECTIONS,
  REQUIRED,
};

if (require.main === module) process.exit(main(process.argv.slice(2)));
