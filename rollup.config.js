import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';

const pkg = require('./package.json');

export default [
  {
    input: 'src/cli.ts',
    output: [
      {
        exports: 'named',
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        plugins: [terser()],
      },
      {
        exports: 'named',
        file: pkg.module,
        sourcemap: true,
      },
    ],
    external: Object.keys(pkg.devDependencies),
    plugins: [
      typescript({
        module: 'ESNext',
      }),
      commonjs(),
      resolve(),
      sourceMaps(),
    ],
  },
  {
    input: "dist/cli.d.ts",
    output: [{ file: "dist/eth-docgen.d.ts", format: 'es' }],
    plugins: [
      dts(),
      del({
        targets: ['dist/*.d.ts', '!dist/eth-docgen.d.ts'],
        hook: 'buildEnd',
      }),
    ]
  },
];
