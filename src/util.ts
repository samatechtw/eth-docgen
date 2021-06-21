
export function fmt(str: string, replacements: Record<string, string>) {
  return str.replace(
    /{(\w+)}/g, 
    (withDelimiters: string, withoutDelimiters: string) =>
    replacements.hasOwnProperty(withoutDelimiters) ? 
      replacements[withoutDelimiters] : withDelimiters
  );
}

export function fmtListAnd(list: string[] | null): string {
  if(!list || list.length == 0) {
    return '';
  }
  if(list.length === 1) {
    return list[0];
  }
  if(list.length === 2) {
    return `${list[0]} and ${list[1]}`;
  }
  return list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
}
