import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../../../../');

const readPkg = (relPath: string) => {
  const pkgPath = join(ROOT, relPath);
  return JSON.parse(readFileSync(pkgPath, 'utf-8'));
};

const readDoc = (relPath: string) => {
  const docPath = join(ROOT, relPath);
  return readFileSync(docPath, 'utf-8');
};

const readDocIfExists = (relPath: string): string => {
  const docPath = join(ROOT, relPath);
  return existsSync(docPath) ? readFileSync(docPath, 'utf-8') : '';
};

const rootPkg = readPkg('package.json');
const apiPkg = readPkg('apps/api/package.json');
const webPkg = readPkg('apps/web/package.json');
const adminPkg = readPkg('apps/admin/package.json');

const readme = readDoc('README.md');
const baseStandards = readDoc('docs/base-standards.md');
const frontendStandards = readDoc('docs/frontend-standards.md');
const configYaml = readDoc('openspec/config.yaml');
const nvmrc = readDocIfExists('.nvmrc');
const ciWorkflow = readDocIfExists('.github/workflows/ci.yml');
const deployWorkflow = readDocIfExists('.github/workflows/deploy.yml');

const openspecVersionRoot = rootPkg.devDependencies['@fission-ai/openspec'];
const astroVersionWeb = webPkg.dependencies.astro;

/**
 * Scans a YAML text (line-by-line, no parser) and returns true only if the
 * given top-level field has real, non-commented content. Returns false if the
 * field is absent, empty, or its content is only whitespace or commented lines.
 *
 * Limits: does not parse YAML semantics; relies on indentation structure.
 * Suitable for the flat config.yaml used by this project.
 */
const hasPopulatedField = (yamlText: string, field: string): boolean => {
  const lines = yamlText.split('\n');
  const fieldRegex = new RegExp(`^(\\s*)${field}:\\s*(\\|\\s*|>\\s*|\\s*$)`);

  let startIndex = -1;
  let baseIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(fieldRegex);
    if (match) {
      startIndex = i;
      baseIndent = match[1].length;
      break;
    }
  }

  if (startIndex === -1) {
    return false;
  }

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      continue;
    }
    const lineIndent = line.match(/^\s*/)?.[0].length ?? 0;
    if (lineIndent <= baseIndent) {
      break;
    }
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return true;
    }
  }

  return false;
};

/**
 * Detects whether a text prohibits SSR, in English or Spanish, case-insensitive.
 * Covers: prohibido/prohibida, forbidden, not allowed, no permitido,
 * must not, and "no SSR".
 */
const prohibitsSsr = (text: string): boolean => {
  const patterns: RegExp[] = [
    /prohib[ií][doa]?.*ssr/i,
    /ssr.*prohib[ií][doa]?/i,
    /ssr.*forbidden/i,
    /forbidden.*ssr/i,
    /ssr.*not allowed/i,
    /not allowed.*ssr/i,
    /no permitido.*ssr/i,
    /ssr.*no permitido/i,
    /must not.*ssr/i,
    /ssr.*must not/i,
    /no ssr/i,
  ];
  return patterns.some((p) => p.test(text));
};

/**
 * Detects whether a text imposes a blanket prohibition on Node/hosting
 * adapters (Node, Vercel, Cloudflare) WITHOUT excepting @astrojs/node.
 * Returns true only when a prohibition is stated and no exception for
 * @astrojs/node is present.
 */
const prohibitsNodeAdapter = (text: string): boolean => {
  const prohibitionWords = /prohib[ií][doa]?|forbidden|not allowed|no permitido|must not|ban|prohibit|eliminado|❌/i;
  const adapterProhibition = /\badapters?\b/i.test(text) &&
    /\b(node|vercel|cloudflare)\b/i.test(text) &&
    prohibitionWords.test(text);
  const astroNodeException = /@astrojs\/node/i.test(text);
  return adapterProhibition && !astroNodeException;
};

/**
 * Detects whether a text imposes a blanket prohibition on Firebase that does
 * NOT distinguish firebase-admin (server SDK) from the Firebase client SDK
 * (firebase/auth, firebase/app). Returns true only when a blanket
 * prohibition is stated and no such distinction is present.
 */
const prohibitsFirebaseClientSdk = (text: string): boolean => {
  const prohibitionWords = /prohib[ií][doa]?|forbidden|not allowed|no permitido|must not|ban|prohibit|eliminado|❌/i;
  const firebaseProhibition = /\bfirebase\b/i.test(text) && prohibitionWords.test(text);
  const distinguishes = /\bfirebase-admin\b/i.test(text) ||
    /firebase\/auth/i.test(text) ||
    /firebase\/app/i.test(text) ||
    /client\s*sdk/i.test(text);
  return firebaseProhibition && !distinguishes;
};

