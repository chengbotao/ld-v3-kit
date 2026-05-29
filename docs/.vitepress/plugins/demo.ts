import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import mdContainer from 'markdown-it-container';
import fs from 'fs';
import path from 'path';

interface DemoContainerOptions {
  docRoot: string;
  containerTag?: string; // 自定义容器标签名，默认为 "DemoContainer"
  extensions?: string[]; // 支持的文件扩展名列表，默认为 [".vue"]
}

export const mdContainerDemo = (md: MarkdownIt, options: DemoContainerOptions) => {
  const { docRoot, containerTag = 'DemoContainer', extensions = ['.vue'] } = options;

  // 校验路径是否有效
  if (!fs.existsSync(docRoot)) {
    throw new Error(`Document root path "${docRoot}" does not exist.`);
  }

  // 校验容器标签名是否合法
  if (containerTag.match(/[^\-a-zA-Z0-9]/)) {
    throw new Error(`Invalid container tag name: ${containerTag}`);
  }

  // 校验支持的文件扩展名列表
  if (!Array.isArray(extensions) || extensions.length === 0) {
    throw new Error('Invalid or empty supportedExtensions array.');
  }

  md.use(mdContainer, 'demo', {
    validate(params: string) {
      return !!params.trim().match(/^demo\s*(.*)$/);
    },
    render(tokens: Token[], idx: number) {
      if (tokens[idx].nesting === 1 /* means the tag is opening */) {
        const sourceFile = tokens[idx].info
          .trim()
          .replace(/^demo\s*/, '')
          .trim();

        // 如果没有指定文件名，直接报错
        if (!sourceFile) {
          throw new Error('No source file specified for demo container.');
        }

        // 构建完整的文件路径
        let filePath = '';
        let fileExtension = '';
        for (const ext of extensions) {
          const tempPath = path.resolve(docRoot, `${sourceFile}${ext}`);
          if (fs.existsSync(tempPath)) {
            filePath = tempPath;
            fileExtension = ext;
            break;
          }
        }

        if (!filePath) {
          throw new Error(
            `No supported file found for: ${sourceFile}. Supported extensions: ${extensions.join(', ')}`,
          );
        }

        // eslint-disable-next-line no-useless-assignment
        let rawSource = '';
        // eslint-disable-next-line no-useless-assignment
        let source = '';

        try {
          rawSource = fs.readFileSync(filePath, 'utf-8');
          source = encodeURIComponent(
            md.render(`\`\`\`${fileExtension.substring(1)}\n${rawSource}\`\`\``),
          );
        } catch (error) {
          throw new Error(`Failed to read source file: ${filePath}.`, {
            cause: error,
          });
        }
        let description = '';
        let tokenIdx = idx + 1;
        while (tokens[tokenIdx]?.type !== 'container_demo_close') {
          if (tokens[tokenIdx].content) {
            description += md.render(tokens[tokenIdx].content || '');
          }
          tokenIdx++;
        }

        return `<${containerTag} source="${source}" path="${sourceFile}" rawSource="${encodeURIComponent(rawSource)}" description="${encodeURIComponent(description)}" extension="${fileExtension}">`;
      } else {
        return `</${containerTag}>`;
      }
    },
  });
};
