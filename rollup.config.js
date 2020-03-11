import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'
import typescript from 'rollup-plugin-typescript2'
import svgr from '@svgr/rollup'
import react from 'react'
import lingui__react from '@lingui/react'
import react_is from 'react-is'
import {promises as fs} from 'fs';
import builtins from 'builtin-modules'
import packageJson from './package.json'

const packageJsonPluginDefinition = {
  name: "generate-package-json",
  generateBundle: async () => {
    const newPackage = {
      ...packageJson,
      "main": "cjs/index.js",
      "module": "es/index.js",
      "jsnext:main": "es/index.js",
      "types": "es/index.d.ts",
      devDependencies: undefined,
      files: undefined,
      scripts: undefined
    };

    await fs.writeFile('build/package.json', JSON.stringify(newPackage, undefined, 4));
  }
};

const config =  {
  input: {
    index: 'src/index.tsx',
    RouterI18n: 'src/RouterI18n.ts',
    babel: 'src/babel/index.js'
  },
  output: [
    {
      dir: 'build/cjs',
      format: 'cjs',
      exports: 'named'
    },
    {
      dir: 'build/es',
      format: 'es',
      exports: 'named'
    },
  ],
  external: [
    ...builtins,
    ...Object.keys(packageJson.peerDependencies)
  ],
  plugins: [
    resolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
      preferBuiltins: true
    }),
    commonjs({
      namedExports: {
        'react': Object.keys(react),
        '@lingui/react': Object.keys(lingui__react),
        'react-is': Object.keys(react_is)
      }
    }),
    typescript(),
    url(),
    svgr(),
    packageJsonPluginDefinition,
  ]
};

export default config
