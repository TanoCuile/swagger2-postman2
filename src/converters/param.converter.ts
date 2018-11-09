import { SwaggerDataInterface } from '../interfaces/swagger-data.interface';
import { SwaggerParamInterface } from '../interfaces/swagger-param.interface';

export class ParamConverter {
  /**
   * Combines all params for a swagger path
   * Headers / body / path etc.
   *
   * @param swaggerData Swagger general data
   * @param paramArray List of params
   */
  getParamsForPathItem(
    swaggerData: SwaggerDataInterface,
    paramArray: SwaggerParamInterface[][],
  ): { [key: string]: SwaggerParamInterface } {
    const retVal: { [key: string]: SwaggerParamInterface } = {};
    let lastPart: string;
    let i, j, lenI, lenJ, parts, paramGroup, getBaseParam;

    for (i = 0, lenI = paramArray.length; i < lenI; i++) {
      paramGroup = paramArray[i];
      if (paramGroup instanceof Array) {
        for (j = 0, lenJ = paramGroup.length; j < lenJ; j++) {
          if (paramGroup[j].$ref) {
            // this is a ref
            if (paramGroup[j].$ref.indexOf('#/parameters') === 0) {
              parts = paramGroup[j].$ref.split('/');
              lastPart = parts[parts.length - 1];
              getBaseParam = swaggerData.baseParams[lastPart];
              retVal[lastPart] = getBaseParam;
            }
          } else {
            retVal[paramGroup[j].name] = paramGroup[j];
          }
        }
      }
    }

    return retVal;
  }
}

const paramConverter = new ParamConverter();

export default paramConverter;
