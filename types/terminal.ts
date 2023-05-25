import { TerminalProcess } from "../classes/TerminalProcess";

export interface Script {
  command: string,
  workingDir?: string,
}

export interface TerminalOptions {
  scripts?: Script[]
}

export type TerminalStatus = 'off' | 'init' | 'running' | 'error';

export interface TerminalState {
  status: TerminalStatus
  processes: TerminalProcess[]
}