/// <reference types="node" />
declare const saveFile: (data: string, filePath: string) => Promise<void>;
declare const readFile: (filePath: string) => Promise<Buffer>;
declare const checkIfFileExsists: (filePath: string) => Promise<boolean>;
declare const checkIfFolderExsists: (filePath: string) => Promise<boolean>;
export { saveFile, readFile, checkIfFileExsists, checkIfFolderExsists };
