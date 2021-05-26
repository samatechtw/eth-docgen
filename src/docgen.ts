import { Printer } from './printers';
import HtmlPrinter from './printers/html';
import MarkdownPrinter from './printers/markdown';
import { ContractData, DocgenParams, ParsedContract } from './types';

const printers: Record<string, any | undefined> = {
  'html': HtmlPrinter,
  'md': MarkdownPrinter,
};

function parseContract(contract: ContractData): ParsedContract {
  return { authors: [], pragmas: [] };
}

function parseContracts(contracts: Record<string, ContractData>): Record<string, ParsedContract> {
  const parsed: Record<string, ParsedContract> = {};
  Object.entries(contracts).forEach(([name, contract]) => {
    parsed[name] = parseContract(contract);
  });
  return parsed;
}

function generateDocs(params: DocgenParams)  {
  console.log('Generating docs');
  const printerClass = printers[params.format];
  if(printerClass === undefined) {
    throw new Error(`Unknown file format ${params.format}`);
  }

  const printer: Printer = new printerClass();
}

export default generateDocs;
