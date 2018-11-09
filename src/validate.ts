import { SwaggerInterface } from './interfaces/swagger.interface';
import parser from './parser';

function validate(json: string | SwaggerInterface) {
  var parseResult = parser.parse(json);

  if (!parseResult.result) {
    return {
      result: false,
      reason: parseResult.reason,
    };
  }

  return {
    result: true,
  };
}

export { validate };
