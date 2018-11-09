export interface SwaggerParamInterface {
  type: Type;
  name: string;
  required: boolean;
  in: In;
  description?: string;
  $ref: string;
  default: string;
  schema: any;
}

export enum Type {
  Array = 'array',
  Boolean = 'boolean',
  Number = 'number',
  Object = 'object',
  String = 'string',
}

export enum In {
  Path = 'path',
  Query = 'query',
  Body = 'body',
  Header = 'header',
  FormData = 'formData',
}
