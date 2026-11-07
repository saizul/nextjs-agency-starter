# Contributing

Thanks for taking the time to improve this starter. Bug reports, documentation fixes and focused feature ideas are all welcome.

## Getting set up

```bash
git clone <your-fork-url>
cd nextjs-agency-starter
cp .env.example .env.local
npm install
npm run dev
```

Node.js 20.9 or newer is required (CI runs on Node 20 and 22).

## Before you open a pull request

Run the same checks as CI:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Optionally run the browser smoke tests after a production build:

```bash
npx playwright install chromium
npm run build && npm run test:e2e
```

## Guidelines

- Keep changes small and focused. One topic per pull request.
- Add or update unit tests for anything in `src/lib` or `src/i18n`.
- Every user-facing string lives in `src/dictionaries/en.json` **and** `src/dictionaries/bn.json`. A test fails if the keys diverge.
- Keep the UI accessible: semantic HTML, labelled controls, visible focus and sufficient contrast in both themes.
- Do not add UI kits or heavy runtime dependencies. This starter intentionally stays light.
- Use original sample copy and the placeholder brand "Acme Digital". Do not commit real client names, photos you do not own or secrets.
- Format with Prettier (`npm run format`). Content in `content/` is excluded from formatting.

## Commit messages

Use short, imperative subjects, for example `Add pagination to tag pages`. Reference an issue number when there is one.

## Reporting security issues

Please do not open a public issue for vulnerabilities. Contact the maintainer through the website listed in `package.json` instead.
