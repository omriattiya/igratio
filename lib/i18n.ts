import en from "@/messages/en.json";

export type Messages = typeof en;
export const messages: Messages = en;

export function t(
  template: string,
  vars: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key)
      ? String(vars[key])
      : `{${key}}`
  );
}

export function duplicateRowsNote(
  total: number,
  dupCount: number,
  copy: Messages["summary"]
): string {
  const template =
    dupCount === 1 ? copy.duplicateRowsOne : copy.duplicateRowsMany;
  return t(template, { total, dupCount });
}
