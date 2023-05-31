import { Terminal } from "./classes/Terminal";
import { TerminalOptions } from "./types/terminal";

const options: TerminalOptions = {
  scripts: [
    {
      name: 'pfolio',
      command: 'npm start',
      workingDir: '../portfolio'
    },
    {
      name: 'test 1',
      command: 'node test.js'
    },
    {
      name: 'test 2',
      command: 'node test.js -m 5000'
    },
    {
      name: 'test 3',
      command: 'node test.js -e 5'
    },
  ]
}

const terminal = new Terminal(options);
terminal.start();