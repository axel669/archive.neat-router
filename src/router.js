import {useEffect, useMemo, useState, Children} from "react";

const parse = route => {
    if (route === undefined) {
        return (path) => ({
            url: path,
            params: {},
            route
        });
    }

    const parts = route.slice(1).split("/");

    if (parts.length === 0) {
        return (path, {exact}) => {
            if (path !== "/" && exact === true) {
                return null;
            }

            return {
                url: path,
                params: {},
                route
            };
        };
    }

    const checks = parts.map(
        part => {
            const match = part.match(/^((?<path>\w+)|(:(?<name>\w+)(\((?<regex>.+?)\))?)|(\*(?<rest>\w+$)))$/);

            if (match === null) {
                return null;
            }

            const {groups} = match;

            if (groups.path !== undefined) {
                return ([part, ...rest]) => {
                    return (part === groups.path)
                        ? rest
                        : null;
                };
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

    if (checks.filter(c => c === null).length > 0) {
        console.warn(`Invalid route: ${route}`);
        return () => null;
    }

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

        return {url: path, params: vars, route};
    };
};

const useMounts = effect => useEffect(effect, []);
const usePathChecker = path => useMemo(() => parse(path), [path]);
function Router(urlPublisher) {
    function Route(props) {
        const [currentPath, updatePath] = useState(urlPublisher.url);
        const {path, exact, component: Component, ...rest} = props;
        const pathCheck = usePathChecker(path);

        useMounts(
            () => {
                return urlPublisher.subscribe(updatePath);
            }
        );

        const pathVars = pathCheck(currentPath, {exact});

        if (pathVars === null) {
            return null;
        }
        return <Component {...rest} neat={pathVars} />
    }
    function Switch(props) {
        const [currentPath, updatePath] = useState(urlPublisher.url);
        const {children, ...switchLevelProps} = props;
        const routes = Children.toArray(children);

        useMounts(
            () => {
                return urlPublisher.subscribe(updatePath);
            }
        );

        for (const {props} of routes) {
            const {path, exact, component: Component, ...rest} = props;
            const pathVars = parse(path)(currentPath, {exact});

            if (pathVars !== null) {
                return <Component {...switchLevelProps} {...rest} neat={pathVars} />
            }
        }

        return null;
    }

    return {
        Route,
        Switch
    };
};

export default Router;
