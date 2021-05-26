/*
    parser = argparse.ArgumentParser(description="Ethereum HTML Document Generator", epilog="\n\n")
    parser.add_argument("-o", "--output", metavar='dir', help="Output directory")

    parser.add_argument("-c", "--contract", metavar='file', help="Contract to generate docs for", required=True)

    parser.add_argument("-s", "--style", help="Inline CSS with output HTML", action='store_true')

    args = parser.parse_args()
    
    out_dir = path.join(os.getcwd(), args.output) if args.output else None

  */

import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import compile from './compile';
import generateDocs from './docgen';

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
  generateDocs({
    compiledData,
    outDir: argv.o,
    format: argv.f,
    inlineCss: argv.s || false,
  });
}
