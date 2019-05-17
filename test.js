const range = require("@axel669/range");
const compare = require("./benchmark.js");

const pathProp = "/test/:id/*thing";
const pathList = [
    "/test",
    "/test/:id",
    "/test/:id/:itemID",
    "/test/:id/*wat",
    "/*any"
];

const parse = route => {
    const parts = route.slice(1).split("/");

    const checks = parts.map(
        part => {
            const {groups} = part.match(/^((?<path>\w+)|(:(?<name>\w+)(\((?<regex>.+?)\))?)|(\*(?<rest>\w+$)))$/);

            if (groups.path !== undefined) {
                return ([part, ...rest]) => (part === groups.path)
                    ? rest
                    : null;
            }
            if (groups.rest !== undefined) {
                return (parts, vars) => {
                    vars[groups.rest] = parts.join("/");
                    return [];
                };
            }
            if (groups.name !== undefined) {
                const regex = (groups.regex === undefined)
                    ? /^.+$/
                    : new RegExp(`^${regex}$`);
                return ([part, ...rest], vars) => {
                    if (part !== undefined && regex.test(part) === true) {
                        vars[groups.name] = part;
                        return rest;
                    }
                    return null;
                };
            }

            return null;
        }
    )

    return (path, {exact} = {}) => {
        const vars = {};
        let remaining = path.slice(1).split("/");

        for (const check of checks) {
            remaining = check(remaining, vars);

            if (remaining === null) {
                return null;
            }
        }

        if (remaining.length > 0 && exact === true) {
            return null;
        }

        return vars;
    };
};
const parse2 = (route, path, {exact} = {}) => {
    const parts = route.slice(1).split("/");

    const checks = parts.map(
        part => {
            const {groups} = part.match(/^((?<path>\w+)|(:(?<name>\w+)(\((?<regex>.+?)\))?)|(\*(?<rest>\w+$)))$/);

            if (groups.path !== undefined) {
                return ([part, ...rest]) => (part === groups.path)
                    ? rest
                    : null;
            }
            if (groups.rest !== undefined) {
                return (parts, vars) => {
                    vars[groups.rest] = parts.join("/");
                    return [];
                };
            }
            if (groups.name !== undefined) {
                const regex = (groups.regex === undefined)
                    ? /^.+$/
                    : new RegExp(`^${regex}$`);
                return ([part, ...rest], vars) => {
                    if (part !== undefined && regex.test(part) === true) {
                        vars[groups.name] = part;
                        return rest;
                    }
                    return null;
                };
            }

            return null;
        }
    )

    const vars = {};
    let remaining = path.slice(1).split("/");

    for (const check of checks) {
        remaining = check(remaining, vars);

        if (remaining === null) {
            return null;
        }
    }

    if (remaining.length > 0 && exact === true) {
        return null;
    }

    return vars;
};

const checkRoute = parse(pathProp);

const routes = [
    "/test",
    "/test/10",
    "/test/10/wat",
    "/test/10/wat/woah",
    "/maybe/10"
];

// for (const route of routes) {
//     console.log(parse2(pathProp, route));
// }

routes.push(...routes);
routes.push(...routes);
routes.push(...routes);
routes.push(...routes);
routes.push(...routes);
routes.push(...routes);
routes.push(...routes);
routes.push(...routes);

pathList.push(...pathList);
pathList.push(...pathList);
pathList.push(...pathList);
pathList.push(...pathList);
pathList.push(...pathList);
pathList.push(...pathList);
pathList.push(...pathList);
pathList.push(...pathList);


const results = compare(
    300,
    () => {
        const res = pathList.map(parse);
        routes.map((route, i) => res[i](route));
    },
    () => routes.map(route => parse2(pathProp, route))
);

console.log(results.map(l => l.join("\t")).join("\n"));

// for (const i of range(10)) {
//     const start =
//     // console.time("check");
//     const res = routes.map(route => checkRoute(route));
//     // const res = routes.map(route => parse2(pathProp, route));
//     const res2 = pathList.map(parse);
//     console.timeEnd("check");
// }

// console.log(routes.length, routes.filter(r => r === null).length);
