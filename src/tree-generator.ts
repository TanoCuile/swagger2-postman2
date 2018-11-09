import { SwaggerChildInterface } from './interfaces/swagger-child.interface';
import { SwaggerInterface } from './interfaces/swagger.interface';
export class TreeGenerator {
  /**
   * Reads the path structure of the swagger spec and converts it into a tree
   * 
   * //store a map: path -> {requestCount, isFolder}
   * eg. we hit /user which just has a get,
   * we store "/user": 1
   * then we see /user/username, which has a get
   * we store "/user/username": 1
   * 
   * Now we need to make "/user" a folder because it has a sub-path
   * We loop through again. When we hit /user/username,
   * we split into paths: /user. If this path doesn't exist, it's ok because it
   * has no request and /user/username can be a root folder.
   * 
   * If /user exists and has isFolder=false, set isFolder to true
   * 
   * What do we do for multiple segments? The solution must be recursive
   * 
   * 
   * NO NO NO. We create a tree-like structure
   * Keep adding root nodes
   * For each node that you pass, increment "count" by number of requests in the group
   * 
   * For eg. /user/specs/frame has 2 requests.
   * Each node can be an itemGroup OR a request
   * Each node has: name, requestCount, type
   * If type = request, it also has a request object
   * 
   * Then we just traverse the tree and convert it into a proper structure
   * The tree looks like:
   * 
   * root(2) -> user(2) -> specs(2) -> frame(2)
   * 
   * When we see /user with 1 request:
   * root(3) -> user(3) -> specs(2) -> frame(2)
   *   |-> GET
   * 
   * Once all paths are read, you do a recursive DFS traversal and create itemGroup structure tree
   *
   * @param json Swagger object
   */
  getTreeFromPaths(json: SwaggerInterface): SwaggerChildInterface {
    let tree: SwaggerChildInterface = {
      name: '/',
      requestCount: 0,
      children: {},
      type: 'group',
      requests: [],
    };
    let treeNode: SwaggerChildInterface, thisPath, thisPathCount, len, i;

    //if a particular path has MORE than 1 props, make it a folder - always
    //how to detemine subfolders?
    //first, loop through each path and store request count at that path
    //then, loop throug each path again, and see which of its sub-paths have more than 1 requsts

    for (let path in json.paths) {
      if (json.paths.hasOwnProperty(path)) {
        let thisPathObject = (json.paths as any)[path];
        //thisPath will be [user, specs, frame]

        if (path[0] === '/') {
          // we don't want an empty first segment
          path = path.substring(1);
        }

        thisPath = path.split('/');
        thisPathCount = Object.keys(thisPathObject).length; // =3
        len = thisPath.length;

        treeNode = tree;

        for (i = 0; i < len; i++) {
          if (!treeNode.children[thisPath[i]]) {
            treeNode.children[thisPath[i]] = {
              name: thisPath[i],
              requestCount: 0,
              children: {},
              requests: [],
              type: 'group',
            };
          }

          treeNode.children[thisPath[i]].requestCount += thisPathCount;
          treeNode = treeNode.children[thisPath[i]];
        }

        // loop complete. Add the children here
        // add the requests as "requestChildren"
        for (let method in thisPathObject) {
          if (thisPathObject.hasOwnProperty(method) && this.isValidMethod(method)) {
            treeNode.requests.push({
              name: method,
              method: method,
              type: 'request',
              path: path,
              request: thisPathObject[method],
              pathParameters: thisPathObject.parameters || [],
            });
          }
        }
      }
    }

    return tree;
  }

  /**
   * https://swagger.io/docs/specification/2-0/paths-and-operations/
   * Swagger 2.0 only supports get, post, put, patch, delete, head, and options.
   * 
   * @param method 
   */
  isValidMethod(method: string) {
    return method && ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase());
  }
}

const treeGenerator = new TreeGenerator();

export default treeGenerator;
