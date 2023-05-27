import { Log } from "../classes/Log";
import { TerminalScript } from "../classes/TerminalScript";

export interface Script {
  name?: string,
  command: string,
  workingDir?: string,
}

export interface TerminalOptions {
  scripts?: Script[]
}

export type TerminalStatus = 'off' | 'init' | 'running' | 'error' | 'exited';

export type TerminalStateListener = (key: keyof TerminalState) => void;

export interface TerminalState {
  status: TerminalStatus
  scripts: TerminalScript[]
  selectedScript: number
  selectedLog: Log | null
  lastRender: number
  mainProcessLog: Log
  stateChangedListener: TerminalStateListener | null
}

