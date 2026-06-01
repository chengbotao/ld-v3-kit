/**
 * Rolldown 构建脚本
 * 用于构建 ld-v3-kit 组件库，生成 ESM/CJS 模块和类型定义
 */

// ==================== 导入依赖 ====================
import { resolve } from 'path';
import { glob } from 'tinyglobby';
import { build, rolldown } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import process from 'process';
import { performance } from 'node:perf_hooks';
import { styleText } from 'node:util';
import consola from 'consola';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import type { BuildOptions, OutputOptions, RolldownBuild, Plugin, RolldownOutput } from 'rolldown';
import type { ProjectManifest } from '@pnpm/types';

// ==================== 项目常量 ====================

/** 构建目标 ES 版本 */
const target = 'es2018';

/** 项目根目录 */
const projRoot = resolve(__dirname, '..');

/** 包目录 */
const pkgRoot = resolve(projRoot, 'packages');

/** ld-v3-kit 包目录 */
const ldRoot = resolve(pkgRoot, 'ld-v3-kit');

/** ld-v3-kit package.json 路径 */
const ldPackage = resolve(ldRoot, 'package.json');

/** 构建输出目录 */
const buildOutput = resolve(projRoot, 'dist');

/** ld-v3-kit 输出目录 */
const ldOutput = resolve(buildOutput, 'ld-v3-kit');

/** 包名称 */
export const PKG_NAME = 'ld-v3-kit';

/** 包品牌名称 */
const PKG_BRAND_NAME = 'LD V3 Kit';

/** 包驼峰名称（用于 UMD 全局变量） */
const PKG_CAMELCASE_NAME = 'LdV3Kit';

/** tsconfig 配置路径 */
const tsconfig = resolve(projRoot, 'tsconfig.web.json');

// ==================== 类型定义 ====================

export type Module = 'esm' | 'cjs';

export interface BuildInfo {
  /** 模块类型 */
  module: 'ESNext' | 'CommonJS';
  /** 输出格式 */
  format: Module;
  /** 文件扩展名 */
  ext: 'mjs' | 'cjs' | 'js';
  /** 输出配置 */
  output: {
    /** 输出目录名称 */
    name: string;
    /** 输出目录路径 */
    path: string;
  };
  /** Bundle 配置 */
  bundle: {
    /** Bundle 路径 */
    path: string;
  };
}

/** 构建配置映射 */
export const buildConfig: Record<Module, BuildInfo> = {
  esm: {
    module: 'ESNext',
    format: 'esm',
    ext: 'mjs',
    output: {
      name: 'es',
      path: resolve(ldOutput, 'es'),
    },
    bundle: {
      path: `${PKG_NAME}/es`,
    },
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    ext: 'js',
    output: {
      name: 'lib',
      path: resolve(ldOutput, 'lib'),
    },
    bundle: {
      path: `${PKG_NAME}/lib`,
    },
  },
};

export const buildConfigEntries = Object.entries(buildConfig) as [Module, BuildInfo][];

// ==================== 工具函数 ====================

/**
 * 获取 package.json 内容
 * @param pkgPath package.json 路径
 */
const getPackageManifest = (pkgPath: string): ProjectManifest => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(pkgPath) as ProjectManifest;
};

/**
 * 获取包依赖列表
 * @param pkgPath package.json 路径
 * @returns dependencies 和 peerDependencies 列表
 */
const getPackageDependencies = (
  pkgPath: string,
): Record<'dependencies' | 'peerDependencies', string[]> => {
  const manifest = getPackageManifest(pkgPath);
  const { dependencies = {}, peerDependencies = {} } = manifest;

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies),
  };
};

/**
 * 规范化路径（处理 Windows 路径）
 * @param p 路径
 */
const normalizePath = (p: string): string => {
  if (typeof process !== 'undefined' && process.platform === 'win32') {
    return p.replace(/\\/g, '/');
  }
  return p;
};

/**
 * 排除指定目录的文件
 * @param files 文件列表
 * @returns 过滤后的文件列表
 */
const excludeFiles = (files: string[]): string[] => {
  const excludes = ['node_modules', '__tests__', '__demos__', 'style', 'dist'];
  const projRootPath = normalizePath(projRoot);
  return files.filter((file) => {
    const position = file.startsWith(projRootPath) ? projRootPath.length : 0;
    return !excludes.some((exclude) => file.includes(exclude, position));
  });
};

/**
 * 格式化 Bundle 文件名
 * @param name 基础名称
 * @param minify 是否压缩
 * @param ext 文件扩展名
 */
export function formatBundleFilename(name: string, minify: boolean, ext: string): string {
  return `${name}${minify ? '.min' : ''}.${ext}`;
}

/**
 * 生成外部依赖判断函数
 * @param options.full 是否包含所有依赖（包括 dependencies）
 */
export const generateExternal = (options: { full: boolean }) => {
  const { dependencies, peerDependencies } = getPackageDependencies(ldPackage);

  return (id: string): boolean => {
    const packages: string[] = [...peerDependencies];
    if (!options.full) {
      packages.push('@vue', ...dependencies);
    }

    return [...new Set(packages)].some((pkg) => id === pkg || id.startsWith(`${pkg}/`));
  };
};

