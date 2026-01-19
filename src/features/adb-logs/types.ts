export type LogLevel = 'V' | 'D' | 'I' | 'W' | 'E';

export interface LogEntry {
    raw: string;
    timestamp?: string;
    pid?: string;
    tid?: string;
    level: LogLevel;
    tag?: string;
    message: string;
}
