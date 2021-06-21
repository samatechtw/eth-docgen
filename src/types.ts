
export interface ContractData {
  source: string,
  ast: any,
  abi: any[],
  devdoc: any,
  userdoc: any,
  bytecode: string,
  metadata: Record<string, any>,
};

export const defaultContractData: ContractData = {
  source: '',
  ast: {},
  abi: [],
  devdoc: {},
  userdoc: {},
  bytecode: '',
  metadata: {},
}

export interface CompiledData {
  contracts: Record<string, ContractData>,
  compilerVersion: string,
  error: string | null,
};

export interface DocgenParams {
  compiledData: CompiledData,
  formatStrings: Record<string, string>,
  outDir: string,
  format: string,
  inlineCss: boolean,
};

export interface Pragma {
  name: string,
  args: string,
}

export interface ContractVar {
  name: string,
  type: string,
  comment: string | null,
  visibility: string,
}

export interface ContractEvent {
  name: string,
  comment: string | null,
  params: ContractVar[],
}

export interface ContractStruct {
  name: string,
  comment: string | null,
  visibility: string,
  fields: ContractVar[],
}

export interface ContractFunction {
  name: string,
  comment: string | null,
  visibility: string,
  params: ContractVar[],
  returns: ContractVar[],
}

export interface ParsedContract {
  // The actual name of the contract (in code)
  name: string,
  // The @title declaration for the contract
  title: string,
  authors: string[],
  inherits: string[],
  pragmas: Pragma[],
  stateVars: ContractVar[],
  events: ContractEvent[],
  structs: ContractStruct[],
  functions: ContractFunction[],
}

export interface PrinterParams {
  contracts: Record<string, ParsedContract>,
  compilerVersion: string,
  outDir: string,
  format: string,
  inlineCss: boolean,
}
