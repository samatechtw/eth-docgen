import { DocgenParams, ParsedContract } from '../types';

export abstract class Printer {
  params: DocgenParams;

  constructor(params: DocgenParams) {
    this.params = params;
  }

  abstract header(): string;
  abstract title(name: string): string;
  abstract description(contract: ParsedContract): string;
  abstract overview(contract: ParsedContract, links: Record<string, string>): string;
  abstract stateVars(contract: ParsedContract): string;
  abstract structs(contract: ParsedContract): string;
  abstract events(contract: ParsedContract): string;
  abstract functions(contract: ParsedContract): string;
  abstract footer(): string;

  printContract(contract: ParsedContract, links: Record<string, string>): string {
    const output = [
      this.header(),
      this.title(contract.name),
      this.description(contract),
      this.overview(contract, links),
      this.stateVars(contract),
      this.structs(contract),
      this.events(contract),
      this.functions(contract),
      this.footer(),
    ];
    return output.join('\n');
  }

  print(contracts: ParsedContract[], links: Record<string, string>): Record<string, string> {
    const { compiledData } = this.params;
    const output: Record<string, string> = {};
    for(const contract of contracts) {
      output[contract.name] = this.printContract(contract, links);
    }
    return output;
  }

}
