# Learning CargoClear, one small task at a time

CargoClear is a learning and feedback project for readers interested in air-cargo documentation, Python and AI-assisted automation. You can follow along without a software-development background.

**Use fictional practice data only. Do not upload real work documents, real shipment information, customer details or personal data.**

## Start with the practice site

Open [CargoClear on GitHub Pages](https://menakod.github.io/cargoclear/). Its practice records and attachments stay in the browser you use. Clearing the site's browser data removes them. It does not verify live customs status.

You can switch between English and German at the top of the screen.

## Your first manageable exercise

1. Open **Automation lab**.
2. Find **Spot a missing reference**.
3. Read the Python example and try the next example value.

```python
mrn = ""

if not mrn.strip():
    print("Missing MRN — review needed")
else:
    print("Reference present — verify evidence")
```

`mrn` is a named value, called a variable. Empty quotation marks mean no text has been supplied. `strip()` removes spaces around the text. The `if` statement chooses a message according to whether the value is empty.

The button demonstrates the logic. It does not execute Python in your browser. For the next practical step, open [the standalone Python exercise](learning/missing_mrn.py) and follow the [beginner code guide](LEARNING_GUIDE.md).

A supplied reference does not establish customs release, validity or discharge. This first exercise only checks whether someone supplied text.

## Try a fictional shipment

In Automation lab, choose **Load 3 practice shipments**, then open a shipment in **Shipments**. Look at the missing-MRN and piece-count findings. These practice examples stay in memory.

For a separate saved browser exercise, choose **New shipment** and enter fictional details. You can also download the provided practice JSON file from Automation lab, then attach it to a new shipment. JSON is a simple file format for named values; the app fills the recognised fields so you can check them.

The checklist records your review. It is not a customs authority decision. Scanned PDF/image text currently needs manual entry. OCR and AI extraction are future modules.

## The six-stage learning path

| Stage | What we will practise |
| --- | --- |
| 1 | Check one missing reference with variables and if/else decisions |
| 2 | Compare MAWB and manifest quantities |
| 3 | Repeat the checks for several fictional shipments |
| 4 | Read shipment information from a practice file |
| 5 | Connect a Python checker to the app through an API |
| 6 | Add document text reading and AI suggestions, with human verification |

The current browser app already demonstrates several field checks. The path teaches how to build the underlying tools yourself. Connecting a Python service and adding OCR/AI are planned learning stages. Agents can follow after the individual tools work reliably.

## Share useful feedback

Use **Share feedback** on the practice site to open a GitHub Issue draft. Review and submit the draft on GitHub; it is public and requires a GitHub account. Explain what you tried, what you expected and one improvement that would help. Use fictional examples and remove any real work or personal information.

You can also [open an issue directly](https://github.com/MenakoD/cargoclear/issues).

A separate [hosted workspace](https://cargo-clear-grace.menakod.chatgpt.site/) uses server-backed storage. The GitHub Pages edition is the easiest public starting point for this learning exercise.
