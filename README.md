# CargoClear

A bilingual air-cargo document review and learning project. Built by a cargo operations learner, with AI assistance, to invite practical feedback from colleagues.

## Why this exists

Repeated arrival checks are a useful starting point for learning Python and automation. CargoClear keeps the work small: capture a document, compare entered details, record differences and let a person review the result.

## Try it

[Open the live CargoClear practice site](https://cargo-clear-grace.menakod.chatgpt.site/)

The public preview is for **fictional practice data only**. Every visitor gets a separate browser workspace. A cookie acts as its key: clearing cookies or changing browsers loses access to that workspace. This is a prototype, not an operational cargo system or a customs authority connection.

- English / German interface
- Create and find shipments by MAWB
- Camera barcode / QR reading, with USB scanner or typed-code fallback
- Attach PDF, JPG, PNG, TXT or JSON files (15 MB maximum); structured JSON fills recognised fields for review
- Compare manually entered piece counts and gross weights
- Flag missing references and basic MRN format issues
- Record a reported customs status with its document/message source
- Save a checklist and a named human review
- Export shipment reports and reusable checklists
- Fictional practice scenarios and one small Python exercise
- Remotion workflow animation with playback controls
- Feedback form for colleagues, with an owner-only inbox
- Downloadable, readable source package

## What is deliberately still manual

Scanned documents are stored, but **OCR (automatic text reading) is not implemented**. No AI model is called. A barcode can identify a shipment; it does not establish customs status. MRN format checks do not verify authenticity, release, discharge, validity or customs-office decisions. A completed review records a person's review only. Adapt any checklist to approved company procedures before real operational use.

The animation is silent. The requested future English voice is **Ryan, male**. Connect a specific provider and voice ID before producing narration; do not silently substitute a different voice.

## Read the code

Start with [LEARNING_GUIDE.md](LEARNING_GUIDE.md). Files are organised as follows:

| File | Purpose |
| --- | --- |
| app/page.tsx | The pages, form fields and user actions |
| app/globals.css | Colours, spacing, layouts and mobile views |
| lib/checks.ts | Small, readable document comparison rules |
| app/motion.tsx | The Remotion animation, drawn frame by frame |
| app/api/shipments/route.ts | Read and save shipment records |
| app/api/documents/route.ts | Store and retrieve attached files |
| app/api/feedback/route.ts | Collect feedback; owner-only reading |
| app/api/visitor.ts | Anonymous browser workspace cookie |
| db/schema.ts | Database table structure |
| drizzle/ | Versioned database setup instructions |
| learning/missing_mrn.py | Your first standalone Python exercise |

## Run locally

Requirements: Node.js 22.13 or later and npm. Python 3 is only needed for the learning exercise.

1. `npm install`
2. `npm run db:generate` only after changing the database structure; the supplied migration is already generated.
3. `npm run build`
4. Apply the supplied migration locally (use the actual filename in drizzle/):
   `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_wise_mimic.sql`
5. `npm run dev` and open the displayed local address.

The source ZIP omits the original hosting identity. Local DB and file bindings remain enabled. To host your own copy, create a new Site identity rather than reusing someone else's project. Sites deploys the migrations and provisions database/file bindings. Feedback inbox access additionally needs the server environment setting `OWNER_USER_ID` to match the owner's trusted authenticated user header. Do not trust a browser-supplied owner flag.

## Share feedback

Use the site's “Share feedback” button. Explain what you tried, what happened, and what you expected. Do not include customer names, real shipment references, documents or personal details. Feedback is stored for the project owner. The owner can open the inbox from “How it’s built” while signed in to the hosting account.

For GitHub, open an issue using the supplied templates. Read [CONTRIBUTING.md](CONTRIBUTING.md) before adding screenshots or examples. Please use GitHub Issues for improvement ideas, problems and practical feedback. Include only fictional examples.

## Suggested next small projects

1. Improve and test the missing-information checker.
2. Import fictional manifest data from a simple text file.
3. Add OCR with a correction screen and document-to-field evidence links.
4. Add AI suggestions with a clear explanation and human review.
5. Add roles, retention/deletion controls and a robust audit trail before considering real work data.
6. Connect an authorised customs information source only after access and its permitted use are established.
7. Coordinate the tested tools with a supervisor workflow. Keep acceptance and regulatory decisions under the approved human process.

## Technology, simply explained

React builds the interface. Vinext runs the React application on a server. D1 stores structured records (like organised spreadsheet rows). R2 stores attached files. Remotion creates an animation from React components. TypeScript adds labels describing the kinds of data the code expects.

## Reference

European Commission: [New Computerised Transit System](https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-customs/new-computerised-transit-system-ncts_en). This reference explains NCTS and MRNs; CargoClear is not endorsed by or connected to the Commission.

## Reuse

The authored application and learning materials are shared under the MIT license in LICENSE. Third-party packages and bundled starter material retain their respective licenses. This prototype is provided without a production readiness guarantee.
