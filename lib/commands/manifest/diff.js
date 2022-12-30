"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const git_1 = require("../../utils/git");
const manifest_1 = require("../../utils/manifest");
const fs_1 = require("../../utils/fs");
const logger_1 = require("../../utils/logger");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('sfdx-plugin-git-auto-manifest', 'manifest');
class Diff extends command_1.SfdxCommand {
    constructor() {
        super(...arguments);
        this.diffs = [];
    }
    async run() {
        this.compareBranch = this.flags['from-branch'];
        const branchConfig = await (0, git_1.getBranchName)();
        this.currentBranch = branchConfig.currentBranchName;
        this.manifestFileNameWithPath = this.args.fileName || branchConfig.manifestFilePath;
        this.ux.startSpinner('Fetching diffs');
        this.diffs = await (0, git_1.getDiffs)(this.compareBranch, this.currentBranch);
        this.ux.stopSpinner();
        this.ux.startSpinner('Checking for exsisting manifest');
        const hasOldManifest = (0, fs_1.checkIfFileExsists)(this.manifestFileNameWithPath);
        this.ux.stopSpinner();
        if (hasOldManifest) {
            (0, logger_1.log)('Found old Manifest');
            this.oldManifest = await (0, manifest_1.getManifest)(this.manifestFileNameWithPath);
        }
        if (this.diffs.length > 0 || this.oldManifest?.types?.size > 0) {
            this.ux.startSpinner('Creating new manifest');
            await (0, manifest_1.createManifest)(this.diffs, this.manifestFileNameWithPath);
            const manifest = await (0, manifest_1.getManifest)(this.manifestFileNameWithPath);
            this.ux.stopSpinner();
            if (this.oldManifest) {
                this.ux.startSpinner('Merging new and old manifests');
                manifest.merge(this.oldManifest);
                await (0, fs_1.saveFile)(manifest.toXML(), this.manifestFileNameWithPath);
                this.ux.stopSpinner();
            }
            const shouldAddToGit = await this.ux.confirm('Do you want to add the manifest to git? (y/n)');
            (0, logger_1.log)(shouldAddToGit);
            if (shouldAddToGit) {
                await (0, git_1.addToGit)(this.manifestFileNameWithPath);
            }
        }
        else {
            (0, logger_1.log)(`No differnceses found between ${this.currentBranch} and ${this.compareBranch}`);
        }
    }
}
exports.default = Diff;
Diff.description = messages.getMessage('commandDescription');
Diff.examples = messages.getMessage('diffExamples').split(os.EOL);
Diff.args = [{ name: 'fileName' }];
Diff.flagsConfig = {
    'from-branch': command_1.flags.string({
        char: 'b',
        description: messages.getMessage('branchFlagDescription'),
        required: true,
        default: 'RC'
    }),
    debug: command_1.flags.boolean({
        char: 'd',
        description: messages.getMessage('silentFlagDescription'),
        default: false
    })
};
//# sourceMappingURL=diff.js.map