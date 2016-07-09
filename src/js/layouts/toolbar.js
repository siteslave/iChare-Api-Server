'use strict';

angular.module('app.layouts.Toolbar', [])
  .controller('ToolbarCtrl', ($scope, $mdSidenav) => {
    $scope.toggleLeft = () => {
      $mdSidenav('left')
        .toggle();
    };

    $scope.openMenu = ($mdOpenMenu, ev) => {
      $mdOpenMenu(ev);
    };
  });