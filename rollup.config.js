import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'

import pkg from './package.json'

export default [
  {
    input: 'src/index.tsx',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'es',
        exports: 'named',
        sourcemap: true
      },
    ],
    plugins: [
      external(),
      url(),
      svgr(),
      resolve(),
      typescript({
        rollupCommonJSResolveHack: true,
        clean: true
      }),
      commonjs()
    ]
  },
  {
    input: 'src/babel/index.js',
    output: [
      {
        file: 'dist/babel/index.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      },
      {
        file: 'dist/babel/index.es.js',
        format: 'es',
        exports: 'named',
        sourcemap: true
      },
      { // For development purposes (also mentioned in .gitignore)
        file: 'babel.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      },
      { // For development purposes (also mentioned in .gitignore)
        file: 'babel.es.js',
        format: 'es',
        exports: 'named',
        sourcemap: true
      },
    ],
    plugins: [
      external(),
      url(),
      resolve(),
      typescript({
        rollupCommonJSResolveHack: true,
        clean: true,
        tsconfigOverrides: { declaration: false }
      }),
      commonjs()
    ]
  }
]
