import { Script } from "../types/terminal";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ChildProcessStatus } from "../types/terminalProcess";
import { resolve } from "path";
import { TextDecoder } from "util";
import { Log } from "./Log";

export class TerminalScript {

  name: string;

  childProcess: ChildProcessWithoutNullStreams;

  status: ChildProcessStatus = 'off';

  processLog: Log;

  constructor(script: Script) {
    const { command, workingDir } = script;

    const path = workingDir ? resolve(workingDir) : process.cwd();

    this.name = script.name ?? `"${script.command}"`

    console.log('Init script: ' + this.name)
    console.log('command: ' + command)
    console.log('cwd: ' + path);
    console.log();

    const childProcess = spawn(command, {
      cwd: path,
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: 'true'
      }
    });

    this.childProcess = childProcess;

    this.processLog = new Log();


    childProcess.stdout.on('data', this.stdOutListener);

    childProcess.stderr.on('data', this.stdOutListener);
  }

  stdOutListener = (chunk: Buffer) => {
    this.processLog.addBufferToLog(chunk);
  }

}
