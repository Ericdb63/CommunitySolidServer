// Checks that the chaînges test Pod server behaves as expected.
// Run while the server is running:   node chainges/check.mjs
// Uses only the made-up test accounts from seed-accounts.json.
import { readFileSync } from 'node:fs';
import { Session } from '@inrupt/solid-client-authn-node';

const BASE = process.env.CSS_BASE ?? 'http://localhost:3000/';
const seeds = JSON.parse(readFileSync(new URL('./seed-accounts.json', import.meta.url)));
const passwordOf = (name) => seeds.find((s) => s.pods?.[0]?.name === name).password;
const webIdOf = (name) => `${BASE}${name}/profile/card#me`;

// Signs in as a test person using a client-credentials token (no browser needed).
async function signIn(name) {
  const index = await (await fetch(`${BASE}.account/`)).json();
  const login = await fetch(index.controls.password.login, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: `${name}@example.com`, password: passwordOf(name) }),
  });
  const { authorization } = await login.json();
  const auth = { authorization: `CSS-Account-Token ${authorization}` };
  const { controls } = await (await fetch(`${BASE}.account/`, { headers: auth })).json();
  const token = await fetch(controls.account.clientCredentials, {
    method: 'POST',
    headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ name: `check-${name}`, webId: webIdOf(name) }),
  });
  const { id, secret } = await token.json();
  const session = new Session();
  await session.login({ clientId: id, clientSecret: secret, oidcIssuer: BASE });
  return session;
}

let failures = 0;
function expect(label, actual, wanted) {
  const ok = actual === wanted;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  (got ${actual}, expected ${wanted})`);
}

const file = `${BASE}marguerite/chainge/check.json`;
const marguerite = await signIn('marguerite');
const nadia = await signIn('nadia');

const put = await marguerite.fetch(file, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ check: true }),
});
expect('Owner can save a file in her Pod', put.ok, true);
expect('Owner can read it back', (await marguerite.fetch(file)).status, 200);
expect('Someone not signed in is refused', (await fetch(file)).status, 401);
expect('Another family member is refused until given access', (await nadia.fetch(file)).status, 403);
expect('Top folder of the Pod is private', (await fetch(`${BASE}marguerite/`)).status, 401);
expect('Profile (WebID) is public, as sign-in needs', (await fetch(`${BASE}marguerite/profile/card`)).status, 200);

await marguerite.fetch(file, { method: 'DELETE' });
await marguerite.logout();
await nadia.logout();

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
