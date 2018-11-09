import { SwaggerDataInterface } from '../interfaces/swagger-data.interface';
import { Item, Request, ItemGroup } from 'postman-collection';
import { SwaggerChildInterface } from '../interfaces/swagger-child.interface';
import requestConverter from './request.converter';
export class ChildConverter {
  /**
   * Convert path item (child) into collection item group
   *
   * @param swaggerData Swagger general data
   * @param child Path item
   */
  convertChildToItemGroup(swaggerData: SwaggerDataInterface, child: SwaggerChildInterface): ItemGroup<Request> | Item {
    var thisItemGroup, thisItem, rCount, subChild, i, oneRequest;
    // child will be a folder or request
    // depending on the type

    if (child.type === 'group') {
      // folder
      if (child.requestCount > 1) {
        // Folder with more than 1 request
        // Should be converted to a folder
        thisItemGroup = new ItemGroup<Request>({
          name: child.name,
        });
        for (subChild in child.children) {
          if (child.children.hasOwnProperty(subChild)) {
            thisItemGroup.items.add(this.convertChildToItemGroup(swaggerData, child.children[subChild]));
          }
        }
        for (i = 0, rCount = child.requests.length; i < rCount; i++) {
          thisItemGroup.items.add(this.convertChildToItemGroup(swaggerData, child.requests[i]));
        }

        return thisItemGroup;
      }

      // folder only has one request
      // no need to nest
      // just create a request from the one endpoint it has
      oneRequest = requestConverter.getSingleSwaggerRequestFromFolder(child);

      return requestConverter.convertSwaggerRequestToItem(swaggerData, oneRequest);
    }

    // request
    thisItem = requestConverter.convertSwaggerRequestToItem(swaggerData, child);

    return thisItem;
  }
}

const childConverter = new ChildConverter();

export default childConverter;
