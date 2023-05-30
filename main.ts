import { Terminal } from "./classes/Terminal";
import { TerminalOptions } from "./types/terminal";

const options: TerminalOptions = {
  scripts: [
    {
      command: 'npm start',
      workingDir: '../portfolio'
    }
  ]
}

//terminal.startTerminal(options);
const terminal = new Terminal(options);
terminal.start();