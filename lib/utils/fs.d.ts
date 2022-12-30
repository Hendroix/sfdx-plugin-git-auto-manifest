/// <reference types="node" />
declare const saveFile: (data: string, filePath: string) => Promise<void>;
declare const readFile: (filePath: string) => Promise<Buffer>;
export { saveFile, readFile };
