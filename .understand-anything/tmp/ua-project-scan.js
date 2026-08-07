import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const corePath = '/home/dheeraj/.codex/understand-anything/understand-anything-plugin/packages/core/dist/index.js';
const { createIgnoreFilter, DEFAULT_IGNORE_PATTERNS } = await import(pathToFileURL(corePath).href);

const root = process.argv[2];
const output = process.argv[3];

if (!root || !output || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error('Usage: node ua-project-scan.js <project-root> <output-path>');
  process.exit(1);
}

const toPosix = (filePath) => filePath.split(path.sep).join('/');
const hasExtension = (filePath, names) => names.some((extension) => filePath.toLowerCase().endsWith(extension));
const languageFor = (filePath) => {
  const lower = filePath.toLowerCase();
  const extensionLanguages = {
    '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
    '.py': 'python', '.go': 'go', '.rs': 'rust', '.java': 'java', '.rb': 'ruby',
    '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.h': 'cpp', '.hpp': 'cpp', '.c': 'c',
    '.cs': 'csharp', '.swift': 'swift', '.kt': 'kotlin', '.php': 'php', '.vue': 'vue',
    '.svelte': 'svelte', '.sh': 'shell', '.bash': 'shell', '.md': 'markdown', '.rst': 'markdown',
    '.yaml': 'yaml', '.yml': 'yaml', '.json': 'json', '.toml': 'toml', '.sql': 'sql',
    '.graphql': 'graphql', '.gql': 'graphql', '.proto': 'protobuf', '.tf': 'terraform',
    '.tfvars': 'terraform', '.html': 'html', '.htm': 'html', '.css': 'css', '.scss': 'css',
    '.sass': 'css', '.less': 'css', '.xml': 'xml', '.cfg': 'config', '.ini': 'config', '.env': 'config',
  };
  if (path.posix.basename(filePath) === 'Dockerfile') return 'dockerfile';
  if (path.posix.basename(filePath) === 'Makefile') return 'makefile';
  if (path.posix.basename(filePath) === 'Jenkinsfile') return 'jenkinsfile';
  if (path.posix.basename(lower) === '.env' || path.posix.basename(lower).startsWith('.env.')) return 'config';
  return Object.entries(extensionLanguages).find(([extension]) => lower.endsWith(extension))?.[1] ?? 'unknown';
};

const categoryFor = (filePath) => {
  const base = path.posix.basename(filePath);
  const lower = filePath.toLowerCase();
  if (base === 'Dockerfile' || base === 'Makefile' || base === 'Jenkinsfile' || base === 'Procfile' || base === 'Vagrantfile' ||
      lower.startsWith('.github/workflows/') || lower === '.gitlab-ci.yml' || lower.startsWith('.circleci/') ||
      lower.startsWith('k8s/') || lower.startsWith('kubernetes/') || lower.startsWith('docker-compose.') ||
      hasExtension(lower, ['.tf', '.tfvars', '.k8s.yaml', '.k8s.yml'])) return 'infra';
  if (hasExtension(lower, ['.md', '.rst', '.txt'])) return 'docs';
  if (hasExtension(lower, ['.sql', '.graphql', '.gql', '.proto', '.prisma', '.schema.json', '.csv'])) return 'data';
  if (hasExtension(lower, ['.sh', '.bash', '.ps1', '.bat'])) return 'script';
  if (hasExtension(lower, ['.html', '.htm', '.css', '.scss', '.sass', '.less'])) return 'markup';
  if (hasExtension(lower, ['.yaml', '.yml', '.json', '.toml', '.xml', '.cfg', '.ini']) ||
      path.posix.basename(lower) === '.env' || path.posix.basename(lower).startsWith('.env.') ||
      ['tsconfig.json', 'package.json', 'pyproject.toml', 'cargo.toml', 'go.mod'].includes(lower)) return 'config';
  return 'code';
};

function trackedFiles() {
  try {
    return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'buffer' })
      .toString('utf8').split('\0').filter(Boolean).map(toPosix);
  } catch (error) {
    // The sandbox can report EPERM after git has successfully written stdout.
    // Prefer that authoritative tracked-file list over a broader recursive walk.
    if (error?.stdout?.length) {
      return error.stdout.toString('utf8').split('\0').filter(Boolean).map(toPosix);
    }
    const ignored = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.cache', '.turbo', 'target', 'obj']);
    const found = [];
    const walk = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory() && ignored.has(entry.name)) continue;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(absolute);
        else if (entry.isFile()) found.push(toPosix(path.relative(root, absolute)));
      }
    };
    walk(root);
    return found;
  }
}