/**
 * 错误处理并退出
 * @param err 错误对象
 */
export function errorAndExit(err: Error): never {
  consola.error(err);
  process.exit(1);
}

/**
 * 执行命令并记录时间
 * @param fnc 要执行的函数
 * @param overrideName 命令名称（可选）
 */
export async function execCommand<T extends () => Promise<void> | void>(
  fnc: T,
  overrideName?: string,
): Promise<void> {
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
 * 写入多个 Bundle
 * @param bundle Rolldown Build 实例
 * @param options 输出选项列表
 */
const writeBundles = (
  bundle: RolldownBuild,
  options: OutputOptions[],
): Promise<RolldownOutput[]> => {
  return Promise.all(options.map((option) => bundle.write(option)));
};

// ==================== 构建插件配置 ====================

/** Vue 插件配置 */
const vuePlugin = vue({
  // template: {
  //   compilerOptions: {
  //     preserveWhitespace: false,
  //   },
  // },
});

/** Vue JSX 插件 */
const vueJsxPlugin = vueJsx();

/** 构建插件列表 */
const plugins: Plugin[] = [vuePlugin as Plugin, vueJsxPlugin as Plugin];

// ==================== 构建函数 ====================

/**
 * 生成类型定义文件（.d.ts）
 */
export async function generateTypesDefinitions(): Promise<void> {
  // 获取需要处理的文件
  const input = excludeFiles(
    await glob(['**/*.{ts,tsx,vue}'], {
      cwd: ldRoot,
      absolute: true,
      onlyFiles: true,
    }),
  );

  // 获取外部依赖列表
  const ldDeps = getPackageDependencies(ldPackage);
  const pkgExternal = Object.values(ldDeps).flat();
  const external = [/^element-plus/, /^@vue/, /^vue/, /^csstype/, ...pkgExternal];

  const options: BuildOptions = {
    input,
    external,
    tsconfig,
    transform: {
      target,
    },
    plugins: dts({
      parallel: true,
      tsconfig,
      eager: true,
      vue: true,
      emitDtsOnly: true,
      compilerOptions: {
        emitDeclarationOnly: true,
        declaration: true,
      },
    }),
    output: {
      preserveModules: true,
      preserveModulesRoot: ldRoot,
      dir: resolve(buildOutput, 'types'),
    },
  };

  await build(options);
}

/**
 * 构建模块化组件（ESM/CJS）
 */
async function buildModulesComponents(): Promise<void> {
  // 获取需要处理的文件
  const input = excludeFiles(
    await glob(['**/*.{js,ts,vue}'], {
      cwd: pkgRoot,
      absolute: true,
      onlyFiles: true,
    }),
  );

  // 创建 Bundle
  const bundle = await rolldown({
    input,
    plugins,
    external: generateExternal({ full: false }),
    treeshake: { moduleSideEffects: false },
  });

  // 写入 ESM 和 CJS 输出
  await writeBundles(
    bundle,
    buildConfigEntries.map(
      ([module, config]): OutputOptions => ({
        format: config.format,
        dir: config.output.path,
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: ldRoot,
        sourcemap: true,
        entryFileNames: `[name].${config.ext}`,
      }),
    ),
  );
}

/**
 * 构建完整入口文件
 * @param minify 是否压缩
 */
async function buildFullEntry(minify: boolean): Promise<void> {
  const bundle = await rolldown({
    input: resolve(ldRoot, 'index.ts'),
    plugins,
    external: generateExternal({ full: true }),
    treeshake: true,
  });

  // 获取版本号
  const { version } = getPackageManifest(ldPackage);
  const banner = `/*! ${PKG_BRAND_NAME} v${version} */\n`;

  await writeBundles(bundle, [
    // UMD 格式
    {
      format: 'umd',
      file: resolve(ldOutput, 'dist', formatBundleFilename('index.full', minify, 'js')),
      exports: 'named',
      name: PKG_CAMELCASE_NAME,
      globals: {
        vue: 'Vue',
        'element-plus': 'ElementPlus',
      },
      sourcemap: minify,
      banner,
      minify,
      comments: {
        jsdoc: false,
      },
    },
    // ESM 格式
    {
      format: 'esm',
      file: resolve(ldOutput, 'dist', formatBundleFilename('index.full', minify, 'mjs')),
      sourcemap: minify,
      banner,
      minify,
      comments: {
        jsdoc: false,
      },
    },
  ]);
}

// ==================== 执行构建 ====================

/**
 * 并行执行所有构建任务
 */
Promise.all([
  execCommand(generateTypesDefinitions, 'Generate Types Definitions'),
  execCommand(buildModulesComponents, 'Build Modules Components'),
  execCommand(() => buildFullEntry(true), 'Build Full Entry (Minified)'),
  execCommand(() => buildFullEntry(false), 'Build Full Entry (Unminified)'),
]);
