'use strict';

var Mock = require('mockjs');

var preset = ['@prizeName', '@prizeType'];

var presetData = {
  prizeName: ['Rs.100 recharge card', '华为手机', '1USD话费充值卡'],
  prizeType: ['VIRTUAL', 'ENTITY', 'UNKNOW']
};

module.exports = function (data) {
  var data = Mock.mock(data);
  return cloneObject(data);
};

///////////////////////

function cloneObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  var temp = obj.constructor();
  for (var key in obj) {
    if (typeof obj[key] === 'string') {
      temp[key] = value(obj[key]);
    } else {
      temp[key] = cloneObject(obj[key]);
    }
  }

  return temp;
}

function value(str) {
  var reg = /^@/;
  var index = preset.indexOf(str);

  if (reg.test(str) && index > -1) {
    var dataKey = preset[index].replace('@', '');
    var random = Math.random() * presetData[dataKey].length >> 0;
    return presetData[dataKey][random];
  }

  if (!reg.test(str) && str.indexOf('|') > -1) {
    var arr = str.split('|');
    var randomIndex = Math.random() * arr.length >> 0;
    return arr[randomIndex];
  }

  return str;
}
