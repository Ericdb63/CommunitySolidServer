# chaînges test Pod server

This branch (`chainges`) of our Community Solid Server fork adds a ready-to-run test server for
chaînges. `main` stays identical to the original; use **Sync fork** on GitHub to pull in their
fixes, then merge `main` into `chainges`.

**Test data only.** Every account here is made up (the sample Bell family). Never put a real
family's information in this server.

## Start it

Needs Node.js 18 or newer. On Node 23 or newer the script runs the server on Node 22, because the
server crashed on Node 26 in our first test (16 November 2026).

```bash
./chainges/start.sh            # http://localhost:3000, keeps data between runs
./chainges/start.sh --fresh    # wipe everything and start over from the test accounts
```

The first run installs and builds the server, which takes a few minutes. Stop it with Ctrl+C.
Data is kept in `chainges/data` (not in Git).

## Check it

With the server running, in a second terminal:

```bash
node chainges/check.mjs
```

It signs in as two test people and confirms: the owner can save and read her files; someone not
signed in is refused; another family member is refused until given access; the Pod's top folder
is private; the profile (WebID) is public, as sign-in needs.

## What we changed from the original server

| File | Change | Why |
| --- | --- | --- |
| `templates/pod/wac/.acl.hbs` | Removed the rule that lets anyone list a Pod's top folder | For family records even folder names are private |
| `chainges/` | This folder: start script, test accounts, checks | Ready-to-run test server for chaînges |

Keep this table up to date: it is what to check when merging updates from the original.

**Expected test failures.** The private top folder makes 9 of the original's integration tests
fail (in `Accounts`, `DynamicPods`, `SeedingPods` and `Subdomains`), because they check that
anyone can open a Pod's top folder. All 2,424 unit tests and the other integration tests pass
(24 November 2026). The original's pre-commit hook runs the full suite, so commits on this branch
use `git commit --no-verify` after checking that only these 9 fail.

## Test accounts

All share the test password in `seed-accounts.json`. Each person has their own Pod and WebID.

| Person (sample family) | Role in the demo | Pod | WebID |
| --- | --- | --- | --- |
| Marguerite Bell | The parent; owns the family record | `http://localhost:3000/marguerite/` | `http://localhost:3000/marguerite/profile/card#me` |
| Nadia Bell | Daughter, primary caregiver | `http://localhost:3000/nadia/` | `http://localhost:3000/nadia/profile/card#me` |
| Marcus Bell | Backup contact | `http://localhost:3000/marcus/` | `http://localhost:3000/marcus/profile/card#me` |
| Yvette Bell | Documents and bills | `http://localhost:3000/yvette/` | `http://localhost:3000/yvette/profile/card#me` |
| Joan Ferrer | Friend, wellness checks | `http://localhost:3000/joan/` | `http://localhost:3000/joan/profile/card#me` |
| Denise Okafor | Paid home aide | `http://localhost:3000/denise/` | `http://localhost:3000/denise/profile/card#me` |

Sign in with the email address (for example `marguerite@example.com`) on the server's login page.

## Use it with chaînges

```bash
# terminal 1, in this repo
./chainges/start.sh

# terminal 2, in the Chainges repo, branch solid-test
pnpm dev                        # http://localhost:3002/app
```

In the app, under "Experimental", set the Pod provider to `http://localhost:3000` and sign in as
Marguerite. The record is saved to `http://localhost:3000/marguerite/chainge/record.json`.

## Why each person has a Pod

Stage 2 of the Solid evaluation gives the care circle real permissions: Marguerite's record
grants Nadia, Yvette and the others access by their WebID. Signing in as a second person shows
what they can and cannot see.
