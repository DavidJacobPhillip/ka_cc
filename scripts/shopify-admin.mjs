#!/usr/bin/env node
/**
 * Admin API helper for the things the Shopify CLI can't do: pages and navigation.
 *
 * The CLI only manages themes. Pages and menus are store data, so they need the
 * Admin GraphQL API and credentials from an app created in the Dev Dashboard
 * (dev.shopify.com). Admin-created custom apps were retired on 2026-01-01, so
 * there's no permanent token any more: the client id/secret are exchanged for a
 * 24h token on each run via the client credentials grant. Nothing long-lived
 * ends up on disk, which is the happier outcome anyway.
 *
 * Nothing here writes unless you pass --apply. Without it every command prints
 * the plan and exits, so you can see exactly what would hit the live store -
 * there's no staging store to rehearse against.
 *
 * Nothing here deletes. Pages that already exist are reported and skipped
 * rather than overwritten.
 *
 *   node scripts/shopify-admin.mjs check            # verify the token, list what exists
 *   node scripts/shopify-admin.mjs pages            # dry run
 *   node scripts/shopify-admin.mjs pages --apply    # create the missing pages
 *   node scripts/shopify-admin.mjs menu             # dry run
 *   node scripts/shopify-admin.mjs menu --apply     # rewrite main-menu
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const CMD = process.argv[2];

/* ---------------------------------------------------------------- config -- */

function loadEnv() {
  let raw = '';
  try {
    raw = readFileSync(join(ROOT, '.env'), 'utf8');
  } catch {
    fail(
      'No .env found.\n' +
        '  Copy .env.example to .env and add your Dev Dashboard credentials.\n' +
        '  (.env is gitignored - it will not be committed.)'
    );
  }
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  if (!env.SHOPIFY_STORE) fail('SHOPIFY_STORE is missing from .env');
  env.SHOPIFY_API_VERSION ||= '2026-07';

  const hasStatic = env.SHOPIFY_ADMIN_TOKEN && !env.SHOPIFY_ADMIN_TOKEN.includes('xxxx');
  const hasClient =
    env.SHOPIFY_CLIENT_ID &&
    env.SHOPIFY_CLIENT_SECRET &&
    !env.SHOPIFY_CLIENT_ID.includes('xxxx') &&
    !env.SHOPIFY_CLIENT_SECRET.includes('xxxx');

  if (!hasStatic && !hasClient) {
    fail(
      'No usable credentials in .env.\n' +
        '  Set either:\n' +
        '    SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET  (Dev Dashboard app - preferred)\n' +
        '    SHOPIFY_ADMIN_TOKEN                        (legacy admin-created custom app)'
    );
  }
  env._mode = hasClient ? 'client_credentials' : 'static_token';
  return env;
}

/**
 * Dev Dashboard apps don't hand out a permanent token any more - you exchange
 * the client id/secret for one that lasts 24h. That's minted fresh on each run,
 * so nothing long-lived is ever written to disk.
 *
 * Only works when the app and the store are in the same Shopify organization,
 * which is the case here (it's Santosh's own store).
 */
