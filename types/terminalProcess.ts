import { Log } from "../classes/Log";

export type ProcessStatus = 'off' | 'running' | 'error' | 'exited';

export interface TerminalProcessRenderInfo {
  command: string;
  name: string;
  status: ProcessStatus;
  hasErr: boolean;
  processLog: Log;
}