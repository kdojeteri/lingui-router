const t = require('@babel/types');

const {parse} = require('path-to-regexp');

const ImportsVisitor = {
    Program: {
        enter(path, state) {
            state.opts.moduleName = state.opts.moduleName || 'lingui-router';
        }
    },

    ImportDeclaration: {
        enter(path, state) {
            if (t.isStringLiteral(path.node.source) && path.node.source.value === state.opts.moduleName) {
                const innerState = {
                    imports: {},
                    parseCache: {}
                };

                for (let name of ['i18nTo', 'i18nPath']) {
                    const specifier = path.node.specifiers.find((s) => s.imported && s.imported.name === name);

                    if (specifier) {
                        innerState.imports[name] = specifier.local.name;
                    }
                }

                // process.env.LINGUI_EXTRACT is set to "1" in @lingui/cli/lingui-extract.js
                // we use it here to detect message extraction
                if (process.env.LINGUI_EXTRACT) {
                    path.parentPath.traverse(FunctionCallVisitor, innerState);
                }
            }
        }
    }
};


const FunctionCallVisitor = {
    CallExpression(path) {
        const identifier = path.node.callee;
        const argument0 = path.node.arguments[0];

        if (this.imports['i18nTo'] && identifier.name === this.imports['i18nTo']) {
            if (!t.isStringLiteral(argument0)) {
                throw path.buildCodeFrameError('i18nTo\'s first argument has to be a string literal');
            }

            path.replaceWith(createMarkedString(argument0));
        } else if (this.imports['i18nPath'] && identifier.name === this.imports['i18nPath']) {
            if (!t.isStringLiteral(argument0)) {
                throw path.buildCodeFrameError('i18nPath\'s first argument has to be a string literal');
            }

            const value = argument0.value;

            let parsed = this.parseCache[value];
            if (!parsed) {
                parsed = this.parseCache[value] = parse(value);
            }

            let i = 0;
            const catalogString = parsed.map(
                item => {
                    return typeof item === 'string' ? item : `{${i++}}`;
                }
            ).join('');

            path.replaceWith(createMarkedString(t.stringLiteral(catalogString)));
        }
    },

    TaggedTemplateExpression(path) {
        const identifier = path.node.tag;

        if (this.imports['i18nTo'] && identifier.name === this.imports['i18nTo']) {
            const catalogString = path.node.quasi.quasis.map(
                (quasi, index, arr) => (index === arr.length - 1)
                    ? quasi.value.cooked
                    : quasi.value.cooked + `{${index}}`
            ).join('');

            path.replaceWith(createMarkedString(t.stringLiteral(catalogString)));
        } else if (this.imports['i18nPath'] && identifier.name === this.imports['i18nPath']) {
            if (path.node.quasi.expressions.length > 0) {
                throw path.buildCodeFrameError('i18nPath can\'t take template string literals with any expressions');
            }

            const value = path.node.quasi.quasis[0].value.cooked;

            let parsed = this.parseCache[value];
            if (!parsed) {
                parsed = this.parseCache[value] = parse(value);
            }

            let i = 0;
            const catalogString = parsed.map(
                item => {
                    return typeof item === 'string' ? item : `{${i++}}`;
                }
            ).join('');

            path.replaceWith(createMarkedString(t.stringLiteral(catalogString)));
        }
    }

};

function createMarkedString(stringLiteral) {
    return t.callExpression(t.identifier('i18nMark'), [stringLiteral])
}

module.exports = () => ({
    visitor: ImportsVisitor
});
