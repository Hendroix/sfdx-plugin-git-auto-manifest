"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManifest = exports.getManifest = exports.Manifest = void 0;
const fs_1 = require("./fs");
const logger_1 = require("./logger");
const child_process_1 = require("child_process");
const util_1 = require("util");
const exec = (0, util_1.promisify)(child_process_1.exec);
const TAGS = {
    PACKAGE: {
        start: '<Package xmlns="http://soap.sforce.com/2006/04/metadata">',
        end: '</Package>'
    },
    VERSION: {
        start: '<version>',
        end: '</version>'
    },
    TYPES: {
        start: '<types>',
        end: '</types>',
        regexp: /<types>[.*?\s*?\S*?]*?<\/types>/g
    },
    NAME: {
        start: '<name>',
        end: '</name>'
    },
    MEMBERS: {
        start: '<members>',
        end: '</members>',
        regexp: /<members>[.*?\s*?\S*?]*?<\/members>/g
    }
};
class Manifest {
    constructor(xml) {
        this.comment = '<?xml version="1.0" encoding="UTF-8" ?>';
        this.package = TAGS.PACKAGE;
        this.types = new Map();
        this.version = '52.0';
        this.parseXML(xml);
    }
    parseXML(xml) {
        const version = getTagContent(xml, TAGS.VERSION);
        if (version) {
            this.version = version;
        }
        let types = xml.match(TAGS.TYPES.regexp);
        types?.forEach((type) => {
            let name = getTagContent(type, TAGS.NAME);
            if (name) {
                let members = type.match(TAGS.MEMBERS.regexp);
                members.forEach((_member) => {
                    let member = getTagContent(_member, TAGS.MEMBERS);
                    if (member) {
                        this.addMember(name, member);
                    }
                });
            }
        });
    }
    addMember(type, name) {
        if (!type || !name) {
            console.error('type and name must de defined.');
            return;
        }
        if (!this.types.has(type)) {
            this.types.set(type, new Set());
        }
        if (type === 'labels') {
            name = '*';
        }
        this.types.get(type).add(name);
    }
    createTag(type, value, indentLevel = 0) {
        var tag = '';
        for (let i = 0; i < indentLevel; i++) {
            tag += '    ';
        }
        tag += `<${type}>${value}</${type}>`;
        return tag;
    }
    createTypes() {
        let types = [];
        this.types.forEach((members, name) => {
            let tags = [`    ${TAGS.TYPES.start}`];
            [...members].forEach((member) => tags.push(this.createTag('members', member, 2)));
            tags.push(this.createTag('name', name, 2));
            types.push(tags.join('\n'));
            types.push(`    ${TAGS.TYPES.end}`);
        });
        return types.join('\n');
    }
    merge(manifest) {
        if (manifest instanceof Manifest) {
            manifest?.types?.forEach((members, key) => members.forEach((member) => this.addMember(key, member)));
        }
    }
    toXML() {
        if (this.types.size === 0)
            return '';
        return [this.comment, this.package.start, this.createTypes(), this.createTag('version', this.version, 1), this.package.end].join('\n');
    }
}
exports.Manifest = Manifest;
const getTagContent = (text, TAG) => {
    return text.substring(text.indexOf(TAG.start) + TAG.start.length, text.indexOf(TAG.end));
};
const getManifest = async (filePath) => {
    let data = Buffer.from('');
    let manifest;
    try {
        data = await (0, fs_1.readFile)(filePath);
        manifest = new Manifest(Buffer.from(data).toString());
    }
    catch (err) {
        (0, logger_1.log)(`No manifest named ${filePath} was found`);
    }
    return manifest;
};
exports.getManifest = getManifest;
const createManifest = async (sourcePaths, manifestFilePath) => {
    await exec(`sfdx force:source:manifest:create --sourcepath "${sourcePaths?.join(',')}" --manifestname ${manifestFilePath?.replace('.xml', '')}`);
};
exports.createManifest = createManifest;
//# sourceMappingURL=manifest.js.map