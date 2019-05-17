(function (React$1, ReactDOM, doric) {
  'use strict';

  var React$1__default = 'default' in React$1 ? React$1['default'] : React$1;
  ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;
  doric = doric && doric.hasOwnProperty('default') ? doric['default'] : doric;

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
    const parts = route.slice(1).split("/");
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

      return vars;
    };
  };

  const useMounts = effect => React$1.useEffect(effect, []);

  const usePathChecker = path => React$1.useMemo(() => parse(path), [path]);

  function Router(urlPublisher) {
    function Route(props) {
      const [currentPath, updatePath] = React$1.useState(urlPublisher.initialState);
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
        pathVars: pathVars
      }));
    }

    function Switch(props) {
      const [currentPath, updatePath] = React$1.useState(urlPublisher.initialState);
      const routes = React$1.Children.toArray(props.children);
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
          return React.createElement(Component, _extends({}, rest, {
            pathVars: pathVars
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

  doric.generateCSS(doric.tronTheme);
  const MainRouter = Router(HashPublisher());

  function Test({
    pathVars
  }) {
    return React$1__default.createElement("div", null, "Test ", pathVars.extra);
  }

  function Wat() {
    return React$1__default.createElement("div", null, "Wat");
  }

  function Main(props) {
    return React$1__default.createElement("div", null, React$1__default.createElement(doric.Grid, {
      cols: 2
    }, React$1__default.createElement(doric.Button, {
      text: "Test",
      primary: true,
      block: true,
      onTap: () => document.location.hash = "/test"
    }), React$1__default.createElement(doric.Button, {
      text: "Wat",
      primary: true,
      block: true,
      onTap: () => document.location.hash = "/wat"
    })), React$1__default.createElement(MainRouter.Switch, null, React$1__default.createElement("route", {
      path: "/test",
      exact: true,
      component: Test
    }), React$1__default.createElement("route", {
      path: "/wat",
      component: Wat
    }), React$1__default.createElement("route", {
      path: "/test/:extra",
      component: Test
    })));
  }

  ReactDOM.render(React$1__default.createElement(Main, null), document.querySelector("app-root"));

}(React, ReactDOM, doric));
