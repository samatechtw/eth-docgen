import { Printer } from '.';
import { ParsedContract } from '../types';

export default class MarkdownPrinter extends Printer {

  header(): string {
    return '';
  }

  title(name: string): string {
    return '';
  }

  description(contract: ParsedContract): string {
    return '';
  }

  overview(contract: ParsedContract, links: Record<string, string>): string {
    return '';
  }

  stateVars(contract: ParsedContract): string {
    return '';
  }

  structs(contract: ParsedContract): string {
    return '';
  }

  events(contract: ParsedContract): string {
    return '';
  }

  functions(contract: ParsedContract): string {
    return '';
  }

  footer(): string {
    return '';
  }

};
