/**
 * LD V3 Kit 样式构建脚本
 *
 * 功能：
 * 1. 扫描所有组件的样式文件
 * 2. 自动生成入口文件的导入语句
 * 3. 编译 SCSS 为 CSS
 * 4. 压缩并输出到 dist 目录
 */

import { resolve, join, basename, relative, dirname } from 'path';
import { copyFile, mkdir, writeFile, readFile } from 'fs/promises';
import { styleText } from 'util';
import consola from 'consola';
import { transform } from 'lightningcss';
import { glob } from 'tinyglobby';
import { compileAsync } from 'sass-embedded';
import { chunk } from 'lodash-unified';

// ==================== 路径常量 ====================
type Awaitable<T> = Promise<T | T[]> | T;

/** 项目根目录 */
const projRoot = resolve(__dirname, '../../');

/** styles 包目录 */
const stylesRoot = __dirname;

/** components 包目录 */
const componentsRoot = resolve(projRoot, 'packages/components');

/** 构建输出目录 */
const buildOutput = resolve(projRoot, 'dist');

/** ld-v3-kit 输出目录 */
const ldOutput = resolve(buildOutput, 'ld-v3-kit');

/** 样式输出目录 */
const styleOutput = resolve(ldOutput, 'styles');

/** styles 临时输出目录 */
const stylesDist = resolve(stylesRoot, 'dist');

// ==================== 工具函数 ====================

/**
 * 错误处理并退出
 */
function errorAndExit(err: Error): never {
  consola.error(err);
  process.exit(1);
}

/**
 * 执行命令并记录时间
 */
async function execCommand<T extends () => Awaitable<void>>(fnc: T, overrideName?: string) {
  const commandName = styleText('cyan', overrideName || fnc.name);
  try {
    const startTime = performance.now();
    consola.info(`Starting '${commandName}'...`);
    await fnc();
    const elapsedTime = performance.now() - startTime;
    const suffixTimeLog =
      elapsedTime < 1000 ? `${elapsedTime.toFixed(2)}ms` : `${(elapsedTime / 1000).toFixed(2)}s`;
    consola.info(`Ending '${commandName}' ${styleText('magenta', suffixTimeLog)}`);
  } catch (e) {
    errorAndExit(e as Error);
  }
}

/**
 * 压缩 CSS
 */
async function compress(filename: string, css: string): Promise<Uint8Array> {
  const result = transform({
    filename,
    code: Buffer.from(css),
    minify: true,
    sourceMap: false,
    targets: {
      chrome: 85 << 16,
      firefox: 79 << 16,
      safari: (14 << 16) | (1 << 8),
      edge: 85 << 16,
    },
  });
  return result.code;
}

// ==================== 核心构建函数 ====================

/**
 * 扫描所有组件的样式文件
 * @returns 组件样式文件路径列表
 */
async function scanComponentStyles(): Promise<string[]> {
  const styleFiles = await glob('*/style/index.scss', {
    cwd: componentsRoot,
    absolute: true,
  });

  consola.info(`Found ${styleFiles.length} component style files`);

  return styleFiles;
}

/**
 * 生成入口文件的组件导入语句
 * @param componentStyles 组件样式文件路径列表
 */
async function generateIndexImports(componentStyles: string[]): Promise<void> {
  const indexPath = resolve(stylesRoot, 'src/index.scss');

  // 读取现有文件内容
  const content = await readFile(indexPath, 'utf-8');

  // 找到组件导入区域的开始和结束标记
  const startMarker = '// ==================== 组件样式 ====================';
  const endMarker = '// ...';

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    consola.warn('未找到组件导入区域标记，跳过自动生成');
    return;
  }

  // 生成导入语句（相对于 src 目录）
  const imports = componentStyles
    .map((file) => {
      const relativePath = relative(resolve(stylesRoot, 'src'), file).replace(/\\/g, '/');
      return `@use '${relativePath}';`;
    })
    .join('\n');

  // 替换组件导入区域
  const newContent =
    content.slice(0, startIndex + startMarker.length) +
    '\n' +
    imports +
    '\n' +
    content.slice(endIndex);

  // 写入文件
  await writeFile(indexPath, newContent, 'utf-8');
  consola.success('Generated index.scss imports');
}

