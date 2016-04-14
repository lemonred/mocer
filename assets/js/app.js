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

    vm.treedata = [
      {
        label: 'User',
        id: 'role1',
        children: [
          {
            label: 'subUser1',
            id: 'role11',
            children: []
          },
          {
            label: 'subUser2',
            id: 'role12',
            children: [
              {
                label: 'subUser2-1',
                id: 'role121',
                children: [
                  {
                    label: 'subUser2-1-1',
                    id: 'role1211',
                    children: []
                  },
                  {
                    label: 'subUser2-1-2',
                    id: 'role1212',
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: 'Admin',
        id: 'role2',
        children: []
      },
      {
        label: 'Guest',
        id: 'role3',
        children: []
      }
    ];

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
  })

  .directive('treeModel', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        // tree id
        var treeId = attrs.treeId;

        // tree model
        var treeModel = attrs.treeModel;

        // node id
        var nodeId = attrs.nodeId || 'id';

        // node label
        var nodeLabel = attrs.nodeLabel || 'label';

        // children
        var nodeChildren = attrs.nodeChildren || 'children';

        // tree template
        var template = `
          <ul>
            <li ng-repeat="node in ${treeModel}">
              <i class="expanded" ng-show="node.${nodeChildren}.length && !node.collapsed" ng-click="${treeId}.selectNodeHead(node)"></i>
              <i class="normal" ng-hide="node.${nodeChildren}.length"></i>
              <span ng-class="node.selected" ng-click="${treeId}.selectNodeLabel(node)">{{node.${nodeLabel}}}</span>
              <div
                tree-id="${treeId}"
                tree-model="node.${nodeChildren}"
                node-id="${nodeId}"
                node-label="${nodeLabel}"
                node-children="${nodeChildren}"
              ></div>
            </li>
          </ul>
        `;

        // check tree id, tree model
        if (!treeId && !treeModel) {
          return;
        }

        // Rendering template.
        element.html('').append($compile(template)(scope));

      }
    };
  }]);

angular.bootstrap(document, ['app']);

// //////////////////////////////////////////
function highlight() {
  $('pre code').each(function (i, block) {
    hljs.highlightBlock(block);
  });
}
