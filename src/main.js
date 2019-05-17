import React from "react";
import ReactDOM from "react-dom";
import doric from "doric";

import {Router, HashPublisher} from "./cool-router";

doric.generateCSS(doric.tronTheme);

const MainRouter = Router(HashPublisher());

function Test({pathVars}) {
    return <div>Test {pathVars.extra}</div>
}
function Wat() {
    return <div>Wat</div>
}

function Main(props) {
    return <div>
        <doric.Grid cols={2}>
            <doric.Button text="Test" primary block onTap={() => document.location.hash = "/test"} />
            <doric.Button text="Wat" primary block onTap={() => document.location.hash = "/wat"} />
        </doric.Grid>
        <MainRouter.Switch>
            <route path="/test" exact component={Test} />
            <route path="/wat" component={Wat} />
            <route path="/test/:extra" component={Test} />
        </MainRouter.Switch>
    </div>
}

ReactDOM.render(
    <Main />,
    document.querySelector("app-root")
);
