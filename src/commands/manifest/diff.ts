import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-plugin-git-auto-manifest', 'org');

export default class Diff extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');
    public static examples = messages.getMessage('diffExamples').split(os.EOL);
    public static args = [{ name: 'fileName' }];

    protected static flagsConfig = {
        branch: flags.string({
            char: 'b',
            description: messages.getMessage('branchFlagDescription'),
            required: true,
            default: 'RC'
        }),
        silent: flags.boolean({
            char: 's',
            description: messages.getMessage('silentFlagDescription'),
            default: true
        })
    };

    public async run(): Promise<AnyJson> {
        console.log(this.flags, this.args);
        return;
    }
}
