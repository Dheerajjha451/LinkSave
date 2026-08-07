import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const graphPath = path.join(projectRoot, ".understand-anything/intermediate/assembled-graph.json");
const layersPath = path.join(projectRoot, ".understand-anything/intermediate/layers.json");
const outputPath = path.join(scriptDirectory, "ua-tour-input.json");
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const layersDocument = JSON.parse(fs.readFileSync(layersPath, "utf8"));
const fileLevelTypes = new Set([
  "file",
  "config",
  "document",
  "service",
  "pipeline",
  "table",
  "schema",
  "resource",
  "endpoint",
]);

const layers = Array.isArray(layersDocument) ? layersDocument : layersDocument.layers;
if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges) || !Array.isArray(layers)) {
  throw new Error("The assembled graph or layer data is not in the expected format.");
}

const nodes = graph.nodes
  .filter((node) => fileLevelTypes.has(node.type))
  .map(({ id, type, name, filePath, summary }) => ({ id, type, name, filePath, summary }));
const compactLayers = layers.map(({ id, name, description }) => ({ id, name, description }));

fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ nodes, edges: graph.edges, layers: compactLayers }, null, 2)}\n`,
);
