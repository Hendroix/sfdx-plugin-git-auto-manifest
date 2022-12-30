import * as _readline from 'readline/promises';

export default class Readline {
    _readlineInterface: _readline.Interface;

    constructor() {
        const { stdin: input, stdout: output } = process;
        this._readlineInterface = _readline.createInterface({ input, output });
    }

    async prompt(prompt: string) {
        const input = await this._readlineInterface.question(prompt);
        this._readlineInterface.close();
        return input;
    }
}
