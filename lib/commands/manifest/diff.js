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
    async run() {
        const fromBranch = this.flags['from-branch'];
        const branchConfig = await (0, git_1.getBranchName)();
        const manifestFileNameWithPath = this.args.fileName || branchConfig.manifestFilePath;
        this.ux.startSpinner('Fetching diffs');
        const diff = await (0, git_1.getDiffs)(fromBranch, branchConfig.currentBranchName);
        this.ux.stopSpinner();
        this.ux.startSpinner('Fetching old manifest');
        const oldManifest = await (0, manifest_1.getManifest)(manifestFileNameWithPath);
        this.ux.stopSpinner();
        if (diff.length > 0 || oldManifest?.types?.size > 0) {
            this.ux.startSpinner('Creating new manifest');
            await (0, manifest_1.createManifest)(diff, manifestFileNameWithPath);
            this.ux.stopSpinner();
            this.ux.startSpinner('Merging manifests');
            const manifest = await (0, manifest_1.getManifest)(manifestFileNameWithPath);
            manifest.merge(oldManifest);
            this.ux.stopSpinner();
            if (oldManifest) {
                await (0, fs_1.saveFile)(manifest.toXML(), manifestFileNameWithPath);
                this.ux.stopSpinner();
                const shouldAddToGit = await this.ux.confirm('Do you want to add the manifest to git? (y/n)');
                (0, logger_1.log)(shouldAddToGit);
                if (shouldAddToGit) {
                    await (0, git_1.addToGit)(manifestFileNameWithPath);
                }
            }
            else {
                (0, logger_1.log)('No applicable files have changed, skipping creation/save');
            }
        }
        else {
            (0, logger_1.log)(`No differnceses found between ${branchConfig.currentBranchName} and ${fromBranch}`);
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