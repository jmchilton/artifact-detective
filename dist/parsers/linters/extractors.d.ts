export interface LinterMatch {
    linterType: string;
    startLine: number;
    endLine: number;
    content: string;
}
export declare const LINTER_PATTERNS: {
    type: string;
    patterns: RegExp[];
}[];
export declare function detectLinterType(jobName: string, logContent: string): string | null;
export declare function extractLinterOutput(linterType: string, logContent: string): string | null;
//# sourceMappingURL=extractors.d.ts.map