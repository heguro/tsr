import { describe, it } from 'node:test';
import { FileService } from './FileService.js';
import ts from 'typescript';
import assert from 'node:assert/strict';
import { removeExport } from './removeExport.js';

const setup = () => {
  const fileService = new FileService();

  const languageService = ts.createLanguageService({
    getCompilationSettings() {
      return {};
    },
    getScriptFileNames() {
      return fileService.getFileNames();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getScriptVersion(fileName) {
      return fileService.getVersion(fileName);
    },
    getScriptSnapshot(fileName) {
      return ts.ScriptSnapshot.fromString(fileService.get(fileName));
    },
    getCurrentDirectory: () => '.',

    getDefaultLibFileName(options) {
      return ts.getDefaultLibFileName(options);
    },
    fileExists: (name) => fileService.exists(name),
    readFile: (name) => fileService.get(name),
  });

  return { languageService, fileService };
};

describe('removeExport', () => {
  it('should not remove export for variable if its used in some other file', () => {
    const { languageService, fileService } = setup();
    fileService.set(
      '/tools/remove-unused-code/case/index.ts',
      `import { hello } from './hello';
      console.log(hello);
    `,
    );
    fileService.set(
      '/tools/remove-unused-code/case/hello.ts',
      `export const hello = 'hello';`,
    );

    removeExport({
      languageService,
      fileService,
      targetFile: '/tools/remove-unused-code/case/hello.ts',
    });

    const result = fileService.get('/tools/remove-unused-code/case/hello.ts');
    assert.equal(result.trim(), `export const hello = 'hello';`);
  });

  it('should remove export for variable if its not used in some other file', () => {
    const { languageService, fileService } = setup();
    fileService.set(
      '/tools/remove-unused-code/case/world.ts',
      `export const world = 'world';`,
    );

    removeExport({
      languageService,
      fileService,
      targetFile: '/tools/remove-unused-code/case/world.ts',
    });

    const result = fileService.get('/tools/remove-unused-code/case/world.ts');

    assert.equal(result.trim(), `const world = 'world';`);
  });

  it('should not remove export for variable if it has a comment to ignore', () => {
    const { languageService, fileService } = setup();
    fileService.set(
      '/tools/remove-unused-code/case/with-comment.ts',
      `// ts-remove-unused-skip
export const world = 'world';`,
    );

    removeExport({
      languageService,
      fileService,
      targetFile: '/tools/remove-unused-code/case/with-comment.ts',
    });

    const result = fileService.get(
      '/tools/remove-unused-code/case/with-comment.ts',
    );

    assert.equal(
      result.trim(),
      `// ts-remove-unused-skip
export const world = 'world';`,
    );
  });
});
