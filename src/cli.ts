import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import compile from './compile';
import writeDocs from './docgen';

const contractText = {
  title: '{name} Contract Documentation',
  overview: 'Contract Overview',
  author: 'Authored by {authors}',
  inherits: 'Inherits from {inherits}',
  pragmas: 'Pragmas',
  stateVars: 'State Variables',
  structs: 'Structs',
  fields: 'Fields',
  events: 'Events',
  parameters: 'Parameters',
  functions: 'Functions',
  returns: 'Returns',
  footer: 'Contract documentation generated with {link}',
};

interface Arguments {
  o: string,
  c: string,
  s: boolean,
  f: string,
};

const argv = yargs(hideBin(process.argv)).options({
  o: {
    alias: 'output',
    type: 'string',
    default: './doc.html',
    describe: 'Output file',
  },
  c: {
    alias: 'contract',
    type: 'string',
    required: true,
    describe: 'Contract to generate docs for',
  },
  s: {
    alias: 'style',
    boolean: true,
    default: false,
    describe: 'Inline CSS with output HTML',
  },
  f: {
    alias: 'format',
    default: 'html',
    choices: ['html', 'md'],
  }
})
  .usage('Ethereum HTML Document Generator')
  .argv as Arguments;

console.log('Running Eth documentation generator');
console.log(`Writing to ${argv.o}`);

const contractPath = path.join(process.cwd(), argv.c);

const compiledData = compile(contractPath);
if(compiledData.error) {
  console.log(`Error during compilation:\n${compiledData.error}`);
} else {
  writeDocs({
    compiledData,
    formatStrings: contractText,
    outDir: argv.o,
    format: argv.f,
    inlineCss: argv.s || false,
  });
}
