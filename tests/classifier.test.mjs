// Run with `npm test` (Node's built-in runner, no dependencies).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../src/lib/classifier.js';

const type = (s) => classify(s).type;
const lang = (s) => {
  const d = classify(s);
  assert.equal(d.type, 'source_code', `not code: ${s.slice(0, 40)}`);
  return d.language;
};

test('URLs: scheme, query strings and www. forms', () => {
  assert.equal(type('https://example.com'), 'url');
  assert.equal(type('  https://example.com/a/b?q=1&x=%20y#top  '), 'url');
  assert.equal(type('http://localhost:8000/api'), 'url');
  assert.equal(type('www.example.com'), 'url');
  assert.equal(type('www.example.co.uk/path?x=1'), 'url');
  assert.notEqual(type('example'), 'url');
  assert.notEqual(type('https://nohost'), 'url');
  assert.notEqual(type('see https://example.com for details'), 'url');
});

test('Emails, with or without mailto:', () => {
  assert.equal(type('name@example.com'), 'email');
  assert.equal(type('mailto:first.last+tag@sub.example.vn'), 'email');
  assert.notEqual(type('name@localhost'), 'email');
  assert.notEqual(type('@handle'), 'email');
});

test('Phones need evidence, not just digits', () => {
  assert.equal(type('0905123456'), 'phone');
  assert.equal(type('+84905123456'), 'phone');
  assert.equal(type('+84 905 123 456'), 'phone');
  assert.equal(type('(415) 555-0123'), 'phone');
  assert.equal(type('+1 (415) 555-0123'), 'phone');
  // Arbitrary numbers are not phone numbers.
  assert.notEqual(type('1234567890'), 'phone');
  assert.notEqual(type('20261031'), 'phone');
  assert.notEqual(type('00000000'), 'phone');
  assert.notEqual(type('42'), 'phone');
  assert.notEqual(type('3.14159265'), 'phone');
});

test('JSON: objects and arrays only', () => {
  assert.equal(type('{"a": 1, "b": [true, null]}'), 'json');
  assert.equal(type('[1, 2, 3]'), 'json');
  assert.equal(type('{\n  "name": "Zerethon"\n}'), 'json');
  assert.notEqual(type('42'), 'json');
  assert.notEqual(type('"just a string"'), 'json');
  assert.notEqual(type('{ not: json }'), 'json');
  // Valid JSON is JSON even though it is also "code-like".
  assert.equal(classify('{"function": "def x():"}').type, 'json');
});

test('Base64: decodes to readable text, not words or hex digests', () => {
  assert.equal(type(Buffer.from('Hello, Zerethon! Xin chào').toString('base64')), 'base64');
  assert.equal(type('eyJhbGciOiJIUzI1NiJ9'), 'base64');
  assert.notEqual(type('d41d8cd98f00b204e9800998ecf8427e'), 'base64'); // md5 hex
  assert.notEqual(type('Supercalifragilistic'), 'base64');
  assert.notEqual(type('abcdefghijklmnopqrst'), 'base64');
});

const SAMPLES = {
  javascript: `import fs from 'node:fs';\nconst read = (p) => fs.readFileSync(p, 'utf8');\nconsole.log(read('a.txt'));`,
  typescript: `interface User {\n  id: number;\n  name: string;\n}\nexport const greet = (u: User): string => \`Hi \${u.name}\`;`,
  php: `<?php\nnamespace App\\Services;\n\nuse Illuminate\\Support\\Str;\n\nclass Greeter {\n    public function hello(string $name): string { return "Hi $name"; }\n}`,
  python: `from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n\ndef norm(p):\n    return (p.x ** 2) ** 0.5\n\nif __name__ == "__main__":\n    print(norm(Point(3)))`,
  java: `package com.example;\n\nimport java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hi");\n    }\n}`,
  c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    char *s = malloc(8);\n    printf("%s", s);\n    free(s);\n    return 0;\n}`,
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> v{1, 2};\n    cout << v.size() << endl;\n}`,
  csharp: `using System;\n\nnamespace Demo\n{\n    public class Person { public string Name { get; set; } }\n    class Program { static void Main() { Console.WriteLine("Hi"); } }\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    x := 42\n    fmt.Println(x)\n}`,
  rust: `use std::collections::HashMap;\n\nfn main() {\n    let mut m = HashMap::new();\n    m.insert("a", 1);\n    println!("{:?}", m);\n}`,
  sql: `SELECT u.id, u.name, COUNT(o.id) AS orders\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE u.active = 1\nGROUP BY u.id\nORDER BY orders DESC;`,
  html: `<!DOCTYPE html>\n<html>\n<head><title>Hi</title></head>\n<body><div class="box"><p>Hello</p></div></body>\n</html>`,
  css: `.card {\n  display: flex;\n  padding: 1rem;\n  border-radius: 8px;\n}\n@media (max-width: 600px) {\n  .card { padding: 0.5rem; }\n}`,
  bash: `#!/usr/bin/env bash\nset -euo pipefail\nfor f in *.log; do\n  grep -c ERROR "$f" | sort\ndone`,
};

for (const [expected, code] of Object.entries(SAMPLES)) {
  test(`Source code: ${expected}`, () => {
    assert.equal(lang(code), expected);
    assert.ok(classify(code).confidence >= 0.6);
  });
}

test('Short or ambiguous snippets are code without a claimed language', () => {
  const d = classify('x = foo(y);\nz = bar(x);\nreturn z;');
  assert.equal(d.type, 'source_code');
  assert.equal(d.language, undefined);
  assert.ok(d.confidence < 0.6);
});

test('Plain text stays text, Vietnamese included', () => {
  assert.equal(type('Hello world, this is a sentence.'), 'text');
  assert.equal(type('Xin chào, đây là một đoạn văn bản tiếng Việt có dấu.'), 'text');
  assert.equal(type('Select a plan from the list where it says Pro.'), 'text');
  assert.equal(type('Meeting at 10:30 — bring the report (draft v2).'), 'text');
});

test('Empty selection is unknown', () => {
  assert.equal(type(''), 'unknown');
  assert.equal(type('   \n\t'), 'unknown');
});

test('Very long selections classify quickly', () => {
  const big = 'lorem ipsum dolor sit amet '.repeat(40_000); // ~1 MB
  const started = performance.now();
  assert.equal(type(big), 'text');
  assert.ok(performance.now() - started < 500);
});

test('Lower-case SQL with real structure is still SQL', () => {
  assert.equal(lang('select id, name from users where id = 1;'), 'sql');
});
