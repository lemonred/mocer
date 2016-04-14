'use strict';

var $ = require('jquery');
var angular = require('angular');
var hljs = require('highlight.js');
var marked = require('marked');

angular
  .module('app', [])
  .controller('AppController', function ($scope, $location, $http) {
    var vm = this;

    vm.location = $location;
    $http.get('/_apis/all').then(function (data) {
      vm.apis = [];
      data.data.forEach(function (item) {
        vm.apis.push({
          res: marked(item.res),
          url: item.url,
          method: item.method
        });
      });

      $scope.$watch('vm.location.path()', function (path) {
        path = path || '/0';
        var index = Number(path.replace(/\//, ''));
        $('#code').html(vm.apis[index].res);
        $('#url').html(vm.apis[index].method + '   ' + vm.apis[index].url);
        vm.index = index;
        highlight();
      });

    });
  });

angular.bootstrap(document, ['app']);

// //////////////////////////////////////////
function highlight() {
  $('pre code').each(function (i, block) {
    hljs.highlightBlock(block);
  });
}
