import path from 'path';
import solc from 'solc';
import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { CompiledData, ContractData, defaultContractData } from './types';

function compile(contractPath: string): CompiledData {
  let error = null;
  let compilerVersion = 'Unknown';
  const contracts: Record<string, ContractData> = {};
  try {
    const name = path.basename(contractPath);
    contracts[name] = {
      ...defaultContractData,
      source: readFileSync(contractPath, 'utf-8'),
    };

    const outputSelection = {
      "*": {
        "*": [
          'abi', 'devdoc', 'userdoc', 'metadata',
          'evm.bytecode', 'evm.bytecode.object',
        ],
        '': ['ast'],
      },
    };
    const input = {
      language: 'Solidity',
      sources: {
        [name]: { content: contracts[name].source },
      },
      settings: { outputSelection },
    };
    const contractPaths = fg.sync(`${path.dirname(contractPath)}/**/*.sol`);
    const contractNames: Record<string, string> = {};
    contractPaths.forEach((p: string) => {
      contractNames[path.basename(p)] = p;
    });
    const findImports = (path: string) => {
      if(contractNames[path]) {
        if(!contracts.path) {
          contracts[path] = {
            ...defaultContractData,
            source: readFileSync(contractNames[path], 'utf-8'),
          };
        }
        return { contents: contracts[path].source };
      }
      return { error: 'import not found' };
    };
    console.log(`Compiling ${contractPath}`);
    const output = JSON.parse(solc.compile(
      JSON.stringify(input),
      { import: findImports },
    ));
    if(output.errors) {
      error = output.errors.map((e: any) => e.message).join('\n');
    } else {
      Object.entries(output.contracts).forEach(([name, value]: any, index) => {
        const data: any = Object.values(value)[0];
        const metadata = JSON.parse(data.metadata);
        if(index === 0) {
          compilerVersion = metadata.compiler.version;
        }
        contracts[name] = {
          ...contracts[name],
          abi: data.abi,
          devdoc: data.devdoc,
          userdoc: data.userdoc,
          bytecode: data.evm.bytecode.object,
          metadata: {
            compiler: metadata.compiler,
            language: metadata.language,
          },
          ast: output.sources[name].ast,
        }
      });
    }

  } catch(e) {
    error = `Failed to compile: ${e.message}`;
  }
  return {
    contracts,
    compilerVersion,
    error,
  };
}

export default compile;
