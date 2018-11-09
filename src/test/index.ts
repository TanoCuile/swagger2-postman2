import treeGenerator from '../tree-generator';

// import * as converter from '../index';


const swaggerData = require('../../test/data/swagger.json');

const tree = treeGenerator.getTreeFromPaths(swaggerData);

console.log(JSON.stringify(tree));

