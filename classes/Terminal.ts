import { Script } from "../types/terminal";
import { ProcessStatus, TerminalProcessRenderInfo } from "../types/terminalProcess";
import { Log, LogEventType } from "./Log";
import { TerminalRenderEngine } from "./TerminalRenderEngine";
import { TerminalScript } from "./TerminalScript";


export type TerminalStateListener = (key: keyof TerminalState) => void;

export interface TerminalState extends TerminalProcessRenderInfo {
  status: ProcessStatus
  selectedScript: number
  processLog: Log
  stateChangedListener: TerminalStateListener | null
  debug: boolean
}

export interface TerminalOptions {
  scripts?: Script[]
}

export const defaultOptions: TerminalOptions = {
  
}

/**
 * Main class to run MultiScriptTerminal
 */
export class Terminal {

  state: TerminalState = new Proxy({
    status: 'off',
    selectedScript: 1,
    processLog: new Log(),
    stateChangedListener: null,
    debug: false,
    name: 'Main Process',
    hasErr: false,
  }, {
    set: (target, p: keyof TerminalState, value) => {
      Reflect.set(target, p, value);
      this.state.stateChangedListener?.(p);
      return true;
    }
  });

  scripts: TerminalScript[] = [];

  renderEngine: TerminalRenderEngine;

  constructor(options: TerminalOptions = defaultOptions) {
    const { status } = this.state;
    const { scripts } = options;
    if(['init', 'running'].includes(status)) {
      throw 'MultiScriptTerminal already running!';
    } else if(!scripts) {
      throw 'No scripts to run, exiting...';
    } else if(!process.stdout.isTTY) {
      throw 'Not a terminal window, exiting...';
    }

    for (const index in scripts) {
      const script = scripts[index];
      const terminalScript = new TerminalScript(script);
      terminalScript.processLog.eventListener = (event: LogEventType) => {
        this.logListener(event, parseInt(index) + 1);
      }
      this.scripts.push(terminalScript);
    }

    this.state.processLog.eventListener = (event: LogEventType) => {
      this.logListener(event, 0);
    }

    this.renderEngine = new TerminalRenderEngine([this.state, ...this.scripts]);
  }

  async start() {
    const blank = '\n'.repeat(process.stdout.rows);
    process.stdout.write(blank, async () => {
      await this.renderEngine.clearScreen();
    });

    this.state.stateChangedListener = this.render;

    for(const script of this.scripts) {
      script.start();
    }

    process.stdin.setRawMode(true);

    process.stdin.on('data', (buf: Buffer) => {
      process.stdin.isRaw ? this.stdinRawListener(buf) : this.stdinInputListener(buf);
    });

    console.log = (str) => {
      if(str) {
        if(typeof str !== 'string') {
          str = str.toString();
        }
        this.state.processLog.addStringToLog(str);
      }
    }
  }

  logListener = (event: LogEventType, scriptIndex: number) => {
    if(this.state.selectedScript === scriptIndex) {
      this.render();
    }
  }

  render = () => {
    const { selectedScript, debug } = this.state;
    this.renderEngine.renderLog(selectedScript, debug);
  }

  stdinRawListener = (buf: Buffer) => {
    const { state, scripts } = this;
    const char = buf.toString();
    const num = parseInt(char);
    switch (char) {
      case 'q':
      case '\u0003':
        process.exit();
      case 'd':
        state.debug = !state.debug; return;
      case 'r':
        process.stdin.setRawMode(false); return;
    }

    if(!isNaN(num) && num >= 0 && num <= scripts.length) {
      console.log(`selected script set to ${num}`);
      state.selectedScript = num;
      return;
    }

    if(buf[0] === 27 && buf[1] === 91){
      const selectedLog = this.getSelectedLog();
      switch (buf[2]) {
        case 65: // Up arrow press
          selectedLog?.goUp?.();
          break;
        case 66: // Down arrow press
          selectedLog?.goDown?.();
          break;
        case 67: // Right arrow press
        case 68: // Left arrow press 
      }
    } else {
      console.log(JSON.stringify(buf));
    }
  }

  stdinInputListener = (buf: Buffer) => {
    const strIn = buf.toString();
    if(strIn.startsWith("/")) {
      const commands = strIn.replaceAll("/", "").trim().split(" ");
      for(const command of commands) {
        console.log("Command given: " + command);
        switch(command) {
          case 'raw':
            process.stdin.setRawMode(true); break;
        }
      }
    }
  }

  getSelectedLog = () : Log | undefined => {
    const { state, scripts } = this;
    return state.selectedScript === 0 ? state.processLog : scripts[state.selectedScript].processLog;
  }

}