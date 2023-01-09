declare const getBranchName: () => Promise<{
    currentBranchName: string;
    manifestFilePath: string;
}>;
declare const getDiffs: (targetBranchName: string, currentBranchName: string) => Promise<string[]>;
declare const addToGit: (filePath: string) => Promise<void>;
declare const validateIsInsideGitProjet: () => Promise<void>;
export { getBranchName, getDiffs, addToGit, validateIsInsideGitProjet };
