import { SwaggerPathItemInterface, SwaggerPathItemRequestInterface } from './swagger-path-item.interface';

export interface SwaggerChildInterface extends SwaggerPathItemInterface {
  type: string;
  requestCount: number;
  name: string;
  children: { [key: string]: SwaggerChildInterface };
  requests: SwaggerPathItemRequestInterface[];
}