/**
 * 编译单个 SCSS 文件
 */
async function compileScssFile(scssFile: string): Promise<void> {
  const baseName = basename(scssFile, '.scss');
  const cssResult = await compileAsync(scssFile);
  const compressed = await compress(baseName, cssResult.css);

  // 确定输出文件名
  const outputName = baseName === 'index' ? 'index.css' : `ld-${baseName}.css`;
  const outputPath = join(stylesDist, outputName);

  await writeFile(outputPath, compressed);

  consola.success(
    `${styleText('cyan', outputName)}: ${styleText('yellow', `${(cssResult.css.length / 1000).toFixed(2)}KB`)} -> ${styleText('green', `${(compressed.length / 1000).toFixed(2)}KB`)}`,
  );
}

/**
 * 批量编译 SCSS 文件
 */
async function compileScssFiles(scssFiles: string[]): Promise<void> {
  await mkdir(stylesDist, { recursive: true });

  // 分批处理，提高并发效率
  const chunks = chunk(scssFiles, Math.ceil(scssFiles.length / 5));
  await Promise.all(chunks.map((chunkFiles) => Promise.all(chunkFiles.map(compileScssFile))));
}

/**
 * 构建完整样式包
 */
async function buildFullStyle(): Promise<void> {
  // 1. 扫描组件样式
  const componentStyles = await scanComponentStyles();

  // 2. 生成入口文件导入
  await generateIndexImports(componentStyles);

  // 3. 收集所有需要编译的 SCSS 文件
  const allScssFiles = await glob('**/*.scss', {
    cwd: stylesRoot,
    absolute: true,
    ignore: ['dist/**', 'node_modules/**'],
  });

  // 4. 编译所有 SCSS 文件
  await compileScssFiles(allScssFiles);
}

/**
 * 构建按需加载的组件样式
 */
async function buildComponentStyles(): Promise<void> {
  const componentStyles = await scanComponentStyles();

  // 为每个组件单独编译样式
  for (const styleFile of componentStyles) {
    const componentName = basename(dirname(dirname(styleFile)));
    const outputPath = join(stylesDist, `ld-${componentName}.css`);

    const cssResult = await compileAsync(styleFile);
    const compressed = await compress(componentName, cssResult.css);

    await writeFile(outputPath, compressed);

    consola.success(
      `Component ${styleText('cyan', componentName)}: ${styleText('green', `${(compressed.length / 1000).toFixed(2)}KB`)}`,
    );
  }
}

/**
 * 复制构建产物到最终输出目录
 */
async function copyToDist(): Promise<void> {
  // 复制编译后的 CSS 文件
  const cssFiles = await glob(['dist/**/*'], { cwd: stylesRoot });
  for (const file of cssFiles) {
    const source = resolve(stylesRoot, file);
    const dest = resolve(styleOutput, relative('dist', file));
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(source, dest);
  }

  // 复制源文件（供主题定制使用）
  const srcDir = resolve(styleOutput, 'src');
  const srcFiles = await glob(['src/**/*'], { cwd: stylesRoot });
  for (const file of srcFiles) {
    const source = resolve(stylesRoot, file);
    const dest = resolve(srcDir, relative('src', file));
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(source, dest);
  }

  consola.success('Copied styles to dist directory');
}
const copyFullStyle = async () => {
  await mkdir(resolve(ldOutput, 'dist'), { recursive: true });
  await copyFile(resolve(ldOutput, 'styles/index.css'), resolve(ldOutput, 'dist/index.css'));
};

// ==================== 主构建流程 ====================

async function build() {
  try {
    // 1. 构建完整样式
    await execCommand(buildFullStyle, 'Build Full Style');

    // 2. 构建按需加载样式
    await execCommand(buildComponentStyles, 'Build Component Styles');

    // 3. 复制到最终输出目录
    await execCommand(copyToDist, 'Copy to Dist');
    await execCommand(copyFullStyle, 'Copy Full Style');

    // 注意：不再清理临时文件，因为主构建脚本需要这些文件来复制组件样式
  } catch (err) {
    errorAndExit(err as Error);
  }
}

// 执行构建
build();

export { build };
