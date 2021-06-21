import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

const pkg = require('./package.json');

export default [
  {
    input: 'dist/src/cli.js',
    output: [
      {
        exports: 'named',
        file: pkg.main,
        format: 'cjs',
        plugins: [terser()],
      },
      {
        exports: 'named',
        file: pkg.module,
        sourcemap: true,
      },
    ],
    external: [
      'child_process',
      'fs',
      'path',
      'os',
      'https',
      'readline',
      'zlib',
      'events',
      'stream',
      'util',
      'buffer',
      ...Object.keys(pkg.devDependencies),
    ],
    plugins: [
      resolve(),
      json(),
      commonjs({include: 'node_modules/**'}),
    ],
  },
];
