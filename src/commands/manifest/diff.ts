import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { ConfigContents, Messages, SfProject } from '@salesforce/core';
import { addToGit, doesBranchExists, getBranchName, getDiffs, validateIsInsideGitProject } from '../../utils/git';
import { getManifest, createManifest, Manifest } from '../../utils/manifest';
import { checkIfFileExsists, checkIfFolderExsists, saveFile } from '../../utils/fs';
import { log } from '../../utils/logger';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-plugin-git-auto-manifest', 'manifest');
const PLUGIN_NAME_KEY = 'sfdx-plugin-git-auto-manifest';
const CONFIG_KEYS = ['default-branch', 'manifest-path'];

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
            description: messages.getMessage('branchFlagDescription')
        }),
        debug: flags.boolean({
            char: 'd',
            description: messages.getMessage('silentFlagDescription'),
            default: false
        })
    };

    public async run() {
        const config = await this.getConfig();
        const pluginConfig = config.plugins[PLUGIN_NAME_KEY];

        await validateIsInsideGitProject();

        this.ux.startSpinner('Getting branch and plugin config');
        this.compareBranch = this.flags['from-branch'] || pluginConfig['default-branch'];
        this.currentBranch = await getBranchName();
        this.manifestFileNameWithPath = this.args.fileName || `${pluginConfig['manifest-path']}${this.currentBranch}.xml}`;
        this.ux.stopSpinner();

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
            log(`No differences found between ${this.currentBranch} and ${this.compareBranch}`, true);
        }
    }

    private async getConfig() {
        const project = await SfProject.resolve();
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

    private async popuatePluginConfigProperties(pluginConfig: ConfigContents) {
        if (!pluginConfig['default-branch']) {
            while (true) {
                const defaultBranchValue = await this.ux.prompt('Please enter the name of the branch you want to compare to by default.');
                let isValidBranch = await doesBranchExists(defaultBranchValue);
                if (isValidBranch) {
                    pluginConfig['default-branch'] = defaultBranchValue;
                    break;
                } else {
                    this.ux.log(
                        'Provided branch is not a valid branch, if you are using a local branch please ensure that is local or specify Origin/branchName'
                    );
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

                let folderExsists = await checkIfFolderExsists(defaultBranchValue);
                if (folderExsists) {
                    pluginConfig['manifest-path'] = defaultBranchValue;
                    break;
                } else {
                    this.ux.log('Provided path is not a folder, please provide a path to a folder.');
                }
            }
        }
        return pluginConfig;
    }
}
