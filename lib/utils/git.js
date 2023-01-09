"use strict";
//  https://stackoverflow.com/questions/37763836/how-to-make-git-diff-show-the-same-result-as-githubs-pull-request-diff
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIsInsideGitProjet = exports.addToGit = exports.getDiffs = exports.getBranchName = void 0;
const util_1 = require("util");
const child_process_1 = require("child_process");
const exec = (0, util_1.promisify)(child_process_1.exec);
const logger_js_1 = require("./logger.js");
//CHANGE THIS TO BE THE FALLBACK BRANCH.
const DEFAULT_METADATA_PATH = 'force-app/main/default/';
//  diff: 'git --no-pager diff --cached --name-only Origin/fromBranch'
const GIT_COMMANDS = {
    BRANCH_NAME: 'git rev-parse --abbrev-ref HEAD',
    CACHED_DIFF: 'git --no-pager diff --cached --name-only --diff-filter=AM',
    COMPARATIVE_DIFF_WITH: (fromBranch, branchName) => {
        return `git --no-pager diff --name-only --diff-filter=AM ${fromBranch}...${branchName}`;
    }
};
const getBranchName = async () => {
    const { stdout, stderr } = await exec(GIT_COMMANDS.BRANCH_NAME);
    if (stderr)
        throw new Error('Could not get git branch name');
    const currentBranchName = stdout.replace(/\n|\r/g, '');
    const manifestFilePath = `manifest/${currentBranchName}.xml`;
    (0, logger_js_1.log)(`GIT: Branch: ${currentBranchName}, File: ${manifestFilePath}`);
    return { currentBranchName, manifestFilePath };
};
exports.getBranchName = getBranchName;
const getDiff = async (command) => {
    const { stdout, stderr } = await exec(command);
    if (stderr)
        return [];
    let files = stdout.trim().split('\n');
    if (Array.isArray(files) && files.length > 0) {
        files = files.filter((f) => f.includes(DEFAULT_METADATA_PATH));
    }
    (0, logger_js_1.log)(`GIT: ${command} returned the following diff:\n${files?.join('\n')}\n`, files.length > 1);
    return files;
};
const getDiffs = async (targetBranchName, currentBranchName) => {
    return [...(await getDiff(GIT_COMMANDS.COMPARATIVE_DIFF_WITH(targetBranchName, currentBranchName))), ...(await getDiff(GIT_COMMANDS.CACHED_DIFF))];
};
exports.getDiffs = getDiffs;
const addToGit = async (filePath) => {
    await exec(`git add ${filePath}`);
    (0, logger_js_1.log)(`GIT: Added ${filePath}`);
};
exports.addToGit = addToGit;
const isInsideGitProject = async () => {
    try {
        return !!(await exec('git rev-parse --is-inside-work-tree 2>/dev/null')).stdout;
    }
    catch (error) {
        return false;
    }
};
const validateIsInsideGitProjet = async () => {
    const isInsideGit = await isInsideGitProject();
    if (!isInsideGit) {
        throw new Error('You are not inside a git project. Please navigate to one to use this plugin.');
    }
    (0, logger_js_1.log)('Inside git project.');
};
exports.validateIsInsideGitProjet = validateIsInsideGitProjet;
//# sourceMappingURL=git.js.map