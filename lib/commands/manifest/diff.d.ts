import { flags, SfdxCommand } from '@salesforce/command';
import { Manifest } from '../../utils/manifest';
export default class Diff extends SfdxCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
    }[];
    currentBranch: string;
    compareBranch: string;
    manifestFileNameWithPath: string;
    newManifest: Manifest;
    oldManifest: Manifest;
    diffs: Array<string>;
    protected static flagsConfig: {
        'from-branch': flags.Discriminated<flags.String>;
        debug: flags.Discriminated<flags.Boolean<boolean>>;
    };
    run(): Promise<void>;
    private getConfig;
    private popuatePluginConfigProperties;
}
