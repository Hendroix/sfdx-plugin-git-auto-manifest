import { promises as fs } from 'fs';
import { log } from './logger.js';

const saveFile = async (data: string, filePath: string) => {
    try {
        await fs.writeFile(filePath, Buffer.from(data));
        log(`File: ${filePath} was written to disk.`);
    } catch (error) {
        console.log('File: Failed to writte file to disk.');
        console.error(error);
    }
};

const readFile = async (filePath: string) => {
    return await fs.readFile(filePath);
};

const checkIfFileExsists = async (filePath: string) => {
    return fs
        .stat(filePath)
        .then(() => true)
        .catch(() => false);
};

export { saveFile, readFile, checkIfFileExsists };
