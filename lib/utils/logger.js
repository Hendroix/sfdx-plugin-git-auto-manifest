"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
let _log = process.argv.includes('-d');
const log = (message, condition = true) => {
    if (_log && condition) {
        console.log(message);
    }
};
exports.log = log;
//# sourceMappingURL=logger.js.map