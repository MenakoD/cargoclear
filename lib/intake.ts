import type { Shipment } from "./checks";
/** Accept only known text fields from a fictional JSON exercise.
 * Imported values still require a person to check the original evidence.
 */
export function readPracticeJson(text: string): Partial<Shipment> {
  const input = JSON.parse(text);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Use a JSON object with shipment fields.");
  const result: Record<string, string> = {};
  for (const field of [
    "mawb",
    "route",
    "pieces",
    "weight",
    "manifestPieces",
    "manifestWeight",
    "mrn",
    "procedure",
    "customsStatus",
    "evidence",
  ]) {
    if (typeof input[field] === "string" || typeof input[field] === "number")
      result[field] = String(input[field]).slice(0, 300);
  }
  if (!/^\d{3}-\d{8}$/.test(result.mawb || ""))
    throw new Error("JSON needs a MAWB in the format 123-12345678.");
  if (
    result.customsStatus &&
    !["unknown", "transit", "arrival", "release", "hold"].includes(
      result.customsStatus,
    )
  )
    result.customsStatus = "unknown";
  return result;
}