/**
 * Detects whether a text contains a test count assertion (e.g. "N tests
 * green"). Used to assert config.yaml does NOT embed stale test counts.
 */
const containsTestCount = (text: string): boolean => {
  return /\d+\s*tests?\s*(green|passing|total)/i.test(text);
};

describe('Anti-drift: documentation versions match package.json', () => {

  it('README declares the correct OpenSpec version matching root package.json', () => {
    expect(readme).toContain(`OpenSpec ${openspecVersionRoot.replace('^', '')}`);
  });

  it('README declares the correct Astro and Node versions matching package.json', () => {
    expect(readme).toContain(`Astro ${astroVersionWeb.replace('^', '')}`);
    expect(rootPkg.engines.node).toBe('>=26.13.1');
    expect(readme).toMatch(/Node\.js\**\s*>=\s*26\.13\.1/);
  });

  it('docs/base-standards.md does not reference Prisma in the API stack', () => {
    expect(baseStandards).not.toMatch(/Prisma/);
  });

  it('docs/base-standards.md lists firebase-admin for Firestore', () => {
    expect(baseStandards).toMatch(/firebase-admin/);
  });

  it('docs/base-standards.md lists @supabase/supabase-js for Supabase', () => {
    expect(baseStandards).toMatch(/@supabase\/supabase-js/);
  });

  it('docs/frontend-standards.md and docs/base-standards.md declare the correct Astro version', () => {
    expect(frontendStandards).toContain(`Astro ${astroVersionWeb.replace('^', '')}`);
    expect(baseStandards).toContain(`Astro ${astroVersionWeb.replace('^', '')}`);
  });

  it('docs/frontend-standards.md does not prohibit SSR (apps/admin uses output: server by design)', () => {
    expect(prohibitsSsr(frontendStandards)).toBe(false);
  });

  it('docs/frontend-standards.md does not prohibit Node adapter blanket (excepts @astrojs/node)', () => {
    expect(prohibitsNodeAdapter(frontendStandards)).toBe(false);
  });

  it('docs/frontend-standards.md does not prohibit Firebase client SDK blanket (distinguishes firebase-admin)', () => {
    expect(prohibitsFirebaseClientSdk(frontendStandards)).toBe(false);
  });

  it('docs/frontend-standards.md documents @astrojs/node adapter exception for admin SSR', () => {
    expect(frontendStandards).toMatch(/@astrojs\/node/);
  });

  it('docs/frontend-standards.md prohibits firebase-admin specifically in frontends, not client SDK', () => {
    expect(frontendStandards).toMatch(/firebase-admin/);
    expect(frontendStandards).not.toMatch(/❌ Usar Firebase \/ Firebase admin/);
  });

  it('apps/api/package.json does not duplicate the OpenSpec devDependency', () => {
    expect(apiPkg.devDependencies['@fission-ai/openspec']).toBeUndefined();
  });

  it('root package.json keeps OpenSpec as the single source', () => {
    expect(openspecVersionRoot).toBeDefined();
  });

  it('openspec/project.md exists and runtime config pins Node 26.13.1', () => {
    expect(existsSync(join(ROOT, 'openspec', 'project.md'))).toBe(true);
    expect(rootPkg.engines.node).toBe('>=26.13.1');
    expect(nvmrc.trim()).toBe('26.13.1');
    expect(ciWorkflow).toContain('node-version: 26');
    expect(deployWorkflow).toContain('node-version: 26');
    expect(adminPkg.dependencies.astro).toBe(astroVersionWeb);
    expect(adminPkg.devDependencies['@astrojs/node']).toBe('^11.1.14');
  });

  it('openspec/config.yaml has a populated context field', () => {
    expect(hasPopulatedField(configYaml, 'context')).toBe(true);
  });

  it('openspec/config.yaml has a populated rules field', () => {
    expect(hasPopulatedField(configYaml, 'rules')).toBe(true);
  });

  it('openspec/config.yaml does not contain stale test counts', () => {
    expect(containsTestCount(configYaml)).toBe(false);
  });

});

describe('Pure helper: hasPopulatedField', () => {

  it('returns false when field is absent', () => {
    expect(hasPopulatedField('schema: spec-driven\n', 'context')).toBe(false);
  });

  it('returns false when field is empty', () => {
    expect(hasPopulatedField('context:\n', 'context')).toBe(false);
  });

  it('returns false when field content is only comments', () => {
    const yaml = `context: |
  # This is just a comment
  # Another commented line
`;
    expect(hasPopulatedField(yaml, 'context')).toBe(false);
  });

  it('returns true when field has real non-commented content', () => {
    const yaml = `context: |
  Monorepo WebAstro project
  Stack: NestJS 11
`;
    expect(hasPopulatedField(yaml, 'context')).toBe(true);
  });

  it('returns true for rules field with real content', () => {
    const yaml = `rules:
  proposal:
    - "Keep proposals short"
`;
    expect(hasPopulatedField(yaml, 'rules')).toBe(true);
  });

});

