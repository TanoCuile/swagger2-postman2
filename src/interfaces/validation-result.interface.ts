import { ResultInterface } from './result.interface';

export interface ValidationResultInterface extends ResultInterface {
  reason: string;
}
