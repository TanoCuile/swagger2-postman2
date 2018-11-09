import { SwaggerParamInterface } from './swagger-param.interface';
import { SecurityDefinitions, Definitions } from './swagger.interface';
export interface SwaggerDataInterface {
  globalConsumes: string[];
  globalProduces: string[];
  basePath: string;
  baseParams: { [key: string]: SwaggerParamInterface };
  securityDefs: SecurityDefinitions;
  sampleDefinitions: Definitions;
  sampleResponses: any[];
}
