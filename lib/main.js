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
    },
  },
  provideLinter() {
    return {
      name: 'Vhdl Linter',
      scope: 'file',
      lintsOnChange: false,
      grammarScopes: ['source.vhdl'],
      lint: async (textEditor) => {
        const errorRegex = /.*.vhd:([0-9]+):([0-9]+): (.*)/g;
        const editorPath = textEditor.getPath();
        const compiler = atom.config.get('linter-vhdl.vhdlCompiler');
        const options = { cwd: dirname(editorPath) };
        var results = [];
        try {
          await exec(`"${compiler}" -a "${editorPath}"`, options);
        } catch ({ stderr }) {
          var regexResult;
          while ((regexResult = errorRegex.exec(stderr)) !== null) {
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
          }
        }
        return results;
      },
    };
  },
};
