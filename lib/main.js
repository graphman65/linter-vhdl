'use babel';

/* global atom */

import { exec } from 'child-process-promise';
import { dirname } from 'path';

function getEnvVars(varString) {
  try {
    return JSON.parse(varString);
  } catch (_) {
    return {};
  }
}

export default {
  config: {
    vhdlCompiler: {
      title: 'VHDL Compiler',
      description: 'Path to your vhdl compiler',
      type: 'string',
      default: 'ghdl',
      order: 0,
    },
    compileArgs: {
      title: 'Compiler arguments',
      description: 'Arguments to pass to the compiler',
      type: 'string',
      default: '',
      order: 1,
    },
    compileEnvVars: {
      title: 'Compiler environment variables',
      description:
        'Environment variables to pass to the compiler (format: "NAME1=VALUE1 NAME2=VALUE2")',
      type: 'string',
      default: '',
      order: 2,
    },
    compileOnLint: {
      title: 'Compile on lint',
      description:
        'Should the linter compile file when linting (using -a) or just check the syntax (using -s)',
      type: 'boolean',
      default: false,
      order: 3,
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
        const compileArgs = atom.config.get('linter-vhdl.compileArgs');
        const shouldCompile = atom.config.get('linter-vhdl.compileOnLint');
        const command = shouldCompile ? '-a' : '-s';

        const options = {
          cwd: dirname(editorPath),
          env: {
            ...process.env,
            ...getEnvVars(atom.config.get('linter-vhdl.compileEnvVars')),
          },
        };

        const args = argsRegex.exec(textEditor.getText());
        let argsString = args && args.length >= 2 ? args[1] : '';
        argsString = argsString.concat(' ', compileArgs);

        const results = [];

        try {
          await exec(
            `"${compiler}" ${command} ${argsString} "${editorPath}"`,
            options,
          );
        } catch ({ stderr }) {
          let regexResult = errorRegex.exec(stderr);
          while (regexResult !== null) {
            const [, line, col, message] = regexResult;
            const range = [
              [+line - 1, +col - 1],
              [+line - 1, 1000],
            ];
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
