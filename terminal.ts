import { TextDecoder } from "util";
import { TerminalProcess } from "./classes/TerminalProcess";
import { TerminalOptions, TerminalState } from "./types/terminal";

const state: TerminalState = {
  status: 'off',
  processes: [],
}

export const defaultOptions: TerminalOptions = {
  
}

export const startTerminal = (options: TerminalOptions = defaultOptions) => {
  try {

    // Setup guards
    const { status } = state;
    const { scripts } = options;
    if(status !== 'off') {
      throw 'MultiScriptTerminal already running!';
    } else if(!scripts) {
      throw 'No scripts to run, exiting...';
    } else if(!process.stdout.isTTY) {
      throw 'No scripts to run, exiting...';
    }

    for (const script of scripts) {
      const childProcess = new TerminalProcess(script);
      state.processes.push(childProcess);
    }

    const stdinRawListener = (buf: Buffer) => {
      const char = buf.toString();
      if(char === 'q') {
        process.exit();
      } else {
        console.log(char);
      }
    }

    const stdinInputListener = (buf: Buffer) => {
      
    }

    const decoder = new TextDecoder();

    process.stdin.setRawMode(true);

    process.stdin.on('data', stdinRawListener)

  } catch(e) {
    state.status = 'error';
    console.error('Exited with error: ', e)
  }

}

const render = () => {

}


export default {
  startTerminal,
};