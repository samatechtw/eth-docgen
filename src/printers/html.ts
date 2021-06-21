import { readFileSync } from 'fs';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import simpleVars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import { Printer } from '.';
import { ContractVar, ParsedContract, Pragma } from '../types';
import { fmt, fmtListAnd } from '../util';

interface TableData {
  label?: string,
  data: any[],
  cls: string,
  callback: Function,
};

const table = ({ label, data, cls, callback }: TableData) => (
  ((data && data.length)
    ? `<div class="table ${cls || ''}">\n` +
    (label ? `<div class="table-head">${label}</div>` : '')
      + data.map(d => `<div class="table-row">${callback(d)}</div>\n`).join('')
      + '</div>'
    : ''
  )
);

const varTableCell = (v: ContractVar) => (
  '<div class="var-data-cell">\n<div class="var-data">'
    + (v.name ? `<div class="var">${v.name}</div>` : '')
    +  `<div class="type">${v.type}</div>\n
    </div>
    <div>${v.comment}</div>
  </div>`
);

export default class HtmlPrinter extends Printer {

  header(): string {
    const { inlineCss } = this.params;
    let text = '<!doctype html>\n<html lang="en">\n'
      + '<head>\n<meta charset="UTF-8">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
      + '<link rel="shortcut icon" href="" />\n'
      + (inlineCss ? '' : '<link rel="stylesheet" type="text/css" href="./doc.css" />\n')
      + '</head>\n<body><div class="contract">';
    if(inlineCss) {
      const pCss = readFileSync('./assets/theme.css', 'utf-8');
      const css = postcss([autoprefixer, simpleVars({} as any), nested]).process(pCss);
      text += `<style>\n${css.css}\n</style>`;
    }
    return text;
  }

  title(name: string): string {
    const titleFmt = this.params.formatStrings.title;
    return `<h1>${fmt(titleFmt, { name })}</h1>`;
  }

  description(contract: ParsedContract): string {
    const description = contract.title;
    return `<div class="description">${description}</div>`;
  }

  overview(contract: ParsedContract): string {
    let text = '<div class="section overview">\n';
    text += `<h2>${this.params.formatStrings.overview}</h2>`;
    if(contract.authors) {
      const authFmt = this.params.formatStrings.author;
      const authors = fmtListAnd(contract.authors);
      text += `<div class="authors">\n${fmt(authFmt, { authors })}\n</div>`;
    }
    if(contract.inherits) {
      const inheritFmt = this.params.formatStrings.inherits;
      const inherits = fmtListAnd(contract.inherits);
      text += `<div class="inherits">\n${fmt(inheritFmt, { inherits })}\n</div>`;
    }
    if(contract.pragmas) {
      text += table({
        label: this.params.formatStrings.pragmas,
        data: contract.pragmas,
        cls: 'pragmas',
        callback: (p: Pragma) => `<div class="var">${p.name}</div><div>${p.args}</div>`,
      });
    }
    return text;
  }

  stateVars(contract: ParsedContract): string {
    let text = '<div class="section state-vars">\n';
    text += `<h2>${this.params.formatStrings.stateVars}</h2>`;
    text += table({
      data: contract.stateVars,
      cls: 'state-vars',
      callback: (v: ContractVar) => (
        `<div class="visibility">${v.visibility}</div>\n${varTableCell(v)}`
    )});
    return text;
  }

  structs(contract: ParsedContract): string {
    let text = '<div class="section structs">\n';
    text += `<h2>${this.params.formatStrings.structs}</h2>`;
    contract.structs.forEach((struct) => {
      const { name, comment, fields } = struct;
      text += `<div class="struct">\n<h3>${name}</h3>\n`
        + (comment ? `<div class="comment">${comment}</div>\n` : '')
        + table({
          label: this.params.formatStrings.fields,
          data: fields,
          cls: 'struct-fields',
          callback: varTableCell,
        })
    });
    return text;
  }

  events(contract: ParsedContract): string {
    let text = '<div class="section events">\n';
    text += `<h2>${this.params.formatStrings.events}</h2>`;
    contract.events.forEach((event) => {
      const { name, comment, params } = event;
      text += `<div class="event">\n<h3>${name}</h3>\n`
        + (comment ? `<div class="comment">${comment}</div>\n` : '')
        + table({
          label: this.params.formatStrings.parameters,
          data: params,
          cls: 'event-params',
          callback: varTableCell,
        })
    });
    return text;
  }

  functions(contract: ParsedContract): string {
    let text = '<div class="section functions">\n';
    text += `<h2>${this.params.formatStrings.functions}</h2>`;
    contract.functions.forEach((fn) => {
      const { name, comment, visibility, params, returns } = fn;
      text += `<div class="function">\n<h3>${name}</h3>\n`
        + `<div class="visibility">${visibility}</div>\n`
        + (comment ? `<div class="comment">${comment}</div>\n` : '')
        + table({
          label: this.params.formatStrings.parameters,
          data: params,
          cls: 'function-params',
          callback: varTableCell,
        })
        + table({
          label: this.params.formatStrings.returns,
          data: returns,
          cls: 'function-returns secondary',
          callback: varTableCell,
        })
    });
    return text;
  }

  footer(): string {
    return '</div>\n</body>\n</html>';
  }

}