async function mintToken(env) {
  const res = await fetch(`https://${env.SHOPIFY_STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const reason =
      body.match(/<title>([^<]+)<\/title>/)?.[1] ??
      body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    fail(
      `Could not exchange client credentials for a token (HTTP ${res.status}).\n` +
        `  ${reason}\n\n` +
        '  Common causes:\n' +
        '    - the app is not installed on this store yet\n' +
        '    - client id/secret belong to a different organization\n' +
        `    - SHOPIFY_STORE is wrong (currently ${env.SHOPIFY_STORE})`
    );
  }
  const json = await res.json();
  if (!json.access_token) fail(`No access_token in response: ${JSON.stringify(json)}`);
  const hours = Math.round((json.expires_in ?? 0) / 3600);
  console.log(c.dim(`  (minted a ${hours}h token via client credentials)`));
  return json.access_token;
}

/**
 * The pages to create. `template` is the theme template's suffix, i.e.
 * templates/page.our-story.json -> 'our-story'. Handle drives the URL.
 */
const PAGES = [
  { handle: 'our-story', title: 'Our Story', template: 'our-story' },
  { handle: 'brew-guide', title: 'Brew Guide', template: 'brew-guide' },
  { handle: 'visit-us', title: 'Visit Us', template: 'visit-us' },
];

/**
 * The nav, mirroring the labels already in the header. Anything still pointing
 * at a page that doesn't exist is left commented in the notes rather than
 * silently linking to the homepage, which is the current bug.
 */
const MENU = {
  handle: 'main-menu',
  title: 'Main menu',
  items: [
    {
      title: 'shop',
      type: 'HTTP',
      url: '/collections/all',
      items: [
        { title: 'chai', type: 'HTTP', url: '/collections/all' },
        { title: 'coffee', type: 'HTTP', url: '/collections/all' },
      ],
    },
    {
      title: 'locations',
      type: 'HTTP',
      url: '/pages/visit-us',
      items: [{ title: 'farmers markets', type: 'HTTP', url: '/pages/visit-us' }],
    },
    { title: 'catering', type: 'HTTP', url: '/pages/contact' },
    {
      title: 'explore',
      type: 'HTTP',
      url: '/pages/brew-guide',
      items: [
        { title: 'how to make chai', type: 'HTTP', url: '/pages/brew-guide' },
        { title: 'our story', type: 'HTTP', url: '/pages/our-story' },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ util -- */

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function fail(msg) {
  console.error(`\n${c.red('✗')} ${msg}\n`);
  process.exit(1);
}

async function gql(env, query, variables = {}) {
  const res = await fetch(
    `https://${env.SHOPIFY_STORE}/admin/api/${env.SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env._token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (res.status === 401 || res.status === 403) {
    fail(
      `Store rejected the token (HTTP ${res.status}).\n` +
        '  The app must be installed on this store, and granted the scopes it needs:\n' +
        '    write_content (or write_online_store_pages)  - pages\n' +
        '    write_online_store_navigation                - menus'
    );
  }
  if (res.status === 404) {
    fail(
      `404 from the Admin API.\n  Check SHOPIFY_STORE (currently ${env.SHOPIFY_STORE})\n` +
        `  and SHOPIFY_API_VERSION (currently ${env.SHOPIFY_API_VERSION}).`
    );
  }
  if (!res.ok) fail(`Admin API returned HTTP ${res.status}: ${await res.text()}`);

  const json = await res.json();
  if (json.errors) fail(`GraphQL error: ${JSON.stringify(json.errors, null, 2)}`);
  return json.data;
}

function userErrors(payload, label) {
  const errs = payload?.userErrors ?? [];
  if (errs.length) {
    console.log(`  ${c.red('✗')} ${label}`);
    for (const e of errs) console.log(`      ${e.field?.join('.') ?? ''} ${e.message}`);
    return true;
  }
  return false;
}

/* -------------------------------------------------------------- commands -- */

async function check(env) {
  const data = await gql(
    env,
    `{ shop { name myshopifyDomain }
       pages(first: 50) { nodes { handle title templateSuffix } }
       menus(first: 20) { nodes { handle title items { title url } } } }`
  );

  console.log(`\n${c.bold('Store')}  ${data.shop.name}  ${c.dim(data.shop.myshopifyDomain)}`);
  console.log(`${c.bold('API')}    ${env.SHOPIFY_API_VERSION}\n`);

  console.log(c.bold('Pages'));
  if (!data.pages.nodes.length) console.log(c.dim('  (none)'));
  for (const p of data.pages.nodes) {
    console.log(`  /pages/${p.handle}${p.templateSuffix ? c.dim(`  [page.${p.templateSuffix}]`) : ''}`);
  }

  console.log(`\n${c.bold('Menus')}`);
  for (const m of data.menus.nodes) {
    console.log(`  ${m.handle} ${c.dim(`(${m.items.length} items)`)}`);
    for (const i of m.items) {
      const dead = i.url?.replace(/^https?:\/\/[^/]+/, '') === '/';
      console.log(`      ${i.title.padEnd(20)} ${dead ? c.red(i.url) : i.url}`);
    }
  }
  console.log();
}

