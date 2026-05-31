import fs from "fs";
import path from "path";
import type { Express } from "express";
import { fileURLToPath } from "url";
import { ENV } from "./env";

function resolveManusStorageDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "..", "..", "dist", "public", "manus-storage"),
    path.resolve(here, "..", "..", "client", "public", "manus-storage"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0];
}

export function registerStorageProxy(app: Express) {
  const storageDir = resolveManusStorageDir();

  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    const localPath = path.join(storageDir, key);
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      res.set("Cache-Control", "public, max-age=86400");
      res.sendFile(localPath);
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(404).send("File not found");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(404).send("File not found");
        return;
      }
      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(404).send("File not found");
        return;
      }
      res.set("Cache-Control", "public, max-age=86400");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
