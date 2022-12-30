import { flags, SfdxCommand } from '@salesforce/command';
export default class Diff extends SfdxCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
    }[];
    protected static flagsConfig: {
        'from-branch': flags.Discriminated<flags.String>;
        debug: flags.Discriminated<flags.Boolean<boolean>>;
    };
    run(): Promise<void>;
}
