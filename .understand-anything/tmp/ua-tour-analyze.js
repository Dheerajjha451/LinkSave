import fs from "node:fs";

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  fail("Usage: node ua-tour-analyze.js <input.json> <output.json>");
}

let input;
try {
  input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
} catch (error) {
  fail(`Unable to read graph input: ${error.message}`);
}

if (!Array.isArray(input.nodes) || !Array.isArray(input.edges) || !Array.isArray(input.layers)) {
  fail("Graph input must contain nodes, edges, and layers arrays.");
}

const nodes = input.nodes.filter((node) => node && typeof node.id === "string");
const nodeById = new Map(nodes.map((node) => [node.id, node]));
const graphEdges = input.edges.filter(
  (edge) => edge && nodeById.has(edge.source) && nodeById.has(edge.target),
);
const fanIn = new Map(nodes.map((node) => [node.id, 0]));
const fanOut = new Map(nodes.map((node) => [node.id, 0]));
for (const edge of graphEdges) {
  fanIn.set(edge.target, fanIn.get(edge.target) + 1);
  fanOut.set(edge.source, fanOut.get(edge.source) + 1);
}

const byCount = (counts, property) => [...nodes]
  .map((node) => ({ id: node.id, [property]: counts.get(node.id), name: node.name }))
  .sort((a, b) => b[property] - a[property] || a.id.localeCompare(b.id));
const fanInRanking = byCount(fanIn, "fanIn").slice(0, 20);
const fanOutRanking = byCount(fanOut, "fanOut").slice(0, 20);

const rankedByFanOut = [...nodes]
  .sort((a, b) => fanOut.get(b.id) - fanOut.get(a.id) || a.id.localeCompare(b.id));
const rankedByFanInAscending = [...nodes]
  .sort((a, b) => fanIn.get(a.id) - fanIn.get(b.id) || a.id.localeCompare(b.id));
const highFanOut = new Set(rankedByFanOut.slice(0, Math.max(1, Math.ceil(nodes.length * 0.1))).map((node) => node.id));
const lowFanIn = new Set(rankedByFanInAscending.slice(0, Math.max(1, Math.ceil(nodes.length * 0.25))).map((node) => node.id));
const codeEntryNames = new Set([
  "index.ts", "index.js", "main.ts", "main.js", "app.ts", "app.js", "server.ts", "server.js",
  "mod.rs", "main.go", "main.py", "main.rs", "manage.py", "app.py", "wsgi.py", "asgi.py",
  "run.py", "__main__.py", "Application.java", "Main.java", "Program.cs", "config.ru", "index.php",
  "App.swift", "Application.kt", "main.cpp", "main.c",
]);
const segmentCount = (node) => (node.filePath || node.name || "").split("/").filter(Boolean).length;
const entryPointCandidates = nodes
  .map((node) => {
    const filename = (node.filePath || node.name || "").split("/").pop();
    let score = 0;
    if (node.type === "file") {
      if (codeEntryNames.has(filename)) score += 3;
      if (segmentCount(node) <= 2) score += 1;
      if (highFanOut.has(node.id)) score += 1;
      if (lowFanIn.has(node.id)) score += 1;
    } else if (node.type === "document") {
      if (node.filePath === "README.md") score += 5;
      else if (segmentCount(node) === 1 && filename && filename.endsWith(".md")) score += 2;
    }
    return { id: node.id, score, name: node.name, summary: node.summary || "" };
  })
  .filter((candidate) => candidate.score > 0)
  .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  .slice(0, 5);

const codeEntryPoint = entryPointCandidates.find((candidate) => nodeById.get(candidate.id)?.type === "file");
const traversalEdges = new Map(nodes.map((node) => [node.id, []]));
for (const edge of graphEdges) {
  if (edge.type === "imports" || edge.type === "calls") traversalEdges.get(edge.source).push(edge.target);
}
const order = [];
const depthMap = {};
const byDepth = {};
if (codeEntryPoint) {
  const queue = [codeEntryPoint.id];
  depthMap[codeEntryPoint.id] = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const depth = depthMap[current];
    order.push(current);
    (byDepth[depth] ||= []).push(current);
    for (const next of traversalEdges.get(current).sort()) {
      if (!(next in depthMap)) {
        depthMap[next] = depth + 1;
        queue.push(next);
      }
    }
  }
}

const nonCodeFiles = { documentation: [], infrastructure: [], data: [], config: [] };
for (const node of nodes) {
  const compact = { id: node.id, name: node.name, type: node.type, summary: node.summary || "" };
  if (node.type === "document") nonCodeFiles.documentation.push(compact);
  if (["service", "pipeline", "resource"].includes(node.type)) nonCodeFiles.infrastructure.push(compact);
  if (["table", "schema", "endpoint"].includes(node.type)) nonCodeFiles.data.push(compact);
  if (node.type === "config") nonCodeFiles.config.push(compact);
}

const relationshipTypes = new Set(["imports", "calls"]);
const directedPairs = new Set(
  graphEdges.filter((edge) => relationshipTypes.has(edge.type)).map((edge) => `${edge.source}\u0000${edge.target}`),
);
const clusters = [];
const claimed = new Set();
for (const edge of graphEdges) {
  if (!relationshipTypes.has(edge.type) || !directedPairs.has(`${edge.target}\u0000${edge.source}`)) continue;
  const cluster = new Set([edge.source, edge.target]);
  let expanded = true;
  while (expanded && cluster.size < 5) {
    expanded = false;
    for (const node of nodes) {
      if (cluster.has(node.id)) continue;
      let connections = 0;
      for (const member of cluster) {
        if (directedPairs.has(`${node.id}\u0000${member}`) || directedPairs.has(`${member}\u0000${node.id}`)) connections += 1;
      }
      if (connections >= 2) {
        cluster.add(node.id);
        expanded = true;
        break;
      }
    }
  }
  const ids = [...cluster].sort();
  const signature = ids.join("|");
  if (claimed.has(signature)) continue;
  claimed.add(signature);
  const edgeCount = graphEdges.filter((candidate) => cluster.has(candidate.source) && cluster.has(candidate.target)).length;
  clusters.push({ nodes: ids, edgeCount });
}
clusters.sort((a, b) => b.edgeCount - a.edgeCount || a.nodes.join("|").localeCompare(b.nodes.join("|")));

const nodeSummaryIndex = Object.fromEntries(nodes.map((node) => [node.id, {
  name: node.name,
  type: node.type,
  summary: node.summary || "",
}]));

const result = {
  scriptCompleted: true,
  entryPointCandidates,
  fanInRanking,
  fanOutRanking,
  bfsTraversal: {
    startNode: codeEntryPoint?.id || null,
    order,
    depthMap,
    byDepth,
  },
  nonCodeFiles,
  clusters: clusters.slice(0, 10),
  layers: {
    count: input.layers.length,
    list: input.layers.map(({ id, name, description }) => ({ id, name, description })),
  },
  nodeSummaryIndex,
  totalNodes: nodes.length,
  totalEdges: graphEdges.length,
};

fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
