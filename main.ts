import terminal from "./terminal";
import { TerminalOptions } from "./types/terminal";

const options: TerminalOptions = {
  scripts: [
    {
      command: 'npm start',
      workingDir: '../portfolio'
    }
  ]
}

terminal.startTerminal(options);