describe('Pure helper: prohibitsSsr', () => {

  it('detects "prohibido SSR" (Spanish)', () => {
    expect(prohibitsSsr('SSR está prohibido')).toBe(true);
  });

  it('detects "SSR prohibido" (Spanish)', () => {
    expect(prohibitsSsr('SSR prohibido')).toBe(true);
  });

  it('detects "SSR forbidden"', () => {
    expect(prohibitsSsr('SSR forbidden')).toBe(true);
  });

  it('detects "forbidden SSR"', () => {
    expect(prohibitsSsr('forbidden SSR')).toBe(true);
  });

  it('detects "SSR not allowed"', () => {
    expect(prohibitsSsr('SSR not allowed')).toBe(true);
  });

  it('detects "not allowed SSR"', () => {
    expect(prohibitsSsr('not allowed SSR')).toBe(true);
  });

  it('detects "no permitido SSR" (Spanish)', () => {
    expect(prohibitsSsr('no permitido SSR')).toBe(true);
  });

  it('detects "SSR no permitido" (Spanish)', () => {
    expect(prohibitsSsr('SSR no permitido')).toBe(true);
  });

  it('detects "must not SSR"', () => {
    expect(prohibitsSsr('must not SSR')).toBe(true);
  });

  it('detects "SSR must not"', () => {
    expect(prohibitsSsr('SSR must not')).toBe(true);
  });

  it('detects "no SSR"', () => {
    expect(prohibitsSsr('no SSR')).toBe(true);
  });

  it('returns false when SSR is mentioned without prohibition', () => {
    expect(prohibitsSsr('SSR is used for server-side rendering')).toBe(false);
    expect(prohibitsSsr('The SSR output is enabled')).toBe(false);
    expect(prohibitsSsr('output: server enables SSR')).toBe(false);
  });

});

describe('Pure helper: prohibitsNodeAdapter', () => {

  it('detects blanket adapter prohibition without @astrojs/node exception', () => {
    expect(prohibitsNodeAdapter('❌ Añadir adapters (Node, Vercel, Cloudflare)')).toBe(true);
    expect(prohibitsNodeAdapter('Adapters (Node, Vercel, Cloudflare) are forbidden')).toBe(true);
  });

  it('returns false when @astrojs/node exception is present', () => {
    expect(prohibitsNodeAdapter('❌ Añadir adapters (Vercel, Cloudflare); @astrojs/node excepted')).toBe(false);
    expect(prohibitsNodeAdapter('No adapters except @astrojs/node for admin SSR')).toBe(false);
  });

  it('returns false when adapter is mentioned without prohibition', () => {
    expect(prohibitsNodeAdapter('apps/admin uses @astrojs/node adapter by design')).toBe(false);
    expect(prohibitsNodeAdapter('The @astrojs/node adapter enables SSR')).toBe(false);
  });

  it('returns false when no adapter is mentioned', () => {
    expect(prohibitsNodeAdapter('Tailwind utility-first strategy')).toBe(false);
  });

});

describe('Pure helper: prohibitsFirebaseClientSdk', () => {

  it('detects blanket Firebase prohibition without firebase-admin distinction', () => {
    expect(prohibitsFirebaseClientSdk('❌ Usar Firebase / Firebase admin (eliminado en v1.7)')).toBe(true);
    expect(prohibitsFirebaseClientSdk('Firebase is forbidden')).toBe(true);
  });

  it('returns false when distinction between firebase-admin and client SDK is present', () => {
    expect(prohibitsFirebaseClientSdk('firebase-admin (server SDK) prohibited in frontend; firebase client SDK allowed')).toBe(false);
    expect(prohibitsFirebaseClientSdk('No firebase-admin in frontend; firebase/auth is the login mechanism')).toBe(false);
  });

  it('returns false when Firebase is mentioned without prohibition', () => {
    expect(prohibitsFirebaseClientSdk('Firebase Auth is used for authentication')).toBe(false);
    expect(prohibitsFirebaseClientSdk('firebase-admin connects to Firestore')).toBe(false);
  });

  it('returns false when no Firebase is mentioned', () => {
    expect(prohibitsFirebaseClientSdk('Tailwind utility-first strategy')).toBe(false);
  });

});
