import { DocgenParams } from '../types';

export abstract class Printer {
  data!: DocgenParams;

  constructor(data: DocgenParams) {
    this.setParams(data);
  }

  setParams(data: DocgenParams): Printer {
    this.data = data;
    return this;
  }

}
