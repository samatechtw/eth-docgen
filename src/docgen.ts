import fs from 'fs';
import path from 'path';
import { Printer } from './printers';
import HtmlPrinter from './printers/html';
import MarkdownPrinter from './printers/markdown';
import { ContractData, DocgenParams, ParsedContract, ContractEvent, ContractStruct, ContractFunction, ContractVar } from './types';

const printers: Record<string, any | undefined> = {
  'html': HtmlPrinter,
  'md': MarkdownPrinter,
};

interface ParsedComment {
  notice: string | null,
  params: Record<string, string>,
  returns: Record<string, string>,
}

type CommentGroup = Record<string, string | null>;

function parseType(typeDescription: any): string {
  return typeDescription.typeString;
}

function findBlockEnd(sourceLines: string[], start: number) {
  let index = start;
  let open = 0;
  let closed = 0;
  while(index < sourceLines.length) {
    const line = sourceLines[index];
    open += (line.match(/{/g) || []).length;
    closed += (line.match(/}/g) || []).length;
    if(open === closed) {
      break;
    }
    index += 1;
  }
  return index;
}

function parseSourceVarName(line: string): string | null {
  const match = line.match(/.* (.+?);/);
  return match ? match[1] : null;
}

function parseStructFieldComments(
  sourceLines: string[],
  sourceIndex: number
): CommentGroup {

  const comments: CommentGroup = {};
  const end = findBlockEnd(sourceLines, sourceIndex);
  let start = sourceIndex;
  let currentComment = '';
  while(start < end) {
    const line = sourceLines[start];
    if(line.startsWith('///')) {
      currentComment += line.slice(3).trim();
    } else {
      const name = parseSourceVarName(line);
      if(name) {
        comments[name] = currentComment || null;
      }
      currentComment = '';
    }
    start += 1;
  }
  return comments;
}

// Find the first line that starts with `start` and work backwards to parse comments
function parseSourceComment(start: string, sourceLines: string[]): Record<string, any> {
  const sourceIndex = sourceLines.findIndex(s => s.startsWith(start));
  // If there are no comments, return null
  if(sourceIndex !== -1 && sourceLines[sourceIndex - 1].startsWith('///')) {
    let comment = ''
    let index = sourceIndex;
    while(index > 0) {
      index -= 1;
      if(sourceLines[index].startsWith('///')) {
        comment += sourceLines[index].slice(3);
      } else {
        break;
      }
    }
    return { comment, sourceIndex };
  }
  return { comment: null, sourceIndex };
}

function parseComments(commentText: string, validNames: string[]): ParsedComment {
  const NOTICE = 'notice ';
  const PARAM = 'param ';
  const RETURN = 'return ';
  const comments = (commentText || '').split('@')
    .map(c => c.replace(/^\s+|\s+$/g, ''))
    .filter(c => !!c);
  const notice = comments.find(c => c.startsWith(NOTICE));

  const parseCommentType = (type: string) => (
    Object.fromEntries(comments.filter(c => c.startsWith(type))
      .map(c => {
        const all = c.slice(type.length).split(' ');
        const hasName = validNames.includes(all[0]);
        return [
          hasName ? all[0] : '',
          (hasName ? all.slice(1) : all).join(' '),
        ];
      }))
  );

  return {
    notice: notice ? notice.slice(NOTICE.length) : null,
    params: parseCommentType(PARAM),
    returns: parseCommentType(RETURN),
  };
}

function parseStateVars(contractNodes: any[]): ContractVar[] {
  return contractNodes.filter((node: any) => node.nodeType === 'VariableDeclaration')
    .map((node) => ({
      name: node.name,
      visibility: node.visibility,
      type: parseType(node.typeDescriptions),
      comment: (node.documentation || {}).text || '',
  }));
}

function parseParams(paramList: any[], paramComments: CommentGroup): ContractVar[] {
  return paramList.map((p) => ({
    name: p.name,
    type: parseType(p.typeDescriptions),
    comment: (p.documentation || {}).text || paramComments[p.name] || '',
    visibility: p.visibility,
  }));
}

