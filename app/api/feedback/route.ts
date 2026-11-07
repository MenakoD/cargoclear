import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { feedback } from "../../../db/schema";
export async function GET(req: Request) {
  if (
    !env.OWNER_USER_ID ||
    req.headers.get("oai-authenticated-user-id") !== env.OWNER_USER_ID
  )
    return Response.json({ error: "Owner access required" }, { status: 403 });
  return Response.json(
    {
      feedback: (await getDb().select().from(feedback))
        .map((x) => JSON.parse(x.data))
        .reverse(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: Request) {
  try {
    const d = (await req.json()) as {
      message?: string;
      category?: string;
      page?: string;
    };
    if (
      typeof d.message !== "string" ||
      d.message.trim().length < 10 ||
      d.message.length > 3000
    )
      return Response.json(
        { error: "Please write 10–3000 characters." },
        { status: 400 },
      );
    const record = {
      message: d.message.trim(),
      category: String(d.category || "idea").slice(0, 40),
      page: String(d.page || "overview").slice(0, 40),
      date: new Date().toISOString(),
    };
    await getDb()
      .insert(feedback)
      .values({ id: crypto.randomUUID(), data: JSON.stringify(record) });
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Feedback could not be saved. Please retry." },
      { status: 500 },
    );
  }
}
