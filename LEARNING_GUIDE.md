# Learn CargoClear one small step at a time

You do not need to understand the entire application at once. Start with one useful operation: finding a missing MRN.

## Your first manageable step

Open `learning/missing_mrn.py`. A **variable** is a name attached to a value. `mrn` is our name; the quotation marks contain its text value. Two quotation marks with nothing between them mean empty text.

Run the file with Python:

    python learning/missing_mrn.py

You should see:

    Missing MRN — review needed

Change only this line:

    mrn = "26DE12345678901234"

Run the file again. It should say:

    Reference present — verify evidence

Why? `strip()` removes blank spaces from the beginning and end. `if not` asks whether anything remains. The two branches choose different messages.

Stop here until you can explain the result in your own words. Next experiment: use three spaces between the quotation marks. Think about the result before running it.

This checks whether a reference was supplied. It cannot establish that the customs declaration is genuine or cleared.

## How that idea appears on the website

Open `lib/checks.ts`. TypeScript uses the same idea, written in a different programming language. `flags()` receives a shipment and returns a list of problems. `s.mrn` means “the MRN field belonging to this shipment.” `.push()` adds a message to the list.

Compare `pieces` with `manifestPieces`. These are the values you entered from two different documents. A difference becomes a finding. The computer can compare numbers reliably; a person still needs to explain and resolve the difference.

## Follow one click

1. In `app/page.tsx`, find the text `Save & check`.
2. That form calls `save(s)`. A **function** is a named set of instructions.
3. `fetch('/api/shipments', ...)` sends the record to the server. An **API** is the doorway one program uses to ask another to do something.
4. `app/api/shipments/route.ts` checks the MAWB format and writes the record to D1.
5. `db/schema.ts` describes the table. A **database** keeps organised information after you close the page.
6. The server replies. React updates the list you see.

## A useful distinction

The visible screen runs in your browser. Saving runs on the server. A change on the screen does not mean it has been saved: the success message appears after the server confirms it. Practice shipments are explicitly labelled and stay in memory, so they can be explored without becoming real records.

## Where appearance comes from

`app/globals.css` sets colours, borders, spacing and layouts. A CSS class is a reusable name for a group of appearance rules. Find `.primary`: it styles the green action buttons. Small-screen rules rearrange the same content for mobile phones.

## How the animation works

`app/motion.tsx` asks Remotion for the current frame, like a numbered page in a flipbook. `interpolate()` converts frame progress into a position. `Player` in `app/page.tsx` supplies play/pause and the timeline. The narration uses committed Microsoft Ryan recordings, not a random browser voice. `app/workflow-narration.json` stores their measured timing. Remotion uses those timings for each scene, caption and audio clip, so pausing or seeking keeps them together. German mode translates captions while retaining the same English voice.

## How public practice records stay separate

The server creates a random browser cookie. Think of it as a claim ticket. Records and files are grouped under that ticket. Clearing it loses access. This simple practice mechanism is not a company authentication system. A production application needs proper accounts, permissions, deletion controls, monitoring and reviewed data handling.

## When something fails

Read the error, identify the smallest action that triggers it, and write down what you expected. A package error concerns the software dependencies. A failed save concerns the server or storage. A camera error may mean the browser denied camera access; the typed-code fallback is there for that case.

## Learning roadmap

Begin with the standalone Python exercise. Only after you understand it, move to comparing two quantities. Later modules can add file reading, OCR and AI suggestions. Build agents after the underlying tools have clear inputs, outputs and tests.

German terms: variable = Variable; function = Funktion; database = Datenbank; API = Schnittstelle; source code = Quellcode; feedback = Rückmeldung.
