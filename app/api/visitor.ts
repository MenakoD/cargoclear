export function visitor(req: Request): {
  id: string;
  headers: Record<string, string>;
} {
  const current = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)cargo_visitor=([a-f0-9-]{36})(?:;|$)/)?.[1];
  const id = current || crypto.randomUUID();
  return {
    id,
    headers: current
      ? {}
      : {
          "Set-Cookie": `cargo_visitor=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`,
        },
  };
}
