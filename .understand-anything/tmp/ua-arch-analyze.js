#!/usr/bin/env node
import fs from 'node:fs';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error('Usage: node ua-arch-analyze.js <input.json> <output.json>');
  process.exit(1);
}

try {
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  // Accept the prescribed architecture input, or an assembled graph while preserving
  // the same file-level filtering for the latter.
  const fileNodes = raw.fileNodes || (raw.nodes || []).filter((node) => node.type !== 'function');
  const fileIds = new Set(fileNodes.map((node) => node.id));
  const allEdges = raw.allEdges || (raw.edges || []).filter(
    (edge) => fileIds.has(edge.source) && fileIds.has(edge.target),
  );
  const importEdges = raw.importEdges || allEdges.filter((edge) => edge.type === 'imports');

  const paths = fileNodes.map((node) => node.filePath).filter(Boolean);
  const pathParts = paths.map((path) => path.split('/'));
  let commonPrefix = [];
  for (let index = 0; ; index += 1) {
    const part = pathParts[0]?.[index];
    if (!part || !pathParts.every((parts) => parts[index] === part)) break;
    commonPrefix.push(part);
  }
  // A common filename is not a directory prefix.
  if (commonPrefix.length === pathParts[0]?.length) commonPrefix = commonPrefix.slice(0, -1);
  const prefixLength = commonPrefix.length;
  const groupFor = (node) => {
    const parts = node.filePath.split('/');
    const part = parts[prefixLength];
    return parts.length <= prefixLength + 1 ? 'root' : part;
  };

  const directoryGroups = {};
  const nodeTypeGroups = {};
  const groupById = new Map();
  const nodeById = new Map(fileNodes.map((node) => [node.id, node]));
  for (const node of fileNodes) {
    const group = groupFor(node);
    groupById.set(node.id, group);
    (directoryGroups[group] ||= []).push(node.id);
    (nodeTypeGroups[node.type] ||= []).push(node.id);
  }

  const fanIn = Object.fromEntries(fileNodes.map((node) => [node.id, 0]));
  const fanOut = Object.fromEntries(fileNodes.map((node) => [node.id, 0]));
  const interMap = new Map();
  const internal = Object.fromEntries(Object.keys(directoryGroups).map((group) => [group, 0]));
  const involved = Object.fromEntries(Object.keys(directoryGroups).map((group) => [group, 0]));
  for (const edge of importEdges) {
    if (!groupById.has(edge.source) || !groupById.has(edge.target)) continue;
    fanOut[edge.source] += 1;
    fanIn[edge.target] += 1;
    const from = groupById.get(edge.source);
    const to = groupById.get(edge.target);
    const key = `${from}\u0000${to}`;
    interMap.set(key, (interMap.get(key) || 0) + 1);
    involved[from] += 1;
    if (to !== from) involved[to] += 1;
    else internal[from] += 1;
  }
  const interGroupImports = [...interMap].map(([key, count]) => {
    const [from, to] = key.split('\u0000');
    return { from, to, count };
  });
  const intraGroupDensity = Object.fromEntries(Object.keys(directoryGroups).map((group) => [group, {
    internalEdges: internal[group], totalEdges: involved[group],
    density: involved[group] ? Number((internal[group] / involved[group]).toFixed(2)) : 0,
  }]));

  const directoryPatterns = {
    api: 'api', routes: 'api', controllers: 'api', endpoints: 'api', handlers: 'api',
    services: 'service', core: 'service', lib: 'service', domain: 'service', logic: 'service',
    models: 'data', db: 'data', data: 'data', persistence: 'data', repository: 'data', entities: 'data',
    components: 'ui', views: 'ui', pages: 'ui', ui: 'ui', layouts: 'ui', screens: 'ui',
    middleware: 'middleware', plugins: 'middleware', interceptors: 'middleware', guards: 'middleware',
    utils: 'utility', helpers: 'utility', common: 'utility', shared: 'utility', tools: 'utility',
    config: 'config', constants: 'config', env: 'config', settings: 'config',
    hooks: 'hooks', store: 'state', state: 'state', reducers: 'state', actions: 'state', slices: 'state',
    docs: 'documentation', documentation: 'documentation', wiki: 'documentation',
    deploy: 'infrastructure', deployment: 'infrastructure', infra: 'infrastructure', infrastructure: 'infrastructure',
  };
  const patternMatches = Object.fromEntries(Object.keys(directoryGroups).map((group) => [group, directoryPatterns[group] || 'unclassified']));

  const crossMap = new Map();
  for (const edge of allEdges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) continue;
    const key = `${source.type}\u0000${target.type}\u0000${edge.type}`;
    crossMap.set(key, (crossMap.get(key) || 0) + 1);
  }
  const crossCategoryEdges = [...crossMap].map(([key, count]) => {
    const [fromType, toType, edgeType] = key.split('\u0000');
    return { fromType, toType, edgeType, count };
  });

  const dependencyDirection = [];
  for (const relation of interGroupImports) {
    if (relation.from === relation.to) continue;
    const reverse = interMap.get(`${relation.to}\u0000${relation.from}`) || 0;
    if (relation.count > reverse) dependencyDirection.push({ dependent: relation.from, dependsOn: relation.to });
  }
  const documentation = fileNodes.filter((node) => node.type === 'document');
  const docsByGroup = new Set(documentation.map((node) => groupById.get(node.id)));
  const infraFiles = fileNodes.filter((node) => /(^|\/)(Dockerfile|docker-compose)|\.tf(?:vars)?$|\.github\/workflows|vercel\.json$/.test(node.filePath)).map((node) => node.filePath);
  const result = {
    scriptCompleted: true,
    commonPathPrefix: commonPrefix.join('/'),
    directoryGroups,
    nodeTypeGroups,
    crossCategoryEdges,
    interGroupImports,
    intraGroupDensity,
    patternMatches,
    deploymentTopology: {
      hasDockerfile: infraFiles.some((path) => /Dockerfile/.test(path)),
      hasCompose: infraFiles.some((path) => /docker-compose/.test(path)),
      hasK8s: infraFiles.some((path) => /(^|\/)(k8s|kubernetes)\//.test(path)),
      hasTerraform: infraFiles.some((path) => /\.tf(?:vars)?$/.test(path)),
      hasCI: infraFiles.some((path) => /\.github\/workflows|\.gitlab-ci|Jenkinsfile/.test(path)),
      infraFiles,
    },
    dataPipeline: {
      schemaFiles: fileNodes.filter((node) => /\.(sql|graphql|gql|proto|prisma)$/.test(node.filePath)).map((node) => node.filePath),
      migrationFiles: fileNodes.filter((node) => /migrations\//.test(node.filePath)).map((node) => node.filePath),
      dataModelFiles: fileNodes.filter((node) => /(^|\/)(models|db|data)\//.test(node.filePath)).map((node) => node.filePath),
      apiHandlerFiles: fileNodes.filter((node) => /(^|\/)(routes|controllers|api)\//.test(node.filePath)).map((node) => node.filePath),
    },
    docCoverage: {
      groupsWithDocs: docsByGroup.size,
      totalGroups: Object.keys(directoryGroups).length,
      coverageRatio: Number((docsByGroup.size / Object.keys(directoryGroups).length).toFixed(2)),
      undocumentedGroups: Object.keys(directoryGroups).filter((group) => !docsByGroup.has(group)),
    },
    dependencyDirection,
    fileStats: {
      totalFileNodes: fileNodes.length,
      filesPerGroup: Object.fromEntries(Object.entries(directoryGroups).map(([group, ids]) => [group, ids.length])),
      nodeTypeCounts: Object.fromEntries(Object.entries(nodeTypeGroups).map(([type, ids]) => [type, ids.length])),
    },
    fileFanIn: fanIn,
    fileFanOut: fanOut,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