function parseEvents(contractNodes: any[]): ContractEvent[] {
  return contractNodes.filter((node: any) => node.nodeType === 'EventDefinition')
    .map((node) => {
      const paramNodes = node.parameters.parameters;
      const paramNames = paramNodes.map((n: any) => n.name);
      const comments = parseComments(node.documentation?.text, paramNames);
      return {
        name: node.name,
        comment: comments.notice,
        params: parseParams(paramNodes, comments.params),
      };
    });
}

function parseStructs(contractNodes: any[], sourceLines: string[]): ContractStruct[] {
  return contractNodes.filter((node: any) => node.nodeType === 'StructDefinition')
    .map((node) => {
      const { comment, sourceIndex } = parseSourceComment(`struct ${node.name}`, sourceLines);
      const fieldComments = parseStructFieldComments(sourceLines, sourceIndex);
      const fields = parseParams(node.members, fieldComments);
      return {
        name: node.name,
        comment,
        visibility: node.visibility,
        fields,
      };
    });
}

function parseFunctions(contractNodes: any[]): ContractFunction[] {
  return contractNodes.filter((node: any) => node.nodeType === 'FunctionDefinition')
    .map((node) => {
      const paramNodes = node.parameters.parameters;
      const returnNodes = node.returnParameters.parameters;
      const paramNames = paramNodes.map((n: any) => n.name);
      const returnNames = returnNodes.map((n: any) => n.name);
      const comments = parseComments(node.documentation?.text, [...paramNames, ...returnNames]);
      return {
        name: node.name || node.kind,
        comment: comments.notice,
        visibility: node.visibility,
        params: parseParams(paramNodes, comments.params),
        returns: parseParams(returnNodes, comments.returns),
      };
    });
}

function parseContract(filename: string, contract: ContractData): ParsedContract {
  const name = filename.split('.')[0];
  const authorsMatch = contract.source.matchAll(/@author (.*)\n/g);
  const authors = Array.from(authorsMatch, m => m[1]);
  const inheritsMatch = contract.source.match(new RegExp(`${name} is (.*?){`));
  const inherits = inheritsMatch ? inheritsMatch[1].split(',').map(i => i.trim()) : [];
  const pragmasMatch = contract.source.matchAll(/pragma (.*?) (.*);\n/g);
  const pragmas = Array.from(pragmasMatch, p => ({ name: p[1], args: p[2] }));

  const sourceLines = contract.source.split('\n').map(l => l.trim());
  const contractNode = contract.ast.nodes.find((node: any) => node.nodeType === 'ContractDefinition');
  const contractNodes = (contractNode || {}).nodes || [];
  const stateVars = parseStateVars(contractNodes);
  const events = parseEvents(contractNodes);
  const structs = parseStructs(contractNodes, sourceLines);
  const functions = parseFunctions(contractNodes);
  return {
    name,
    title: contract.devdoc.title,
    authors,
    inherits,
    pragmas,
    stateVars,
    events,
    structs,
    functions,
  };
}

function parseContracts(contracts: Record<string, ContractData>): ParsedContract[] {
  return Object.entries(contracts).map(([name, contract]) => (
    parseContract(name, contract)
  ));
}

interface GeneratedDocs {
  docs: Record<string, string>,
  links: Record<string, string>,
}

function generateDocs(params: DocgenParams): GeneratedDocs  {
  const { format, compiledData, outDir } = params;
  console.log('Generating docs');
  const printerClass = printers[format];
  if(printerClass === undefined) {
    throw new Error(`Unknown file format ${format}`);
  }
  const contracts = parseContracts(compiledData.contracts);
  const resolvedLinks: Record<string, string> = {};
  for(const contract of contracts) {
    resolvedLinks[contract.name] = `${contract.name}.${format}`;
  }

  const printer: Printer = new printerClass(params);
  return {
    docs: printer.print(contracts, resolvedLinks),
    links: resolvedLinks,
  };
}

function writeDocs(params: DocgenParams) {
  const { outDir, format } = params;
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`Writing contracts to ${outDir}`);
  const { docs, links } = generateDocs(params);
  for(const name in docs) {
    console.log(`Writing ${name}.${format}`);
    try {
      const p = path.join(outDir, links[name]);
      fs.writeFileSync(p, docs[name]);
    } catch (err) {
      console.error('...failed:', err);
    }
  }
}

export default writeDocs;
