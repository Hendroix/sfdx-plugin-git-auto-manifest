//  https://stackoverflow.com/questions/37763836/how-to-make-git-diff-show-the-same-result-as-githubs-pull-request-diff

import { promisify } from 'util';
import { exec as _exec } from 'child_process';
const exec = promisify(_exec);
import { log } from './logger.js';

//CHANGE THIS TO BE THE FALLBACK BRANCH.
const DEFAULT_METADATA_PATH = 'force-app/main/default/';

//  diff: 'git --no-pager diff --cached --name-only Origin/fromBranch'
const GIT_COMMANDS = {
    BRANCH_NAME: 'git rev-parse --abbrev-ref HEAD',
    CACHED_DIFF: 'git --no-pager diff --cached --name-only --diff-filter=AM',
    COMPARATIVE_DIFF_WITH: (fromBranch: string, branchName: string) => {
        return `git --no-pager diff --name-only --diff-filter=AM ${fromBranch}...${branchName}`;
    }
};

const getBranchName = async () => {
    const { stdout, stderr } = await exec(GIT_COMMANDS.BRANCH_NAME);
    if (stderr) throw new Error('Could not get git branch name');
    const currentBranchName = stdout.replace(/\n|\r/g, '');
    const manifestFilePath = `manifest/${currentBranchName}.xml`;
    log(`GIT: Branch: ${currentBranchName}, File: ${manifestFilePath}`);
    return { currentBranchName, manifestFilePath };
};

const getDiff = async (command: string) => {
    const { stdout, stderr } = await exec(command);
    if (stderr) return [];
    let files = stdout.trim().split('\n');
    if (Array.isArray(files) && files.length > 0) {
        files = files.filter((f) => f.includes(DEFAULT_METADATA_PATH));
    }
    log(`GIT: ${command} returned the following diff:\n${files?.join('\n')}\n`, files.length > 1);
    return files;
};

const getDiffs = async (targetBranchName: string, currentBranchName: string) => {
    return [...(await getDiff(GIT_COMMANDS.COMPARATIVE_DIFF_WITH(targetBranchName, currentBranchName))), ...(await getDiff(GIT_COMMANDS.CACHED_DIFF))];
};

const addToGit = async (filePath: string) => {
    await exec(`git add ${filePath}`);
    log(`GIT: Added ${filePath}`);
};

const isInsideGitProject = async () => {
    const checkForGit = (await exec('git rev-parse --is-inside-work-tree 2>/dev/null')).stdout;
    return !!checkForGit;
};

const validateIsInsideGitProjet = async () => {
    const isInsideGit = await isInsideGitProject();
    if (!isInsideGit) {
        throw new Error('You are not inside a git project. Please navigate to one to use this plugin.');
    }
    log('Inside git project.');
};

export { getBranchName, getDiffs, addToGit, validateIsInsideGitProjet };
