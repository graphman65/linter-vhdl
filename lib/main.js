'use babel';

/* global atom */

import { exec } from 'child-process-promise';
import { dirname } from 'path';

export default {
  config: {
    vhdlCompiler: {
      title: 'VHDL Compiler',
      description: 'Path to your vhdl compiler',
      type: 'string',
      default: 'ghdl',
      order: 0,
    },
    compileOnLint: {
      title: 'Compile on lint',
      description: 'Should the linter compile file when linting (using -a) or just check the syntax (using -s)',
      type: 'boolean',
      default: false,
      order: 1,
    },
  },
  provideLinter() {
    return {
      name: 'Vhdl Linter',
      scope: 'file',
      lintsOnChange: false,
      grammarScopes: ['source.vhdl'],
      lint: async (textEditor) => {
        const argsRegex = /-- args: (.*)/g;
        const errorRegex = /.*.vhd:([0-9]+):([0-9]+): (.*)/g;

        const editorPath = textEditor.getPath();

        const compiler = atom.config.get('linter-vhdl.vhdlCompiler');
        const shouldCompile = atom.config.get('linter-vhdl.compileOnLint');
        const command = shouldCompile ? '-a' : '-s';

        const options = { cwd: dirname(editorPath) };
        const args = argsRegex.exec(textEditor.getText());
        const argsString = (args && args.length >= 2) ? args[1] : '';

        const results = [];

        try {
          await exec(`"${compiler}" ${command} "${editorPath}" ${argsString}`, options);
        } catch ({ stderr }) {
          let regexResult = errorRegex.exec(stderr);
          while (regexResult !== null) {
            const [, line, col, message] = regexResult;
            const range = [[(+line) - 1, (+col) - 1], [(+line) - 1, 1000]];
            results.push({
              severity: 'error',
              location: {
                file: editorPath,
                position: range,
              },
              excerpt: message,
              description: message,
            });
            regexResult = errorRegex.exec(stderr);
          }
        }
        return results;
      },
    };
  },
};
