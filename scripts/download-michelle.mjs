import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const url =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Michelle.glb";

const output = resolve("public/models/Michelle.glb");

console.log("Downloading Michelle.glb from the official three.js repository...");
console.log(url);

const response = await fetch(url);

if (!response.ok) {
  throw new Error(
    `Download failed: ${response.status} ${response.statusText}`,
  );
}

const bytes = Buffer.from(await response.arrayBuffer());

await mkdir(dirname(output), { recursive: true });
await writeFile(output, bytes);

console.log(`Saved ${bytes.length.toLocaleString()} bytes to:`);
console.log(output);
console.log("");
console.log("Michelle is ready. Run: npm run dev");
