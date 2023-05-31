import { Script } from "../types/terminal";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ProcessStatus, TerminalProcessRenderInfo } from "../types/terminalProcess";
import { resolve } from "path";
import { Log, LogEventType } from "./Log";

export type TerminalScriptEventListener = (event: LogEventType | ProcessStatus ) => void;

export class TerminalScript implements TerminalProcessRenderInfo {

  name: string;

  path: string;

  command: string;

  childProcess: ChildProcessWithoutNullStreams | null = null;

  status: ProcessStatus = 'off';

  processLog: Log;

  hasErr: boolean = false;

  eventListener: TerminalScriptEventListener;

  constructor(script: Script, listener: TerminalScriptEventListener) {
    const { command, workingDir } = script;

    this.path = workingDir ? resolve(workingDir) : process.cwd();

    this.name = script.name ?? `"${script.command}"`

    this.command = command;

    this.processLog = new Log();

    this.eventListener = listener;

    this.processLog.eventListener = listener;
  }

  start() {
    console.log('Init script: ' + this.name)
    console.log('command: ' + this.command)
    console.log('cwd: ' + this.path);
    console.log();

    const childProcess = spawn(this.command, {
      cwd: this.path,
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: 'true'
      }
    });

    this.childProcess = childProcess;

    childProcess.stdout.on('data', this.stdOutListener);

    childProcess.stderr.on('data', this.stdErrListener);

    childProcess.on('exit', this.onExitListener);

    childProcess.on('error', (err) => {
      this.status = 'error';
      this.eventListener('error');
    });
  }

  stdErrListener = (chunk: Buffer) => {
    this.hasErr = true;
    this.processLog.addBufferToLog(chunk);
  }

  stdOutListener = (chunk: Buffer) => {
    this.hasErr = false;
    this.processLog.addBufferToLog(chunk);
  }

  onExitListener = (code: number | null) => {
    if(code !== 0) {
      this.status = 'error';
    } else {
      this.status = 'exited'
    }
    const str = `Script ${this.name} exited with code ${code}`;
    this.processLog.addStringToLog(str);
    this.eventListener('exited');
  }

}
