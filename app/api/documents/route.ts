import { env } from "cloudflare:workers";
import { visitor } from "../visitor";
export async function POST(req: Request) {
  const v = visitor(req);
  try {
    const f = await req.formData();
    const file = f.get("file");
    if (
      !(file instanceof File) ||
      file.size > 15 * 1024 * 1024 ||
      ![
        "application/pdf",
        "image/jpeg",
        "image/png",
        "text/plain",
        "application/json",
      ].includes(file.type)
    )
      return Response.json(
        { error: "Use PDF, PNG, JPG, TXT or JSON, up to 15 MB." },
        { status: 400 },
      );
    const key = v.id + "/" + crypto.randomUUID();
    await env.BUCKET!.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { name: file.name },
    });
    return Response.json({ key, name: file.name }, { headers: v.headers });
  } catch {
    return Response.json(
      { error: "Document upload failed. Try again." },
      { status: 500, headers: v.headers },
    );
  }
}
export async function GET(req: Request) {
  const v = visitor(req);
  const key = new URL(req.url).searchParams.get("key");
  if (!key || !key.startsWith(v.id + "/"))
    return new Response("Not found", { status: 404 });
  const file = await env.BUCKET!.get(key);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.body, {
    headers: {
      "Content-Type":
        file.httpMetadata?.contentType || "application/octet-stream",
      "Content-Disposition": "attachment",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
