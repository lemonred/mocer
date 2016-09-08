'use strict';

var decomment = require('decomment');
var handleData = require('./handle-data');

var dataTpl = {
  req: {
  },
  res: {
    delay: 0,
    data: {}
  }
};
/**
 * md文件内容
 * @param  {String} str 文件路径
 * @return {Object}  parse 后的js obj, 数据机构和dataTpl一样
 */
module.exports = function (str) {
  var regMatch = /```\s*(js|javascript)([^`]*?)```/gi;
  var regReplace = /(```)\s*(js|javascript)|```/gi;

  var arr = str.match(regMatch).map(function (item) {
    item = item.replace(regReplace, '');
    return item;
  });

  arr.forEach(function (item) {
    if (item.indexOf('<request>') > -1) {
      dataTpl.req = eval('(' + decomment(item) + ')');
    }

    if (item.indexOf('<response=200>') > -1) {
      dataTpl.res.delay = getDaly(item);
      var resData = eval('(' + decomment(item) + ')');
      dataTpl.res.data = handleData(resData);
    }
  });

  return dataTpl;
};

function getDaly(str) {
  var regDelay = /<delay=(.*)>/;
  var result = regDelay.exec(str);
  if (result) {
    return result[1];
  }

  return 0;
}
