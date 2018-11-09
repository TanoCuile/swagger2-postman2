import { SwaggerDataInterface } from '../interfaces/swagger-data.interface';
import { Item, Response } from 'postman-collection';
import * as lodash from 'lodash';
import schemaFaker from 'typescript-json-schema-faker';
(schemaFaker as any).option({
  requiredOnly: true,
});
export class ResponseConverter {
  // Adds a postmanResponse to item.responses
  addResponsesFromSwagger(
    swaggerData: SwaggerDataInterface,
    item: Item,
    resCode: number | string,
    swaggerResponse: {
      schema: {
        definitions: object;
      };
      headers: object;
      examples: { [key: string]: any };
      description: string;
    },
  ) {
    var postmanResponse, exampleMimeType, example;

    if (swaggerResponse.schema || swaggerResponse.headers || swaggerResponse.examples) {
      resCode = typeof resCode === 'string' ? parseInt(resCode) : resCode;
      if (resCode !== resCode) {
        resCode = 200;
      }
      // can be added to request.responses
      if (swaggerResponse.examples) {
        // each frkn example is a different response
        for (exampleMimeType in swaggerResponse.examples) {
          if (swaggerResponse.examples.hasOwnProperty(exampleMimeType)) {
            example = swaggerResponse.examples[exampleMimeType];

            postmanResponse = new Response({
              code: resCode,
              responseTime: 0,
            });
            postmanResponse.name = swaggerResponse.description;
            if (typeof example === 'object') {
              postmanResponse.body = JSON.stringify(example);
            } else {
              postmanResponse.body = example;
            }

            if (exampleMimeType.includes('json')) {
              (postmanResponse as any)._postman_previewlanguage = 'json';
            }

            if (swaggerResponse.headers) {
              // TODO to convert swagger headers object to
              // Postman headers array or string
            }
            item.responses.add(postmanResponse);
          }
        }
      } else if (swaggerResponse.schema) {
        // no examples, only schema
        postmanResponse = new Response({
          code: resCode,
          responseTime: 0,
        });
        postmanResponse.name = swaggerResponse.description;

        swaggerResponse.schema.definitions = lodash.assign(
          {},
          swaggerData.sampleDefinitions, //global definitions
          swaggerResponse.schema.definitions, //local definitions
        );
        try {
          postmanResponse.body = JSON.stringify(schemaFaker(swaggerResponse.schema), null, 2);
        } catch (e) {
          postmanResponse.body = '// ' + JSON.stringify(swaggerResponse.schema);
        }
        item.responses.add(postmanResponse);
      }
    } else {
      //can only add to description. Leave for now
    }
  }
}

const responseConverter = new ResponseConverter();

export default responseConverter;
