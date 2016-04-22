'use strict';

var $ = require('jquery');
var angular = require('angular');
var hljs = require('highlight.js');
var marked = require('marked');
require('angular-ui-router');
require('ngTreeView');

angular
  .module('app', ['ui.router', require('ngTreeView').name])
  .controller('AppController', function ($scope, $location, $http, $state) {
    var vm = this;
    var path = decodeURIComponent($location.search().path);
    var apis;

    $http.get('/_apis/all')
      .then(function (res) {
        var treeData = [];
        treeData.push(res.data.tree);
        vm.treeData = treeData;
        apis = res.data.apis;

        $scope.$broadcast('refreshSuccess', { path: path, apis: apis });
      })
      .catch(function (err) {
        throw new Error(err);
      });

    $scope.$on('selectNodeSuccess', function (e, node) {
      if (node.type === 'file') {
        $state.go('url', { path: encodeURIComponent(node.path) });
        $scope.$broadcast('selectMenuSuccess', { path: node.path, apis: apis });
      }
    });

  })
  .controller('ContentController', function ($scope, $timeout) {
    var vm = this;

    $scope.$on('selectMenuSuccess', function (e, data) {
      render(data.path, data.apis);
    });

    $scope.$on('refreshSuccess', function (e, data) {
      render(data.path, data.apis);
    });

    // //////////////////////////////////////////
    function render(path, apis) {
      var reg = /\.GET\.md$|\.DELETE\.md$|\.PUT\.md$|\.POST\.md$|\.PATCH\.md$/;
      var url = '/' + path.replace(reg, '');

      var data = apis.find(function (item) {
        return item.path.indexOf(path) > -1;
      });

      $timeout(function () {
        $('#code').html(marked(data.res));
        highlight();
      }, 100);

    }

    function highlight() {
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
      });
    }
  })
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/url');

    $stateProvider
      .state('url', {
        url: '/url?path',
        template: '<div class="code" id="code"></div>',
        controller: 'ContentController as vm',
      });
  });

angular.bootstrap(document, ['app']);
