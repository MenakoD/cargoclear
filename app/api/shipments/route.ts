import { getDb } from "../../../db";
import { shipments } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { visitor } from "../visitor";
export async function GET(req: Request) {
  const v = visitor(req);
  try {
    return Response.json(
      {
        shipments: (
          await getDb()
            .select()
            .from(shipments)
            .where(eq(shipments.owner, v.id))
        ).map((r) => JSON.parse(r.data)),
      },
      { headers: v.headers },
    );
  } catch {
    return Response.json(
      { error: "Shipment storage is unavailable. Please retry." },
      { status: 500, headers: v.headers },
    );
  }
}
export async function POST(req: Request) {
  const v = visitor(req);
  try {
    const s = (await req.json()) as import("../../../lib/checks").Shipment;
    if (
      typeof s.id !== "string" ||
      !/^\d{3}-\d{8}$/.test(s.mawb) ||
      JSON.stringify(s).length > 100000
    )
      return Response.json(
        { error: "Enter a MAWB as 123-12345678." },
        { status: 400 },
      );
    const id = v.id + ":" + s.id;
    await getDb()
      .insert(shipments)
      .values({ id, owner: v.id, data: JSON.stringify(s) })
      .onConflictDoUpdate({
        target: shipments.id,
        set: { data: JSON.stringify(s) },
      });
    return Response.json({ ok: true }, { headers: v.headers });
  } catch {
    return Response.json(
      { error: "Could not save shipment." },
      { status: 500, headers: v.headers },
    );
  }
}
