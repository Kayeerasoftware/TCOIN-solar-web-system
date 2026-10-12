export interface EditorLine {
  key: string;
  variant_id?: string | null;
  particulars: string;
  specification: string;
  unit: string;
  quantity: number;
  rate: number;
  image_url?: string | null;
}

let counter = 0;
export const newLineKey = () => `line-${++counter}`;
export const blankLine = (): EditorLine => ({
  key: newLineKey(),
  particulars: '',
  specification: '',
  unit: 'pc',
  quantity: 1,
  rate: 0,
});
