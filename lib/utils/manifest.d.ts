interface tag {
    start: string;
    end: string;
    regexp?: RegExp;
}
declare class Manifest {
    comment: string;
    package: tag;
    types: Map<string, Set<string>>;
    version: string;
    constructor(xml: string);
    parseXML(xml: string): void;
    addMember(type: string, name: string): void;
    createTag(type: string, value: string, indentLevel?: number): string;
    createTypes(): string;
    merge(manifest: Manifest): void;
    toXML(): string;
}
declare const getManifest: (filePath: string) => Promise<Manifest>;
declare const createManifest: (sourcePaths: string[], manifestFilePath: string) => Promise<void>;
export { Manifest, getManifest, createManifest };
