import { ResultInterface } from './result.interface';

export interface ConvertationResultInterface extends ResultInterface {
  collection: object;
  reason: string;
}
