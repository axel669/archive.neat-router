'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const parse = route => {
  if (route === undefined) {
    return path => ({
      url: path,
      params: {},
      route
    });
  }

  const parts = route.slice(1).split("/");

  if (parts.length === 0) {
    return (path, {
      exact
    }) => {
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

  const checks = parts.map(part => {
    const match = part.match(/^((?<path>\w+)|(:(?<name>\w+)(\((?<regex>.+?)\))?)|(\*(?<rest>\w+$)))$/);

    if (match === null) {
      return null;
    }

    const {
      groups
    } = match;

    if (groups.path !== undefined) {
      return ([part, ...rest]) => {
        return part === groups.path ? rest : null;
      };
    }

    if (groups.rest !== undefined) {
      return (parts, vars) => {
        vars[groups.rest] = parts.join("/");
        return [];
      };
    }

    if (groups.name !== undefined) {
      const regex = groups.regex === undefined ? /^.+$/ : new RegExp(`^${regex}$`);
      return ([part, ...rest], vars) => {
        if (part !== undefined && regex.test(part) === true) {
          vars[groups.name] = part;
          return rest;
        }

        return null;
      };
    }

    return null;
  });

  if (checks.filter(c => c === null).length > 0) {
    console.warn(`Invalid route: ${route}`);
    return () => null;
  }

  return (path, {
    exact
  } = {}) => {
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

    return {
      url: path,
      params: vars,
      route
    };
  };
};

const useMounts = effect => react.useEffect(effect, []);

const usePathChecker = path => react.useMemo(() => parse(path), [path]);

function Router(urlPublisher) {
  function Route(props) {
    const [currentPath, updatePath] = react.useState(urlPublisher.url);
    const {
      path,
      exact,
      component: Component,
      ...rest
    } = props;
    const pathCheck = usePathChecker(path);
    useMounts(() => {
      return urlPublisher.subscribe(updatePath);
    });
    const pathVars = pathCheck(currentPath, {
      exact
    });

    if (pathVars === null) {
      return null;
    }

    return React.createElement(Component, _extends({}, rest, {
      neat: pathVars
    }));
  }

  function Switch(props) {
    const [currentPath, updatePath] = react.useState(urlPublisher.url);
    const {
      children,
      ...switchLevelProps
    } = props;
    const routes = react.Children.toArray(children);
    useMounts(() => {
      return urlPublisher.subscribe(updatePath);
    });

    for (const {
      props
    } of routes) {
      const {
        path,
        exact,
        component: Component,
        ...rest
      } = props;
      const pathVars = parse(path)(currentPath, {
        exact
      });

      if (pathVars !== null) {
        return React.createElement(Component, _extends({}, switchLevelProps, rest, {
          neat: pathVars
        }));
      }
    }

    return null;
  }

  return {
    Route,
    Switch
  };
}

const Publisher = () => {
  const listeners = new Map();
  return {
    subscribe: handler => {
      const id = `${Date.now()}:${Math.random()}`;
      listeners.set(id, handler);
      return () => listeners.delete(id);
    },
    publish: message => {
      for (const handler of listeners.values()) {
        handler(message);
      }
    }
  };
};

const HashPublisher = () => {
  const publisher = Publisher();
  const api = {
    get hash() {
      return location.hash.toString().replace(/^#/, "");
    },

    get subscribe() {
      return publisher.subscribe;
    },

    get url() {
      return api.hash;
    }

  };
  api.initialState = api.hash;
  let currentHash = api.hash;
  setInterval(() => {
    const hash = api.hash;

    if (hash !== currentHash) {
      currentHash = hash;
      publisher.publish(hash);
    }
  }, 50);
  return api;
};

exports.HashPublisher = HashPublisher;
exports.Publisher = Publisher;
exports.Router = Router;
