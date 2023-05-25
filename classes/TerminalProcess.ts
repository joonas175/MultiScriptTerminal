import { Script } from "../types/terminal";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ChildProcessStatus } from "../types/terminalProcess";
import { resolve } from "path";
import { TextDecoder } from "util";

export class TerminalProcess {

  childProcess: ChildProcessWithoutNullStreams;

  status: ChildProcessStatus = 'off';

  log: string = '';

  decoder = new TextDecoder();


  constructor(script: Script) {
    const { command, workingDir } = script;

    const path = workingDir ? resolve(workingDir) : process.cwd();

    console.log('cwd: ' + path);
    console.log('command: ' + command)

    this.decoder = new TextDecoder();

    const childProcess = spawn(command, {
      cwd: path,
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: 'true'
      }
    });

    this.childProcess = childProcess;


    childProcess.stdout.on('data', this.stdOutListener);

    childProcess.stderr.on('data', this.stdOutListener);
  }

  stdOutListener = (chunk: Int16Array) => {
    const decoded = this.decoder.decode(chunk);
    this.log += decoded;
  }

}
