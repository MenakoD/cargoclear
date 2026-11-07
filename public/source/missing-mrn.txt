# Your first small automation: notice a missing reference.
# This is a fictional practice example, not a customs verification.
mrn = ""

# strip() removes spaces; `not` asks whether the result is empty.
if not mrn.strip():
    print("Missing MRN — review needed")
else:
    print("Reference present — verify evidence")
