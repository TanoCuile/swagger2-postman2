import {
  ItemGroup,
  Request,
  Item,
  RequestBody,
  Response,
  Header,
  HeaderList,
  RequestBodyDefinition,
} from 'postman-collection';
import { SwaggerInterface, Action } from './interfaces/swagger.interface';
import { SwaggerDataInterface } from './interfaces/swagger-data.interface';
import { SwaggerParamInterface } from './interfaces/swagger-param.interface';
import { SwaggerChildInterface } from './interfaces/swagger-child.interface';
import { SwaggerPathItemInterface, SwaggerPathItemRequestInterface } from './interfaces/swagger-path-item.interface';
import * as url from 'url';
import * as lodash from 'lodash';
import * as jsYaml from 'js-yaml';
import { ParseResultInterface } from './interfaces/parse-result.interface';
import childConverter from './converters/child.converter';

export class Helper {
  convertSwaggerDataToCollection(swaggerData: SwaggerDataInterface, child: SwaggerChildInterface) {
    return childConverter.convertChildToItemGroup(swaggerData, child);
  }
}

const helper = new Helper();

export default helper;
