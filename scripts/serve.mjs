import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const base = resolve(import.meta.dirname, "../dist");
const port = Number(process.env.PORT ?? 5195);
http
  .createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = resolve(base, "." + (path === "/" ? "/index.html" : path));
      if (!file.startsWith(base + "/")) {
        res.writeHead(403).end();
        return;
      }
      const data = await readFile(file);
      res.setHeader(
        "Content-Type",
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".png": "image/png",
        }[extname(file)] ?? "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-cache");
      res.writeHead(200).end(data);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Lanterns of the Hollow at http://127.0.0.1:${port}`),
  );
