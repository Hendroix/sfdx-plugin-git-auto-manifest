let _log = process.argv.includes('-d');

const log = (message: any, condition = true) => {
    if (_log || condition) {
        console.log(message);
    }
};

export { log };
