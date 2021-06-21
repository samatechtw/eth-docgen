
export function fmt(str: string, replacements: Record<string, string>) {
  return str.replace(
    /{(\w+)}/g,
    (withDelimiters: string, withoutDelimiters: string) =>
    replacements.hasOwnProperty(withoutDelimiters) ?
      replacements[withoutDelimiters] : withDelimiters
  );
}

function fmtListCallback(list: string[] | null, cb: Function): string {
  if(!list || list.length == 0) {
    return '';
  }
  const l = list.map((item: string) => cb(item));
  if(l.length === 1) {
    return l[0];
  }
  if(l.length === 2) {
    return `${l[0]} and ${l[1]}`;
  }
  return l.slice(0, -1).join(', ') + ', and ' + l[l.length - 1];
}

export function fmtListAnd(list: string[] | null): string {
  return fmtListCallback(list, (item: string) => item);
}

export function fmtListLinks(list: string[] | null, links: Record<string, string>): string {
  return fmtListCallback(list, (item: string) => (
    links[item] ? `<a href="${links[item]}">${item}</a>` : item
  ));
}
