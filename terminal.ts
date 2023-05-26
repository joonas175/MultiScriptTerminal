import { Log } from "./classes/Log";
import { TerminalScript } from "./classes/TerminalScript";
import { TerminalOptions, TerminalState } from "./types/terminal";
import { Readline } from "readline/promises";


export const defaultOptions: TerminalOptions = {
  
}

export const startTerminal = (options: TerminalOptions = defaultOptions) => {

  const _state: TerminalState = {
    status: 'off',
    scripts: [],
    selectedScript: 0,
    selectedLog: null,
    lastRender: 0,
    mainProcessLog: new Log()
  }

  try {
    const state: TerminalState = new Proxy(_state, {
      set(target, p: keyof TerminalState, value) {

        Reflect.set(target, p, value);
          //render();
        target.lastRender = performance.now();
        
        return true;
      },
    });
    console.log = (str) => {
      if(str) {
        if(typeof str !== 'string') {
          str = str.toString();
        }
        state.mainProcessLog.addStringToLog(str);
      }
    }

    // Setup guards
    const { status } = state;
    const { scripts } = options;
    if(['init', 'running'].includes(status)) {
      throw 'MultiScriptTerminal already running!';
    } else if(!scripts) {
      throw 'No scripts to run, exiting...';
    } else if(!process.stdout.isTTY) {
      throw 'No scripts to run, exiting...';
    }

    _state.status = 'init';

    const blank = '\n'.repeat(process.stdout.rows);
    process.stdout.write(blank);

    const readline = new Readline(process.stdout, {autoCommit: false});

    readline.cursorTo(0, 0);
    readline.clearScreenDown();
    readline.commit();

    for (const index in scripts) {
      const script = scripts[index];
      const terminalScript = new TerminalScript(script);
      state.scripts.push(terminalScript);
    }

    const clearScreen = async () => {
      readline.cursorTo(0, 0);
      readline.clearScreenDown();
      await readline.commit();
    }

    const renderLog = async (processLog: Log, lines?: number) => {
      lines = lines ?? process.stdout.rows - 5;

      const log = processLog.getLines(lines);

      const endIndex = log.length - 1;
      let index = 0;
      while(index <= endIndex) {
        process.stdout.write(`${log[index]}\n`);
        index++;
      }
      while(index <= lines) {
        process.stdout.write(`\n`);
        index++;
      }
      await readline.commit();
    }

    const render = async () => {
      await clearScreen();
      const { selectedScript } = state;
      if(selectedScript >= -1) {
        await renderLog(selectedScript === -1 ? state.mainProcessLog : state.scripts[selectedScript].processLog);
      }
    }

    const stdinRawListener = (buf: Buffer) => {
      const char = buf.toString();
      const num = parseInt(char);
      if(char === 'q' || char === '\u0003') {
        process.exit();
      } else if(!isNaN(num)) {
        const prevIndex = state.selectedScript;
        const scriptIndex = num - 1;
        if(scriptIndex < state.scripts.length) {
          state.selectedScript = scriptIndex;

          if(scriptIndex === -1) {
            state.selectedLog === state.mainProcessLog;
          } else {
            state.selectedLog === state.scripts[scriptIndex].processLog;
          }
          
          scriptIndex === -1 
            ? console.log("switched to main process")
            : console.log(`switch to script ${state.scripts[scriptIndex].name} at index ${scriptIndex}`);
          
        } else {
          console.log(`no script at index ${scriptIndex}, state left unchanged`);
        }
        
      } else if(char === 'r') {
        process.stdin.setRawMode(false);
      } else if (buf[0] === 27 && buf[1] === 91){
        const { selectedLog } = state;
        switch (buf[2]) {
          case 65: // Up arrow press
            if(selectedLog) {
              selectedLog.goUp();
            }
            break;

          case 66: // Down arrow press
            if(selectedLog) {
              selectedLog.goDown();
            }
            break;
          case 67: // Right arrow press
          case 68: // Left arrow press 
        }
      } else {
        console.log(JSON.stringify(buf));
      }
      render();
    }

    const stdinInputListener = (buf: Buffer) => {
      const strIn = buf.toString();
      console.log(strIn);
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
      render();
    }

    process.stdin.setRawMode(true);

    process.stdin.on('data', (buf: Buffer) => {
      process.stdin.isRaw ? stdinRawListener(buf) : stdinInputListener(buf);
    })

    _state.status = 'running';
    render();

  } catch(e) {
    _state.status = 'error';
    console.error('Exited with error: ', e)
  }

}


export default {
  startTerminal,
};