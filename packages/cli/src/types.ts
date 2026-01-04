export type Argv = {
    _: string[];
    dev?: boolean;
    daemon?: boolean;
    d?: boolean;
    v?: boolean;
    V?: boolean;
    version?: boolean;
    configdir?: string;
    c?: string;
    filesdir?: string;
    f?: string;
    log?: string;
    l?: string;
};

export type Pkg = {
    name: string;
    version: string;
};

export interface Command {
    execute: (pkg: Pkg, argv: Argv) => Promise<void>;
    description: string;
    args?: string[];
}
