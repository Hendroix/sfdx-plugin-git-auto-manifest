let _log = process.argv.includes('-d');

const log = (message: any, condition = false) => {
    if (_log || condition) {
        console.log(message);
    }
};

export { log };
