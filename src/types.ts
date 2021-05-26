
export interface ContractData {
  source: string,
  info: any,
  ast: any,
};

export interface CompiledData {
  contracts: Record<string, ContractData>,
  compilerVersion: string,
  error: string | null,
};

export interface DocgenParams {
  compiledData: CompiledData,
  outDir: string,
  format: string,
  inlineCss: boolean,
};

export interface Pragma {
  name: string,
  comment: string,
}

export interface ParsedContract {
  authors: string[],
  pragmas: Pragma[],
  
}

export interface PrinterParams {
  contracts: Record<string, ParsedContract>,
  compilerVersion: string,
  outDir: string,
  format: string,
  inlineCss: boolean,
}
