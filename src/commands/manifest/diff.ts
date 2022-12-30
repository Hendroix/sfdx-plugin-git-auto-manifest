import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { addToGit, getBranchName, getDiffs } from '../../utils/git';
import { getManifest, createManifest, Manifest } from '../../utils/manifest';
import { checkIfFileExsists, saveFile } from '../../utils/fs';
import { log } from '../../utils/logger';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-plugin-git-auto-manifest', 'manifest');

export default class Diff extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');
    public static examples = messages.getMessage('diffExamples').split(os.EOL);
    public static args = [{ name: 'fileName' }];

    currentBranch: string;
    compareBranch: string;
    manifestFileNameWithPath: string;

    newManifest: Manifest;
    oldManifest: Manifest;
    diffs: Array<string> = [];

    protected static flagsConfig = {
        'from-branch': flags.string({
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
        this.compareBranch = this.flags['from-branch'];
        const branchConfig = await getBranchName();
        this.currentBranch = branchConfig.currentBranchName;
        this.manifestFileNameWithPath = this.args.fileName || branchConfig.manifestFilePath;

        this.ux.startSpinner('Fetching diffs');
        this.diffs = await getDiffs(this.compareBranch, this.currentBranch);
        this.ux.stopSpinner();

        this.ux.startSpinner('Checking for exsisting manifest');
        const hasOldManifest = checkIfFileExsists(this.manifestFileNameWithPath);
        this.ux.stopSpinner();

        if (hasOldManifest) {
            log('Found old Manifest');
            this.oldManifest = await getManifest(this.manifestFileNameWithPath);
        }

        if (this.diffs.length > 0 || this.oldManifest?.types?.size > 0) {
            this.ux.startSpinner('Creating new manifest');
            await createManifest(this.diffs, this.manifestFileNameWithPath);
            const manifest = await getManifest(this.manifestFileNameWithPath);
            this.ux.stopSpinner();

            if (this.oldManifest) {
                this.ux.startSpinner('Merging new and old manifests');
                manifest.merge(this.oldManifest);
                await saveFile(manifest.toXML(), this.manifestFileNameWithPath);
                this.ux.stopSpinner();
            }

            const shouldAddToGit = await this.ux.confirm('Do you want to add the manifest to git? (y/n)');
            log(shouldAddToGit);
            if (shouldAddToGit) {
                await addToGit(this.manifestFileNameWithPath);
            }
        } else {
            log(`No differnceses found between ${this.currentBranch} and ${this.compareBranch}`);
        }
    }
}
