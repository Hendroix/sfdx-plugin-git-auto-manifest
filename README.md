sfdx-plugin-git-auto-manifest
=============================

Plugin for SFDX cli to generate manifests for CI/CD or manifest deployment

[![Version](https://img.shields.io/npm/v/sfdx-plugin-git-auto-manifest.svg)](https://npmjs.org/package/sfdx-plugin-git-auto-manifest)
[![sfdx](https://img.shields.io/badge/cli-sfdx-brightgreen.svg)](https://developer.salesforce.com/tools/sfdxcli)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/Hendroix/sfdx-plugin-git-auto-manifest?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-plugin-git-auto-manifest/branch/master)
[![Greenkeeper](https://badges.greenkeeper.io/Hendroix/sfdx-plugin-git-auto-manifest.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/Hendroix/sfdx-plugin-git-auto-manifest/badge.svg)](https://snyk.io/test/github/Hendroix/sfdx-plugin-git-auto-manifest)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-plugin-git-auto-manifest.svg)](https://npmjs.org/package/sfdx-plugin-git-auto-manifest)
[![License](https://img.shields.io/npm/l/sfdx-plugin-git-auto-manifest.svg)](https://github.com/Hendroix/sfdx-plugin-git-auto-manifest/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-plugin-git-auto-manifest
$ sfdx COMMAND
running command...
$ sfdx (--version)
sfdx-plugin-git-auto-manifest/1.0.0 darwin-arm64 node-v18.8.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx manifest:diff -b <string> [-d] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-manifestdiff--b-string--d---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx manifest:diff -b <string> [-d] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Command that generate a manifest folder based on a git diff beetween current branch and provided branch.

```
USAGE
  $ sfdx manifest:diff -b <string> [-d] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -b, --from-branch=<value>                                                         (required) [default: RC] The name of
                                                                                    the branch to compare with.
  -d, --debug                                                                       If set to false logs will notify
                                                                                    about the progress while script is
                                                                                    running.
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  Command that generate a manifest folder based on a git diff beetween current branch and provided branch.

EXAMPLES
  $ sfdx manifest:diff path/to/manifest/folder/manifest-file-name -b name-of-branch-to-diff-against
```

_See code: [src/commands/manifest/diff.ts](https://github.com/Hendroix/sfdx-plugin-git-auto-manifest/blob/v1.0.0/src/commands/manifest/diff.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
