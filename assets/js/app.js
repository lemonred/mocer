'use strict';

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

    $scope.$on('selectMenuSuccess', function (e, data) {
      render(data.path, data.apis);
    });

    $scope.$on('refreshSuccess', function (e, data) {
      render(data.path, data.apis);
    });

    vm.edit = function () {
      console.log(vm.code);
    };

    // The ui-codemirror option
    $scope.cmOption = {
      lineWrapping: true,
      lineNumbers: true,
      indentWithTabs: true,

      // mode: {
      //   name: 'markdown',
      //   highlightFormatting: true
      // }
      //
      // mode: 'markdown'
      // mode: 'markdown'
      mode: 'xml'
    };

    setTimeout(() => {
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
      });
    }, 2000);

    // //////////////////////////////////////////
    function render(path, apis) {
      var reg = /\.GET\.md$|\.DELETE\.md$|\.PUT\.md$|\.POST\.md$|\.PATCH\.md$/;
      var url = '/' + path.replace(reg, '');

      var data = apis.find(function (item) {
        return item.path.indexOf(path) > -1;
      });

      // Initial code content...
      vm.code = data.res;
      vm.code = ';; Scheme code in here.\n' +
  '(define (double x)\n\t(* x x))\n\n\n' +
  '<!-- XML code in here. -->\n' +
  '<root>\n\t<foo>\n\t</foo>\n\t<bar/>\n</root>\n\n\n' +
  '// Javascript code in here.\n' +
  'function foo(msg) {\n\tvar r = Math.random();\n\treturn "" + r + " : " + msg;\n}';

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
    var template = `
      <div class="code" id="code"></div>

      <section>
        <textarea ui-codemirror="cmOption" ng-model="vm.code"></textarea>
      </section>

      <button class="btn btn-success" ng-click="vm.edit()">Edit</button>
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
