export interface SwaggerPathItemInterface {
  method?: string;
  path?: string;
  request?: SwaggerPathItemRequestInterface;
  pathParameters?: string;
}

export interface SwaggerPathItemRequestInterface {
  pathParameters?: string;
  parameters?: any;
  name: string;
  request?: SwaggerPathItemRequestInterface;
  method: string;
  path?: string;
  type: string;
  summary?: string;
  produces?: string[];
  consumes?: string;
  security?: { [key: string]: string[] };
  responses?: [];
}
