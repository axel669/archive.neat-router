const {performance} = require("perf_hooks");

const test = func => {
    const start = performance.now();
    func();
    const time = performance.now() - start;

    return time;
};
const compare = (iterations, ...funcs) => Array.from(
    {length: iterations},
    () => funcs.map(test)
);

module.exports = compare;
