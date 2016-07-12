'use strict';

var hljs = require('highlight.js');
var showdown  = require('showdown');
var converter = new showdown.Converter();

var codeContent = '';

angular
  .module('app', ['ui.router', 'ui.codemirror', 'ngTreeView'])
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

        $scope.$broadcast('refreshSuccess', {
          path: path,
          apis: apis
        });
      })
      .catch(function (err) {
        throw new Error(err);
      });

    $scope.$on('selectNodeSuccess', function (e, node) {
      if (node.type === 'file') {
        $state.go('url', { path: encodeURIComponent(node.path) });
        $scope.$broadcast('selectMenuSuccess', {
          path: node.path,
          apis: apis
        });
      }
    });

  })
  .controller('ContentController', function ($scope, $timeout) {
    var vm = this;
    vm.editting = false;

    $scope.$on('selectMenuSuccess', function (e, data) {
      render(data.path, data.apis);
    });

    $scope.$on('refreshSuccess', function (e, data) {
      render(data.path, data.apis);
    });

    $scope.$watch('vm.codeContent', function () {

      $timeout(function () {
        $('#code').html(converter.makeHtml(vm.codeContent));
        highlight();
      }, 100);
    });

    vm.edit = function () {
      vm.codeContent = codeContent;
      vm.editting = true;
    };

    vm.save = function () {
      vm.editting = false;
    };


    // The ui-codemirror option
    $scope.cmOption = {
      lineWrapping: false,
      lineNumbers: false,
      indentWithTabs: true,
      mode: 'markdown'
    };

    // //////////////////////////////////////////
    function render(path, apis) {
      var reg = /\.GET\.md$|\.DELETE\.md$|\.PUT\.md$|\.POST\.md$|\.PATCH\.md$/;
      var url = '/' + path.replace(reg, '');

      var data = apis.find(function (item) {
        return item.path.indexOf(path) > -1;
      });

      // Initial code content...
      codeContent = data.res;

      $timeout(function () {
        $('#code').html(converter.makeHtml(data.res));
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
    var template = `
      <div class="clearfix workplace">
        <header>
          <h1>Mocer<span> - Setup mock server easy</span></h1>
          <button ng-if="!vm.editting" class="btn btn-default btn-edit" ng-click="vm.edit()">Edit</button>
          <button ng-if="vm.editting" class="btn btn-default btn-edit" ng-click="vm.save()">Save</button>
        </header>
        <section>
          <div ng-if="vm.editting" class="code-editor pull-left">
            <textarea ui-codemirror="cmOption" ng-model="vm.codeContent"></textarea>
          </div>
          <div class="code-preview pull-right" id="code" ng-class="{editting: vm.editting}">{{vm.codeContent}}</div>
        </section>
      </div>
    `;

    $urlRouterProvider.otherwise('/url');

    $stateProvider
      .state('url', {
        url: '/url?path',
        template: template,
        controller: 'ContentController as vm'
      });
  });

angular.bootstrap(document, ['app']);
