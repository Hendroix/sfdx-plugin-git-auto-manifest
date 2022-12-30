import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { addToGit, getBranchName, getDiffs } from './utils/git';
import { CREATE_MANIFEST_COMMAND, getManifest } from './utils/manifest';
import { saveFile } from './utils/fs';
import { log } from './utils/logger';
import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import Readline from './utils/readlineInterface';

const exec = promisify(_exec);

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-plugin-git-auto-manifest', 'manifest');

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
        debug: flags.boolean({
            char: 'd',
            description: messages.getMessage('silentFlagDescription'),
            default: false
        })
    };

    public async run() {
        const branchConfig = await getBranchName();
        const manifestFileNameWithPath = this.args.fileName || branchConfig.manifestFilePath;

        const diff = await getDiffs(this.flags.branch, branchConfig.currentBranchName);
        const oldManifest = await getManifest(manifestFileNameWithPath);

        if (diff.length > 0 || oldManifest?.types?.length > 0) {
            await exec(CREATE_MANIFEST_COMMAND(diff, manifestFileNameWithPath?.replace('.xml', '')));
            const manifest = await getManifest(manifestFileNameWithPath);
            manifest.merge(oldManifest);

            if (oldManifest) {
                await saveFile(manifest.toXML(), manifestFileNameWithPath);
                const shouldAddToGit = await new Readline().prompt('Do you want to add the manifest to git? (y/n)');
                log(shouldAddToGit);
                if (shouldAddToGit !== 'n') {
                    await addToGit(manifestFileNameWithPath);
                }
            } else {
                log('No applicable files have changed, skipping creation/save');
            }
        } else {
            log(`No differnceses found between ${branchConfig.currentBranchName} and ${this.flags.branch}`);
        }
    }
}
