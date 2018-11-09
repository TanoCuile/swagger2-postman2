import { SwaggerParamInterface } from './swagger-param.interface';

export interface SwaggerInterface {
  swagger: string;
  info: Info;
  basePath: string;
  tags: Tag[];
  schemes: string[];
  securityDefinitions: SecurityDefinitions;
  host: string;
  paths: Paths;
  definitions: Definitions;
  consumes: any[];
  produces: any[];
  parameters: { [key: string]: SwaggerParamInterface };
  responses: any[];
}

export interface Definitions {
  [key: string]: any;
}

export interface Info {
  description: string;
  version: string;
  title: string;
}

export interface Paths {
  get?: Action;
  post?: Action;
  patch?: Action;
  put?: Action;

  parameters: SwaggerParamInterface[];
}
export interface Action {
  summary: string;
  description: string;
  operationId: string;
  responses: Responses;
  produces: Consume[];
  consumes: Consume[];
  parameters?: SwaggerParamInterface[];
}

export enum Consume {
  ApplicationJSON = 'application/json',
}

export interface Responses {
  [key: string]: {
    description?: string;
  };
}

export interface SecurityDefinitions {
  [key: string]: any;
}

export interface Tag {
  name: string;
  description: string;
}
