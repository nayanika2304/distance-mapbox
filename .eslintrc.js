const internalModules = "constants|components|fonts|helpers|hocs|network|pages|stores|testing";

module.exports = {
    root: true,
    env: {
        browser: true,
    },
    parser: "babel-eslint",
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2015,
        sourceType: "module"
    },
    plugins: ["simple-import-sort", "prettier"],
    extends: ["prettier"],
    rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "prettier/prettier": ["error"],
    },
    settings: {
        react: {
            version: "latest"
        }
    },
    overrides: [
        {
            files: ["**/*.{js,jsx}"],
            rules: {
                "simple-import-sort/imports": [
                    "error",
                    {
                        groups: [
                            // Side effect imports.
                            ["^\\u0000"],
                            // Packages.
                            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
                            ["^@?\\w", `^(${internalModules})(/.*|$)`],
                            [`^(${internalModules})(/.*|$)`],
                            // Absolute imports and other imports such as Vue-style `@/foo`.
                            // Anything not matched in another group.
                            ["^"],
                            // Relative imports.
                            // Anything that starts with a dot.
                            ["^\\."]
                        ]
                    }
                ]
            }
        }
    ]
};
