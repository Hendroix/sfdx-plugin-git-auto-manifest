"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfFolderExsists = exports.checkIfFileExsists = exports.readFile = exports.saveFile = void 0;
const fs_1 = require("fs");
const logger_js_1 = require("./logger.js");
const saveFile = async (data, filePath) => {
    try {
        await fs_1.promises.writeFile(filePath, Buffer.from(data));
        (0, logger_js_1.log)(`File: ${filePath} was written to disk.`);
    }
    catch (error) {
        console.log('File: Failed to writte file to disk.');
        console.error(error);
    }
};
exports.saveFile = saveFile;
const readFile = async (filePath) => {
    return await fs_1.promises.readFile(filePath);
};
exports.readFile = readFile;
const checkIfFileExsists = async (filePath) => {
    return fs_1.promises
        .stat(filePath)
        .then(() => true)
        .catch(() => false);
};
exports.checkIfFileExsists = checkIfFileExsists;
const checkIfFolderExsists = async (filePath) => {
    return fs_1.promises
        .access(filePath)
        .then(() => true)
        .catch(() => false);
};
exports.checkIfFolderExsists = checkIfFolderExsists;
//# sourceMappingURL=fs.js.map