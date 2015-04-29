module ESTree {
    export interface Node {
        type: string;
        loc?: SourceLocation;
    }

    export interface SourceLocation {
        source?: string;
        start: Position;
        end: Position;
    }

    export interface Position {
        line: number; // >= 1
        column: number; // >= 0
    }

    export interface Program extends Node {
        body: Statement[];
    }

    export interface Statement extends Node {

    }
}