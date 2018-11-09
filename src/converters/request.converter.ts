import { SwaggerChildInterface } from '../interfaces/swagger-child.interface';
import { SwaggerDataInterface } from '../interfaces/swagger-data.interface';
import { RequestBodyDefinition, Header, Request, HeaderList, Item, RequestBody } from 'postman-collection';
import { SwaggerParamInterface } from '../interfaces/swagger-param.interface';
import paramConverter from './param.converter';
import responseConverter from './response.converter';

import schemaFaker from 'typescript-json-schema-faker';
import * as lodash from 'lodash';
import * as url from 'url';
(schemaFaker as any).option({
  requiredOnly: true,
});

export class RequestConverter {
  getSingleSwaggerRequestFromFolder(swaggerChild: SwaggerChildInterface): any | null {
    var childName;

    if (swaggerChild.requests.length > 0) {
      return swaggerChild.requests[0];
    }
    for (childName in swaggerChild.children) {
      if (swaggerChild.children.hasOwnProperty(childName)) {
        return this.getSingleSwaggerRequestFromFolder(swaggerChild.children[childName]);
      }
    }

    return null;
  }
  // converts a swagger request to a Postman Item
  convertSwaggerRequestToItem(swaggerData: SwaggerDataInterface, pathItem: SwaggerChildInterface) {
    // Properties of Item:
    let rUrl,
      rName,
      rDataMode,
      rData: any = [],
      rHeaders: Header[] = [],
      rPathVariables: { [key: string]: any } = {},
      rMethod = pathItem.method,
      request,
      requestBodyJSON: RequestBodyDefinition,
      item,
      thisProduces,
      thisConsumes,
      path = pathItem.path,
      tempBasePath,
      param,
      hasQueryParams = false,
      thisResponses,
      thisResponse: SwaggerParamInterface,
      thisResponseRef,
      thisResponseRefObject,
      operation = pathItem.request,
      pathParameters = pathItem.pathParameters,
      defaultVal,
      resCode,
      baseParams = swaggerData.baseParams,
      thisParams = paramConverter.getParamsForPathItem(swaggerData, [baseParams, operation.parameters, pathParameters]);

    // replace path variables {petId} with :petId
    if (path) {
      path = path.replace(/{/g, ':').replace(/}/g, '');
    }

    // if (operation[META_KEY]) {
    //     for (requestAttr in operation[META_KEY]) {
    //         if (operation[META_KEY].hasOwnProperty(requestAttr)) {
    //          // TODO: Save these in auth?
    //             request[requestAttr] = operation[META_KEY][requestAttr];
    //         }
    //     }
    // }

    // URL
    tempBasePath = swaggerData.basePath
      .replace(/{{/g, 'POSTMAN_VARIABLE_OPEN_DB')
      .replace(/}}/g, 'POSTMAN_VARIABLE_CLOSE_DB');

    rUrl = decodeURI(url.resolve(tempBasePath, path))
      .replace(/POSTMAN_VARIABLE_OPEN_DB/gi, '{{')
      .replace(/POSTMAN_VARIABLE_CLOSE_DB/gi, '}}');

    rName = operation.summary;

    // convert the request
    // >> headers
    thisProduces = operation.produces || swaggerData.globalProduces;
    thisConsumes = operation.consumes || swaggerData.globalConsumes;

    if (thisProduces.length > 0) {
      rHeaders.push(new Header('Accept: ' + thisProduces.join(', ')));
    }
    if (thisConsumes.length > 0) {
      rHeaders.push(new Header('Content-Type: ' + thisConsumes[0]));
    }

    // auth done for type=apiKey
    lodash.each(operation.security, security => {
      for (let secReq in security) {
        if (security.hasOwnProperty(secReq)) {
          // look up global security definitions for this
          if (swaggerData.securityDefs[secReq] && swaggerData.securityDefs[secReq].type === 'apiKey') {
            thisParams.apiKey = swaggerData.securityDefs[secReq];
          }
        }
      }
    });

    // Add params to URL / body / headers
    for (param in thisParams) {
      if (thisParams.hasOwnProperty(param) && thisParams[param]) {
        // Get default value for .in = query/header/path/formData
        defaultVal = '{{' + thisParams[param].name + '}}';
        if (thisParams[param].hasOwnProperty('default')) {
          defaultVal = thisParams[param].default;
        }

        // TODO: Include options support
        if (thisParams[param].in === 'query') {
          // && this.options.includeQueryParams !== false) {
          if (!hasQueryParams) {
            hasQueryParams = true;
            rUrl += '?';
          }
          rUrl += thisParams[param].name + '=' + defaultVal + '&';
        } else if (thisParams[param].in === 'header') {
          rHeaders.push(new Header(thisParams[param].name + ': ' + defaultVal));
        } else if (thisParams[param].in === 'body') {
          rDataMode = 'raw';
          // Use schema if possible
          if (thisParams[param].schema) {
            thisParams[param].schema.definitions = lodash.assign(
              {},
              swaggerData.sampleDefinitions, //global definitions
              thisParams[param].schema.definitions, //local definitions
            );
          }
          try {
            rData = schemaFaker(thisParams[param].schema);
          } catch (e) {
            rData = '// ' + JSON.stringify(thisParams[param].schema);
          }
          rHeaders.push(new Header('Content-Type: application/json'));
        } else if (thisParams[param].in === 'formData') {
          if (thisConsumes.indexOf('application/x-www-form-urlencoded') > -1) {
            rDataMode = 'urlencoded';
          } else {
            rDataMode = 'formdata';
          }
          rData.push({
            key: thisParams[param].name,
            value: defaultVal,
            type: 'text',
            enabled: true,
          });
        } else if (thisParams[param].in === 'path') {
          rPathVariables[thisParams[param].name] = defaultVal;
        }
      }
    }

    request = new Request({
      method: rMethod,
      name: rName,
      url: rUrl,
    });
    request.headers = new HeaderList(request, rHeaders);

    item = new Item({ name: rName });

    // request body
    requestBodyJSON = {
      mode: rDataMode || '',
    };

    if (rDataMode === 'formdata') {
      requestBodyJSON.formdata = rData;
    } else if (rDataMode === 'urlencoded') {
      requestBodyJSON.urlencoded = rData;
    } else {
      requestBodyJSON.raw = JSON.stringify(rData, null, 2);
    }
    request.body = new RequestBody(requestBodyJSON);

    //response
    thisResponses = operation.responses;
    // this is an object
    // each key's value might have a $ref OR be a response in itself

    for (resCode in thisResponses) {
      // resCode can be 'default' or a code
      if (thisResponses.hasOwnProperty(resCode)) {
        thisResponse = thisResponses[resCode];
        if (thisResponse.$ref) {
          //need to check if the response definition
          thisResponseRef = lodash.get(thisResponse.$ref.split('#/responses/'), '1');
          if (swaggerData.sampleResponses[thisResponseRef]) {
            //if the response just has a description
            thisResponseRefObject = swaggerData.sampleResponses[thisResponseRef];
            responseConverter.addResponsesFromSwagger(swaggerData, item, resCode, thisResponseRefObject);
          }
        } else {
          //defined here
          responseConverter.addResponsesFromSwagger(swaggerData, item, resCode, thisResponse);
        }
      }
    }

    item.request = request;

    return item;
  }
}

const requestConverter = new RequestConverter();

export default requestConverter;