async function pages(env) {
  const existing = await gql(env, `{ pages(first: 100) { nodes { handle } } }`);
  const have = new Set(existing.pages.nodes.map((p) => p.handle));

  const todo = PAGES.filter((p) => !have.has(p.handle));
  const skip = PAGES.filter((p) => have.has(p.handle));

  for (const p of skip) console.log(`  ${c.dim('skip')}   /pages/${p.handle} ${c.dim('(exists)')}`);
  for (const p of todo) console.log(`  ${c.yellow('create')} /pages/${p.handle}  -> page.${p.template}`);
  if (!todo.length) return console.log(`\n${c.green('✓')} Nothing to create.\n`);

  if (!APPLY) return console.log(`\n${c.dim('Dry run. Re-run with --apply to create these.')}\n`);

  for (const p of todo) {
    const d = await gql(
      env,
      `mutation($page: PageCreateInput!) {
         pageCreate(page: $page) {
           page { handle templateSuffix }
           userErrors { field message }
         } }`,
      {
        page: {
          title: p.title,
          handle: p.handle,
          templateSuffix: p.template,
          isPublished: true,
        },
      }
    );
    if (!userErrors(d.pageCreate, `/pages/${p.handle}`)) {
      console.log(`  ${c.green('✓')} created /pages/${p.handle}`);
    }
  }
  console.log();
}

async function menu(env) {
  const data = await gql(env, `{ menus(first: 20) { nodes { id handle } } }`);
  const existing = data.menus.nodes.find((m) => m.handle === MENU.handle);

  const show = (items, depth = 1) => {
    for (const i of items) {
      console.log(`  ${'    '.repeat(depth)}${i.title.padEnd(20)} ${i.url}`);
      if (i.items) show(i.items, depth + 1);
    }
  };
  console.log(`\n  ${existing ? c.yellow('update') : c.yellow('create')} ${MENU.handle}`);
  show(MENU.items);

  if (!APPLY) return console.log(`\n${c.dim('Dry run. Re-run with --apply to write this.')}\n`);

  const d = existing
    ? await gql(
        env,
        `mutation($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
           menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
             menu { handle } userErrors { field message } } }`,
        { id: existing.id, title: MENU.title, handle: MENU.handle, items: MENU.items }
      )
    : await gql(
        env,
        `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
           menuCreate(title: $title, handle: $handle, items: $items) {
             menu { handle } userErrors { field message } } }`,
        { title: MENU.title, handle: MENU.handle, items: MENU.items }
      );

  const payload = existing ? d.menuUpdate : d.menuCreate;
  if (!userErrors(payload, MENU.handle)) console.log(`\n  ${c.green('✓')} ${MENU.handle} written\n`);
}

/* ------------------------------------------------------------------ main -- */

const COMMANDS = { check, pages, menu };

if (!COMMANDS[CMD]) {
  console.log(`
${c.bold('Usage')}  node scripts/shopify-admin.mjs <command> [--apply]

  check    Verify the token and list the store's pages and menus
  pages    Create the pages the theme has templates for
  menu     Point main-menu at real URLs

${c.dim('Without --apply every command is a dry run.')}
`);
  process.exit(COMMANDS[CMD] === undefined && CMD ? 1 : 0);
}

const env = loadEnv();
if (!APPLY && CMD !== 'check') console.log(c.dim('\n(dry run)'));
env._token =
  env._mode === 'client_credentials' ? await mintToken(env) : env.SHOPIFY_ADMIN_TOKEN;
await COMMANDS[CMD](env);
