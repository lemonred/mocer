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
    var apis;

    $http.get('/_apis/all')
      .then(function (res) {
        var treeData = [];
        treeData.push(res.data.tree);
        vm.treeData = treeData;
        apis = res.data.apis;

      });

    $scope.$on('selectNodeSuccess', function (e, node) {
      var reg = /\.GET\.md$|\.DELETE\.md$|\.PUT\.md$|\.POST\.md$|\.PATCH\.md$/;
      var url = '/' + node.path.replace(reg, '');
      var data = apis.find(function (item) {
        return item.url === url;
      });

      $('#code').html(marked(data.res));
      highlight();
    });

    // //////////////////////////////////////////
    function highlight() {
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
      });
    }
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
              <span ng-class="node.selected" ng-click="selectNode(node)">{{node.${nodeLabel}}}</span>
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

        // if node label clicks,
        scope.selectNode = function (node) {
          scope.$emit('selectNodeSuccess', node);
        };

        // Rendering template.
        element.html('').append($compile(template)(scope));

      }
    };
  }]);

angular.bootstrap(document, ['app']);
