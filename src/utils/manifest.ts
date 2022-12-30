import { readFile } from './fs';
import { log } from './logger';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
const exec = promisify(_exec);

interface tag {
    start: string;
    end: string;
    regexp?: RegExp;
}

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
    comment: string;
    package: tag;
    types: Map<string, Set<string>>;
    version: string;

    constructor(xml: string) {
        this.comment = '<?xml version="1.0" encoding="UTF-8" ?>';
        this.package = TAGS.PACKAGE;
        this.types = new Map();
        this.version = '52.0';
        this.parseXML(xml);
    }

    parseXML(xml: string) {
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

    addMember(type: string, name: string) {
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

    createTag(type: string, value: string, indentLevel: number = 0) {
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

    merge(manifest: Manifest) {
        if (manifest instanceof Manifest) {
            manifest?.types?.forEach((members, key) => members.forEach((member) => this.addMember(key, member)));
        }
    }

    toXML() {
        if (this.types.size === 0) return '';
        return [this.comment, this.package.start, this.createTypes(), this.createTag('version', this.version, 1), this.package.end].join('\n');
    }
}

const getTagContent = (text: string, TAG: tag) => {
    return text.substring(text.indexOf(TAG.start) + TAG.start.length, text.indexOf(TAG.end));
};

const getManifest = async (filePath: string) => {
    let data = Buffer.from('');
    let manifest: Manifest;
    try {
        data = await readFile(filePath);
        manifest = new Manifest(Buffer.from(data).toString());
    } catch (err) {
        log(`No manifest named ${filePath} was found`);
    }
    return manifest;
};

const createManifest = async (sourcePaths: string[], manifestFilePath: string) => {
    await exec(`sfdx force:source:manifest:create --sourcepath "${sourcePaths?.join(',')}" --manifestname ${manifestFilePath?.replace('.xml', '')}`);
};

export { Manifest, getManifest, createManifest };
