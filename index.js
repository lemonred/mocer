'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var url = require('url');
var querystring = require('querystring');
var jetpack = require('fs-jetpack');
var strip = require('strip-comments');
var colors = require('colors');
var dirTree = require('directory-tree');

/**
 * Module exports.
 * @public
 */

module.exports = mock;
/**
 * mock data
 *
 * @public
 * @param {String|Buffer} path
 * @param {Object} [options]
 * @return {Function} middleware
 */

function mock(root, options) {
  var opts = options || {};

  createTemplate(root);
  createAllJson(root);

  return function mock(req, res, next) {
    var isMockie = req.url.indexOf('_apis') > -1 && req.url.indexOf('all') < 0;

    if (isMockie) {
      renderTemplate(req, res, next, root);
    } else if (req.url === '/_apis/all') {
      renderAllJson(req, res, next, root);
    } else if (req.url.indexOf('mocer.app.css') > -1) {
      renderStyle(req, res, next, root);
    } else if (req.url.indexOf('mocer.app.js') > -1) {
      renderJS(req, res, next, root);
    } else {
      renderApis(req, res, next, root);
    }
  };
}

// /////////////////////////////////////////////////////////////////////////////

/**
 * get mock json path
 *
 * @private
 * @param {string} mockPath
 * @param {object} req
 * @return {string}
 */
function getMockFilePath(mockPath, req, callback) {
  var mockUrlPath = url.parse(req.url).pathname;
  var query = url.parse(req.url).query;
  var mockFilePath = path.join(mockPath, mockUrlPath + '.' + req.method + '.md');

  fs.exists(mockFilePath, function (exists) {
    if (exists) {
      return callback(mockFilePath);
    }

    return callback(false);
  });
}

/**
 * Create template for apis page
 *
 * @private
 * @param {string} mockPath
 * @return {null}
 */
function createTemplate(mockPath) {
  var src = path.join(__dirname, 'assets', 'template.html');
  var dest = path.join(mockPath, '_apis', 'index.html');
  jetpack.copy(src, dest, { overwrite: true });
  jetpack.copy(path.join(__dirname, 'assets', 'js', 'mocer.app.js'), path.join(mockPath, '_apis', 'mocer.app.js'), { overwrite: true });
  jetpack.copy(path.join(__dirname, 'assets', 'css', 'mocer.app.css'), path.join(mockPath, '_apis', 'mocer.app.css'), { overwrite: true });

}

/**
 * Create json data for apis page
 *
 * @private
 * @param {string} mockPath
 * @return {null}
 */
function createAllJson(mockPath) {
  var paths = jetpack.find(mockPath, { matching: ['*.md'] });
  var data = {
    apis: []
  };

  paths.forEach(function (item, i) {
    if (item.indexOf('_apis') < 0) {
      var res = jetpack.read(item);
      var index = mockPath.lastIndexOf(path.sep);
      var splitStr = mockPath.substring(index);
      var arr = item.split(splitStr)[1].split('.');
      var item = { path: item,  url: arr[0], method: arr[1], res: res, id: i };
      data.apis.push(item);
    }
  });

  data.tree = dirTree.directoryTree(mockPath, ['.md']);

  jetpack.write(path.join(mockPath, '_apis', 'all.json'), data);
}

/**
 * render template
 *
 * @private
 * @param {string} mockPath
 * @param {object} res
 * @param {object} next
 * @return {null}
 */
function renderTemplate(req, res, next, mockPath) {
  var templatePath = path.join(mockPath, '_apis', 'index.html');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html;charset=utf-8');
  res.end(fs.readFileSync(templatePath, 'utf8'));
  return;
}

/**
 * render all.json
 *
 * @private
 * @param {string} mockPath
 * @param {object} res
 * @param {object} next
 * @return {null}
 */
function renderAllJson(req, res, next, mockPath) {
  var data = jetpack.read(path.join(mockPath, '_apis', 'all.json'), 'json');
  data = JSON.stringify(data);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  res.end(data);
  return;
}

/**
 * render Style
 *
 * @private
 * @param {string} mockPath
 * @param {object} res
 * @param {object} next
 * @return {null}
 */
function renderStyle(req, res, next, mockPath) {
  var data = jetpack.read(path.join(mockPath, '_apis', 'mocer.app.css'));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/css');
  res.end(data);
  return;
}

/**
 * render JS
 *
 * @private
 * @param {string} mockPath
 * @param {object} res
 * @param {object} next
 * @return {null}
 */
function renderJS(req, res, next, mockPath) {
  var data = jetpack.read(path.join(mockPath, '_apis', 'mocer.app.js'));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/javascript');
  res.end(data);
  return;
}

function renderApis(req, res, next, mockPath) {
  var query = url.parse(req.url).query;
  var status = querystring.parse(query)._status || '200';

  getMockFilePath(mockPath, req, function (mockFilePath) {
    if (!mockFilePath) {
      return next();
    }

    var reg = /```[js| js|javascript| javascript]([^`]+)```/gi;
    var str = fs.readFileSync(mockFilePath, 'utf8');
    var arr = str.match(reg);
    var resStr = null;

    if (!arr || !arr.length) {
      return next();
    }

    arr.forEach(function (item) {
      if (item.indexOf('<response=200>') > -1) {
        resStr = item.toString();
      }
    });

    // if (!resStr) {
    //   return next();
    // }

    try {
      resStr = resStr.replace(/```js|``` js|```javascript|``` javascript|```/gi, '');
      resStr = strip(resStr);

      if (resStr.search(/\{|\[/) > -1) {
        resStr = eval('(' + resStr + ')');
        resStr = resStr ? JSON.stringify(resStr) : null;
      } else {
        resStr = null;
      }

    } catch (e) {
      console.log(colors.red('something wrong in file: ' + mockFilePath));
      console.log(colors.red(e));
    }

    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json;charset=utf-8');

    if (resStr) {
      res.end(resStr);
    } else {
      res.end();
    }

    return;

  });
}
