'use babel';

import { exec } from 'child_process';
import { dirname } from 'path';

export default {
  provideLinter() {
    return {
      name: 'Vhdl Linter',
      scope: 'file',
      lintsOnChange: false,
      grammarScopes: ['source.vhdl'],
      lint(textEditor) {
        const errorRegex = /.*.vhd:([0-9]+):([0-9]+): (.*)/g;
        const editorPath = textEditor.getPath();

        return new Promise((resolve) => {
          exec(`cd ${dirname(editorPath)}; ghdl -a ${editorPath}`, (error, stdout, stderr) => {
            const tmp = errorRegex.exec(stderr);

            if (tmp && tmp.length > 3) {
              const range = [[(+tmp[1]) - 1, (+tmp[2]) - 1], [(+tmp[1]) - 1, 1000]];
              return resolve([{
                severity: 'error',
                location: {
                  file: editorPath,
                  position: range,
                },
                excerpt: tmp[3],
              }]);
            }
            return resolve([]);
          });
        });
      }
    };
  }

};
