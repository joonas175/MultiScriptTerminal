
type LogEventType = 'log' |  'offset';

type LogEventListener = (event: LogEventType) => void;

export class Log {

  logContent: string[] = [];

  decoder = new TextDecoder();

  endIndex: number = -1;

  eventListener: LogEventListener | null = null;

  lastCount: number = 0;

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
      this.eventListener && this.eventListener('log');
    }
  }

  getLines(count: number) {
    this.lastCount = count;
    return this.logContent.slice(Math.max(0, this.endIndex - count), Math.max(count, this.endIndex));
  }

  goUp() {
    if(this.endIndex - this.lastCount > 0) {
      this.endIndex--;
      this.eventListener && this.eventListener('offset');
    }
  }

  goDown() {
    if(this.endIndex < this.logContent.length - 1) {
      this.endIndex++;
      this.eventListener && this.eventListener('offset');
    }
  }

  goToEnd() {
    this.endIndex = this.logContent.length - 1;
    this.eventListener && this.eventListener('offset');
  }

  goToStart() {
    this.endIndex = 0;
    this.eventListener && this.eventListener('offset');
  }
}