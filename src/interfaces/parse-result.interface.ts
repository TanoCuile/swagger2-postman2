import { SwaggerInterface } from './swagger.interface';
import { ResultInterface } from './result.interface';

export interface ParseResultInterface extends ResultInterface {
  swagger?: SwaggerInterface;
  reason?: string;
}