const allFiles = trackedFiles();
const hasUserIgnore = [
  path.join(root, '.understand-anything', '.understandignore'),
  path.join(root, '.understandignore'),
].some(fs.existsSync);
const defaultFilter = { isIgnored: (relativePath) => {
  const segments = relativePath.split('/');
  if (segments.some((part) => ['node_modules', '.git', 'vendor', 'venv', '.venv', '__pycache__', 'dist', 'build', 'out', 'coverage', '.next', '.cache', '.turbo', 'target', 'obj', '.idea', '.vscode'].includes(part))) return true;
  const base = path.posix.basename(relativePath);
  return base === 'LICENSE' || base === '.gitignore' || base === '.editorconfig' || base === '.prettierrc' ||
    base === 'package-lock.json' || base === 'yarn.lock' || base === 'pnpm-lock.yaml' ||
    /^\.eslintrc/.test(base) || /\.(lock|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|mp3|mp4|pdf|zip|tar|gz|map)$/.test(base) ||
    /\.min\.(js|css)$/.test(base) || /\.generated\./.test(base) || /\.log$/.test(base);
}};
const defaultFiles = allFiles.filter((relativePath) => !defaultFilter.isIgnored(relativePath));
const filter = hasUserIgnore ? createIgnoreFilter(root) : defaultFilter;
const discovered = allFiles.filter((relativePath) => !filter.isIgnored(relativePath)).sort();
const filteredByIgnore = hasUserIgnore ? Math.max(0, defaultFiles.length - discovered.length) : 0;

const files = discovered.map((relativePath) => {
  const absolute = path.join(root, relativePath);
  let sizeLines = 0;
  try {
    const content = fs.readFileSync(absolute, 'utf8');
    sizeLines = content === '' ? 0 : content.split(/\r?\n/).length - (content.endsWith('\n') ? 1 : 0);
  } catch { /* unreadable files retain a zero line count */ }
  return { path: relativePath, language: languageFor(relativePath), sizeLines, fileCategory: categoryFor(relativePath) };
});
const discoveredSet = new Set(discovered);

function resolveRelative(fromPath, specifier) {
  const raw = path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), specifier));
  const candidates = [raw];
  if (!path.posix.extname(raw)) candidates.push(...['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js', '/index.tsx', '/index.jsx', '.py', '.go', '.rs', '.rb'].map((suffix) => raw + suffix));
  return candidates.find((candidate) => discoveredSet.has(candidate));
}

const importMap = Object.fromEntries(files.map((file) => [file.path, []]));
for (const file of files.filter((item) => item.fileCategory === 'code')) {
  try {
    const content = fs.readFileSync(path.join(root, file.path), 'utf8');
    const specifiers = [];
    if (file.language === 'typescript' || file.language === 'javascript') {
      for (const match of content.matchAll(/(?:import\s+(?:[\s\S]*?\s+from\s+)?|export\s+(?:[\s\S]*?\s+from\s+)?|require\s*\()\s*['"](\.{1,2}\/[^'"]+)['"]/g)) specifiers.push(match[1]);
    } else if (file.language === 'ruby') {
      for (const match of content.matchAll(/require_relative\s*\(?\s*['"]([^'"]+)['"]/g)) specifiers.push(match[1]);
    }
    importMap[file.path] = [...new Set(specifiers.map((specifier) => resolveRelative(file.path, specifier)).filter(Boolean))];
  } catch { /* unresolved or unreadable code files have no imports */ }
}

let rootPackage = {};
try { rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')); } catch { /* optional */ }
let serverPackage = {};
try { serverPackage = JSON.parse(fs.readFileSync(path.join(root, 'server', 'package.json'), 'utf8')); } catch { /* optional */ }
const dependencyNames = new Set([...Object.keys(rootPackage.dependencies ?? {}), ...Object.keys(rootPackage.devDependencies ?? {}), ...Object.keys(serverPackage.dependencies ?? {}), ...Object.keys(serverPackage.devDependencies ?? {})]);
const frameworkNames = new Map([
  ['react', 'React'], ['vue', 'Vue'], ['svelte', 'Svelte'], ['@angular/core', 'Angular'], ['express', 'Express'],
  ['fastify', 'Fastify'], ['koa', 'Koa'], ['next', 'Next.js'], ['nuxt', 'Nuxt'], ['vite', 'Vite'], ['vitest', 'Vitest'],
  ['jest', 'Jest'], ['mocha', 'Mocha'], ['tailwindcss', 'Tailwind CSS'], ['prisma', 'Prisma'], ['typeorm', 'TypeORM'],
  ['sequelize', 'Sequelize'], ['mongoose', 'Mongoose'], ['redux', 'Redux'], ['zustand', 'Zustand'], ['mobx', 'MobX'],
  ['wxt', 'WXT'], ['@wxt-dev/module-react', 'WXT React Module'],
]);
const frameworks = [...frameworkNames].filter(([dependency]) => dependencyNames.has(dependency)).map(([, name]) => name).sort();
const readmePath = path.join(root, 'README.md');
let readmeHead = '';
try { readmeHead = fs.readFileSync(readmePath, 'utf8').split(/\r?\n/).slice(0, 10).join('\n'); } catch { /* optional */ }
const totalFiles = files.length;
const result = {
  scriptCompleted: true,
  name: rootPackage.name || path.basename(root),
  rawDescription: rootPackage.description || '',
  readmeHead,
  languages: [...new Set(files.map((file) => file.language).filter((language) => language !== 'unknown'))].sort(),
  frameworks,
  files,
  totalFiles,
  filteredByIgnore,
  estimatedComplexity: totalFiles <= 30 ? 'small' : totalFiles <= 150 ? 'moderate' : totalFiles <= 500 ? 'large' : 'very-large',
  importMap,
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
