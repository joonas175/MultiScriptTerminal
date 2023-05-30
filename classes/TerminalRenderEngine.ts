import { Readline } from "readline/promises";
import { green } from "../util/stringStyles";
import { TerminalScript } from "./TerminalScript";
import { TerminalProcessRenderInfo } from "../types/terminalProcess";
import { Log } from "./Log";
const readline = new Readline(process.stdout, {autoCommit: false});

export class TerminalRenderEngine {

  scripts: TerminalProcessRenderInfo[] = [];

  constructor(scripts: TerminalProcessRenderInfo[]) {
    this.scripts = scripts;
  }

  rendering = false;

  lastRender: number = 0;

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

    this.rendering = true;

    const maxLines = process.stdout.rows;
    let rowsWritten = 0;

    await this.clearScreen();

    rowsWritten = await this.renderHeader(index, debug);

    await this._renderLog(
      this.scripts[index].processLog,
      maxLines - 5
    );
    
    this.lastRender = performance.now();

    this.rendering = false;
    this.next.shift()?.();
  }

  renderHeader = (index: number, debug: boolean) : number => {
    let headerStr = '';
    for(const _idx in this.scripts) {
      const idx = parseInt(_idx);
      const str = `[${idx}: ${this.scripts[idx].name}]  `;
      headerStr += index === idx ? green(str) : str;
    }

    headerStr += '\n';
    if(debug) {
      let debugStr = `renderTime ${this.lastRender}`;
      headerStr += debugStr.padStart(process.stdout.columns);
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
      index++;
    }
    while(index <= lines) {
      logStr += '\n';
      index++;
    }
    process.stdout.write(logStr);
    await readline.commit();
  }
}