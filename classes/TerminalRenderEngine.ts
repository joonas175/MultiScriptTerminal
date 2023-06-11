import { Readline } from "readline/promises";
import { ColorFunction, boldUnderline, darkGrayBg, green, lightGray, red, reset, underLine } from "../util/stringStyles";
import { ProcessStatus, TerminalProcessRenderInfo } from "../types/terminalProcess";
import { Log } from "./Log";
const readline = new Readline(process.stdout, {autoCommit: false});

export class TerminalRenderEngine {

  scripts: TerminalProcessRenderInfo[] = [];

  constructor(scripts: TerminalProcessRenderInfo[]) {
    this.scripts = scripts;
  }

  rendering = false;

  renderTimes: number[] = [];

  next: Function[]= [];

  async clearScreen() {
    readline.cursorTo(0, 0);
    readline.clearScreenDown();
    await readline.commit();
  }

  renderLog = async (index: number, debug: boolean) => {
    if(this.rendering) {
      this.next.push(() => this.renderLog(index, debug));
      return;
    }

    const startTime = performance.now();

    this.rendering = true;

    const maxLines = process.stdout.rows;
    let rowsWritten = 0;

    await this.clearScreen();

    rowsWritten = await this.renderHeader(index, debug);

    await this._renderLog(
      this.scripts[index].processLog,
      maxLines - rowsWritten - 3
    );
    
    const endTime = performance.now();
    const renderTimeInMs = endTime - startTime;
    this.addToRenderTimes(renderTimeInMs);

    this.rendering = false;
    this.next.shift()?.();
  }

  statusToColor: Record<ProcessStatus, ColorFunction> = {
    off: lightGray,
    running: reset,
    error: red,
    exited: green,
  }

  renderHeader = (index: number, debug: boolean) : number => {
    const headerStrings: string[] = [];
    for(const _idx in this.scripts) {
      const idx = parseInt(_idx);
      let str = `[${idx}: ${this.scripts[idx].name}]`;
      str = this.statusToColor[this.scripts[idx].status](str);
      headerStrings.push(index === idx ? darkGrayBg(str) : str);
    }

    headerStrings.push(headerStrings.shift()!);
    const columns = process.stdout.columns;
    let lineLength = 0;
    let headerStr = "";
    while(headerStrings.length > 0) {
      const next = headerStrings.shift();
      if(lineLength + next!.length > columns) {
        headerStr += `\n${next} `;
        lineLength = next!.length + 1;
      } else {
        headerStr += `${next} `;
        lineLength += next!.length + 1;
      }
    }

    headerStr += '\n';
    if(debug) {
      let debugStr = 'cmd: ' + this.scripts[index].command;
      debugStr += `avg fps ${this.getFps().toFixed(0)}`.padStart(process.stdout.columns - debugStr.length);
      headerStr += debugStr + "\n";
    }
    headerStr += '-'.repeat(process.stdout.columns);

    process.stdout.write(headerStr + "\n");

    return headerStr.split('\n').length;
  }

  _renderLog = async (processLog: Log, lines: number) => {
    const log = processLog.getLines(lines);
    let logStr = "";

    const endIndex = log.length - 1;
    let index = 0;
    while(index <= endIndex) {
      logStr += `${log[index]}\n`;
      const lines = Math.ceil(log[index].length / process.stdout.columns);
      index += lines || 1;
    }
    while(index <= lines) {
      logStr += '\n';
      index++;
    }
    process.stdout.write(logStr);
    await readline.commit();
  }

  addToRenderTimes(time: number) {
    this.renderTimes.push(time);
    if(this.renderTimes.length > 10) {
      this.renderTimes.shift();
    }
  }

  getFps() {
    let acc = 0;
    for(const time of this.renderTimes) {
      acc += time;
    }
    return 1000 / (acc / this.renderTimes.length);
  }
}