import type { Shipment } from "./checks";

// GitHub Pages has no application server. This adapter keeps practice data
// on the visitor's device, while the shared screen still uses one interface.
const recordKey = "cargoclear-pages-shipments-v1";
function filesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cargoclear-pages-files-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Browser document storage is unavailable."));
  });
}
export async function browserRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  try {
    if (path === "/api/shipments") {
      const rows: Shipment[] = JSON.parse(
        localStorage.getItem(recordKey) || "[]",
      );
      if (options.method === "POST") {
        const shipment = JSON.parse(String(options.body)) as Shipment;
        if (!/^\d{3}-\d{8}$/.test(shipment.mawb))
          return Response.json(
            { error: "Enter a MAWB as 123-12345678." },
            { status: 400 },
          );
        localStorage.setItem(
          recordKey,
          JSON.stringify([
            shipment,
            ...rows.filter((s) => s.id !== shipment.id),
          ]),
        );
        return Response.json({ ok: true });
      }
      return Response.json({ shipments: rows });
    }
    if (path === "/api/documents" && options.method === "POST") {
      const file = (options.body as FormData).get("file");
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
      const key = crypto.randomUUID();
      const db = await filesDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("files", "readwrite");
        tx.objectStore("files").put(file, key);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(
            new Error(
              "Document could not be saved. Browser storage may be full.",
            ),
          );
        };
        tx.onabort = () => {
          db.close();
          reject(new Error("Document save was cancelled."));
        };
      });
      return Response.json({ key, name: file.name });
    }
    return Response.json(
      { error: "Use GitHub Issues for feedback on this version." },
      { status: 403 },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Browser storage is unavailable.",
      },
      { status: 500 },
    );
  }
}
export async function downloadLocalDocument(key: string, name: string) {
  const db = await filesDb();
  const file = await new Promise<Blob>((resolve, reject) => {
    const request = db.transaction("files").objectStore("files").get(key);
    request.onsuccess = () => {
      db.close();
      request.result
        ? resolve(request.result)
        : reject(new Error("This file is no longer in this browser."));
    };
    request.onerror = () => {
      db.close();
      reject(new Error("Document could not be loaded."));
    };
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
