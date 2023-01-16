declare const getBranchName: () => Promise<string>;
declare const getDiffs: (targetBranchName: string, currentBranchName: string) => Promise<string[]>;
declare const addToGit: (filePath: string) => Promise<void>;
declare const validateIsInsideGitProject: () => Promise<void>;
declare const doesBranchExists: (branchName: string) => Promise<boolean>;
export { getBranchName, getDiffs, addToGit, validateIsInsideGitProject, doesBranchExists };
