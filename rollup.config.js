import path from "path";

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import alias from "@axel669/rollup-plugin-path-alias";

export default {
    input: "./src/neat-router.js",
    output: [
        {
            file: "index.js",
            format: "cjs"
        },
        {
            file: "esm/index.js",
            format: "esm"
        },
        {
            file: "standalone/neat-router.js",
            format: "iife",
            name: "Neat",
            globals: {
                "react": "React"
            }
        }
    ],
    plugins: [
        alias({
            root: path.resolve(__dirname, "src"),
        }),
        babel({
            exclude: "node_modules/**",
            include: "src/**/*.js",
            babelrc: false,
            plugins: [
                "@babel/plugin-transform-react-jsx",
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-proposal-nullish-coalescing-operator"
            ]
        }),
        resolve(),
        commonjs()
    ],
    external: [
        'react'
    ]
};
