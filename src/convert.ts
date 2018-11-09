import { Collection, VariableList } from 'postman-collection';
import { ConvertationResultInterface } from './interfaces/convertation.result.interface';
import { SwaggerInterface } from './interfaces/swagger.interface';
import { ParseResultInterface } from './interfaces/parse-result.interface';
import { SwaggerDataInterface } from './interfaces/swagger-data.interface';
import * as lodash from 'lodash';
import helper from './helpers';
import { SwaggerChildInterface } from './interfaces/swagger-child.interface';
import treeGenerator from './tree-generator';
import parser from './parser';

export class Converter {
  protected createCollectionStructure(
    swaggerData: SwaggerDataInterface,
    tree: SwaggerChildInterface,
    collection: Collection,
  ) {
    // this takes in the tree structure, and creates the collection struct
    // with folders and params and requests

    // Add each of the root children to the collection items
    const itemGroup = helper.convertSwaggerDataToCollection(swaggerData, tree);
    collection.items.add(itemGroup);
  }

  /**
   * Converts swagger string or object into postman collection
   *
   * @param json Swagger string or object for convert
   */
  convert(json: string | SwaggerInterface) {
    // No validation needed. If the app didn't call validate, this will throw an error
    const result: ConvertationResultInterface = {
      result: false,
      collection: {},
      reason: '',
    };

    const collection = new Collection();
    let swagger: SwaggerInterface = this.getSwaggerObject(json);

    // Set data needed for swagger->Postman conversion

    const swaggerData: SwaggerDataInterface = this.prepareSwaggerData(swagger); // global sample responses

    // Start building out collection:
    collection.name = swagger.info.title;
    collection.describe(swagger.info.description);
    collection.variables = new VariableList(collection, lodash.map(swaggerData.sampleDefinitions));

    let tree = treeGenerator.getTreeFromPaths(swagger);
    this.createCollectionStructure(swaggerData, tree, collection);

    result.collection = collection.toJSON();

    return result;
  }

  private getSwaggerObject(json: string | SwaggerInterface): SwaggerInterface {
    if (typeof json === 'string') {
      //parse
      let parseResult = parser.parse(json) as ParseResultInterface;
      if (!parseResult.result || !parseResult.swagger) {
        throw new Error('Invalid Swagger object');
      }
      return parseResult.swagger;
    } else {
      return json;
    }
  }

  private prepareSwaggerData(swagger: SwaggerInterface) {
    const swaggerData: SwaggerDataInterface = {
      baseParams: {},
      basePath: '',
      globalConsumes: [],
      globalProduces: [],
      sampleDefinitions: [],
      sampleResponses: [],
      securityDefs: [],
    };
    // Set schema-wide input and output formats
    swaggerData.globalConsumes = swagger.consumes || [];
    swaggerData.globalProduces = swagger.produces || [];
    // Read global properties from the JSON:
    swaggerData.basePath = parser.getBasePath(swagger);
    swaggerData.baseParams = swagger.parameters;
    // Read definitions, response schemas, security schemes
    swaggerData.securityDefs = swagger.securityDefinitions; // global auth
    swaggerData.sampleDefinitions = swagger.definitions; // global schema defs
    swaggerData.sampleResponses = swagger.responses; // global sample responses
    return swaggerData;
  }
}

const converter = new Converter();

export default converter;

// Exports the convert function for the plugin
