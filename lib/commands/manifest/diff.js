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
const PLUGIN_NAME_KEY = 'sfdx-plugin-git-auto-manifest';
const CONFIG_KEYS = ['default-branch', 'manifest-path'];
class Diff extends command_1.SfdxCommand {
    constructor() {
        super(...arguments);
        this.diffs = [];
    }
    async run() {
        const config = await this.getConfig();
        const pluginConfig = config.plugins[PLUGIN_NAME_KEY];
        await (0, git_1.validateIsInsideGitProject)();
        this.ux.startSpinner('Getting branch and plugin config');
        this.compareBranch = this.flags['from-branch'] || pluginConfig['default-branch'];
        this.currentBranch = await (0, git_1.getBranchName)();
        this.manifestFileNameWithPath = this.args.fileName || `${pluginConfig['manifest-path']}${this.currentBranch}.xml`;
        (0, logger_1.log)(`Manifest file path: ${this.manifestFileNameWithPath}`);
        this.ux.stopSpinner();
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
            (0, logger_1.log)(`No differences found between ${this.currentBranch} and ${this.compareBranch}`, true);
        }
    }
    async getConfig() {
        const project = await core_1.SfProject.resolve();
        const projectJSON = await project.retrieveSfProjectJson(false);
        const projectConfig = await projectJSON.read();
        const plugins = projectConfig.plugins || {};
        const pluginConfig = plugins[PLUGIN_NAME_KEY] || {};
        if (!pluginConfig) {
            this.ux.log('No local config for this plugin has been, lets set it up together.');
        }
        if (!CONFIG_KEYS.some((k) => !pluginConfig[k])) {
            return projectConfig;
        }
        await this.popuatePluginConfigProperties(pluginConfig);
        plugins[PLUGIN_NAME_KEY] = pluginConfig;
        projectConfig.plugins = plugins;
        projectJSON.set('plugins', plugins);
        await projectJSON.write();
        return projectConfig;
    }
    async popuatePluginConfigProperties(pluginConfig) {
        if (!pluginConfig['default-branch']) {
            while (true) {
                const defaultBranchValue = await this.ux.prompt('Please enter the name of the branch you want to compare to by default.');
                let isValidBranch = await (0, git_1.doesBranchExists)(defaultBranchValue);
                if (isValidBranch) {
                    pluginConfig['default-branch'] = defaultBranchValue;
                    break;
                }
                else {
                    this.ux.log('Provided branch is not a valid branch, if you are using a local branch please ensure that is local or specify Origin/branchName');
                }
            }
        }
        if (!pluginConfig['manifest-path']) {
            while (true) {
                let defaultBranchValue = await this.ux.prompt('Please enter the path to where you want to store you manifest (.xml) files.');
                if (!defaultBranchValue.startsWith('./')) {
                    defaultBranchValue = './' + defaultBranchValue;
                }
                if (!defaultBranchValue.endsWith('/')) {
                    defaultBranchValue = defaultBranchValue + '/';
                }
                let folderExsists = await (0, fs_1.checkIfFolderExsists)(defaultBranchValue);
                if (folderExsists) {
                    pluginConfig['manifest-path'] = defaultBranchValue;
                    break;
                }
                else {
                    this.ux.log('Provided path is not a folder, please provide a path to a folder.');
                }
            }
        }
        return pluginConfig;
    }
}
exports.default = Diff;
Diff.description = messages.getMessage('commandDescription');
Diff.examples = messages.getMessage('diffExamples').split(os.EOL);
Diff.args = [{ name: 'fileName' }];
Diff.flagsConfig = {
    'from-branch': command_1.flags.string({
        char: 'b',
        description: messages.getMessage('branchFlagDescription')
    }),
    debug: command_1.flags.boolean({
        char: 'd',
        description: messages.getMessage('silentFlagDescription'),
        default: false
    })
};
//# sourceMappingURL=diff.js.map