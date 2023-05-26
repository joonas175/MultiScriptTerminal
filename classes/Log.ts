
type LogEventType = 'log' |  'offset';

type LogEventListener = (event: LogEventType) => void;

export class Log {

  logContent: string[] = [];

  decoder = new TextDecoder();

  endIndex: number = -1;

  eventListener: LogEventListener | null = null;

  constructor() {

  }

  addBufferToLog(chunk: Buffer) {
    const str = chunk.toString();
    this.addStringToLog(str);
  }

  addStringToLog(str: string) {
    const atEnd = this.endIndex === this.logContent.length - 1;
    const lines = str.split(/\r\n|\r|\n/);
    this.logContent.push(...lines);
    if(atEnd) {
      this.endIndex += lines.length;
    } 
  }

  getLines(count: number) {
    return this.logContent.slice(Math.max(0, this.endIndex - count), Math.max(count, this.endIndex));
  }

  goUp() {
    if(this.endIndex >= 0) {
      this.endIndex--;
    }
  }

  goDown() {
    if(this.endIndex < this.logContent.length - 1) {
      this.endIndex++;
    }
  }

  goToEnd() {
    this.endIndex = this.logContent.length - 1;
  }

  goToStart() {
    this.endIndex = 0;
  }

}