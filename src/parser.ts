import { SwaggerInterface } from './interfaces/swagger.interface';
import * as jsYaml from 'js-yaml';
import { ParseResultInterface } from './interfaces/parse-result.interface';

export class Parser {
  /**
   * sets collection basePath according to swagger basePath and schemes
   *
   * @param swagger Swagger object
   */
  getBasePath(swagger: SwaggerInterface) {
    var basePath = '';

    if (swagger.host) {
      basePath = swagger.host;
    }
    if (swagger.basePath) {
      basePath += swagger.basePath;
    }

    if (swagger.schemes && swagger.schemes.indexOf('https') !== -1) {
      basePath = 'https://' + basePath;
    } else {
      basePath = 'http://' + basePath;
    }

    if (!basePath.endsWith('/')) {
      basePath += '/';
    }

    return basePath;
  }

  /**
   * Called from the exported .validate function
   *
   * @param jsonOrString Swagger string or object
   */
  parse(jsonOrString: string | SwaggerInterface): ParseResultInterface {
    try {
      let swaggerObj: SwaggerInterface = this.getSwaggerObject(jsonOrString); // valid JSON

      // Check for everything that's required according to
      // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md
      if (swaggerObj.swagger !== '2.0') {
        return {
          result: false,
          reason: 'The Swagger object must have the "swagger" property set to 2.0',
        };
      }
      if (!swaggerObj.info) {
        return {
          result: false,
          reason: 'The Swagger object must have an "info" property',
        };
      }
      if (!(swaggerObj.info.title && swaggerObj.info.version)) {
        return {
          result: false,
          reason: 'The info property must have title and version defined',
        };
      }
      if (!swaggerObj.paths) {
        return {
          result: false,
          reason: 'The Swagger object must have a "paths" property',
        };
      }

      // Valid. No reason needed
      return {
        result: true,
        swagger: swaggerObj,
      };
    } catch (yamlEx) {
      // Not JSON or YAML
      return {
        result: false,
        reason: 'The input must be valid JSON or YAML',
      };
    }
  }

  private getSwaggerObject(jsonOrString: string | SwaggerInterface): SwaggerInterface {
    let swaggerObj = jsonOrString;
    if (typeof jsonOrString === 'string') {
      try {
        swaggerObj = JSON.parse(jsonOrString);
      } catch (jsonEx) {
        // Not direct JSON. Could be YAML
        swaggerObj = jsYaml.safeLoad(jsonOrString);
        // valid YAML
      }
    } // valid JSON
    return swaggerObj as SwaggerInterface;
  }
}

const parser = new Parser();

export default parser;
