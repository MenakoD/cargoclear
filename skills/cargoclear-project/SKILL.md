---
name: cargoclear-project
description: Continue CargoClear, the bilingual customs-document practice site, or extend its small air-cargo automation learning modules. Use for CargoClear changes, source explanations, practice scenarios, and colleague-feedback improvements.
---

# CargoClear project

Help the user learn through small, useful air-cargo projects while maintaining a working, understandable site. Locate the current checkout and inspect its README, LEARNING_GUIDE and hosting manifest before making changes. Reuse its existing Site identity.

## Teaching and scope

The user works with air-cargo arrival/departure documentation and is a motivated programming beginner. Explain new terms in plain language with examples from manifests, MAWB, CMR or transit documents. For a teaching request, provide one manageable step, explain the important code and expected result, then let the user test it. For an explicitly requested complete build or fix, finish the authorised work and provide one clear learning starting point afterward.

When debugging, explain what the error means, why it occurred and where it occurs before showing the correction. Prefer independently useful modules over a premature agent-team architecture. Activate existing specialist skills only when their deliverable is actually needed.

## Current project boundaries

- Maintain English and German interface content together and preserve the language switch.
- Distinguish reported customs status, document-field consistency and human review status. An MRN or a completed checklist alone does not establish customs release or discharge.
- Current capabilities include manual document data entry, structured practice JSON intake, barcode/QR reference capture, comparison rules, attachments, persistent browser workspaces, reusable checklists and feedback collection.
- CMR/manifest codes without a MAWB are captured for manual linking. Do not imply that every document barcode contains customs data.
- OCR, AI extraction and live customs connections are future modules unless implemented and verified in the current checkout. Clearly label them when discussing plans.
- The current public Site is a fictional-data practice and feedback environment. Preserve the selected audience. Browser-cookie workspaces are not company user accounts; clearing the cookie loses access.
- Keep operational acceptance and regulatory decisions under the approved human process. Verify current authoritative references when adding domain rules.

## Source and feedback

Source readability is a product requirement: use descriptive names, focused modules and comments explaining non-obvious choices. Keep the README, beginner guide, fictional examples and meaningful checks aligned with the implementation. Preserve the downloadable source package and its beginner-friendly entry point.

Colleagues access the site to provide improvements, not merely view a portfolio. Keep feedback available from the interface; collect what they tried, the expected outcome and the suggested improvement. Exclude shipment/customer details from examples and public issues. Preserve owner-only feedback reading. GitHub publication requires an actual selected repository; never claim that the source ZIP has been published to GitHub.

Use `scripts/package-source.py` when it exists to refresh the public source download. Inspect its exclusions: credentials, real uploads, local state, dependencies and deployment archives must stay outside the package. A reusable copy must not retain the original Site project identity.

## Motion and voice

Use Remotion for requested workflow motion graphics and its matching skill for implementation. Respect playback controls and readable captions. Voice is optional; the user's consistent preference is Ryan, English male. If narration is actually requested, establish the exact provider and voice ID and reuse them. Do not silently substitute a generic browser voice or claim a silent animation has narration.

## Future modules

Choose the next module from real feedback and learning progress: missing-field checks, manifest comparison, document text extraction with corrections, AI suggestions with source evidence, then coordination of tested tools. Suggest roles, evidence links, export formats, change history and feedback triage when they solve a concrete need. Do not imply that creating this skill authorises deploying unrelated apps, publishing social posts or connecting operational systems.

When finishing a change, report the practical outcome, checks performed, material unverified behaviour and one manageable next learning action. Maintain a local readable SKILL.md copy with the source when this project is shared.

## GitHub Pages edition

The public repository `MenakoD/cargoclear` also has a static GitHub Pages edition. Its entry point is `pages/main.tsx`; `vite.pages.config.ts` builds the same screen with `browserOnly` enabled. `lib/browser-storage.ts` keeps practice records in localStorage and files in IndexedDB. Feedback opens a public GitHub Issues draft for the user to submit. Preserve these distinctions from the original server-backed Site.

GitHub Pages publishes the committed `docs/` folder from `main`. After source edits for this edition, run `npm run build:pages` and include regenerated `docs/` in the commit. Keep `/cargoclear/` as the asset prefix for this repository. Do not assume a push to GitHub changes the original Sites deployment or that updating Sites publishes Pages.
