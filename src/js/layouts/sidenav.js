'use strict';

angular.module('app.layouts.SideNav', ['app.layouts.Service'])
  .controller('SideNavCtrl', ($scope, $mdSidenav, $mdDialog, $mdToast, $state, LayoutService) => {

  $scope.toggleSidenav = function (menuId) {
    $mdSidenav(menuId).toggle();
  };

  $scope.go = (state) => {
    $state.go(state);
  };


$scope.changePassword = (ev) => {

      var confirm = $mdDialog.prompt()
        .title('คุณต้องการเปลี่ยนรหัสผ่าน ใช่หรือไม่?')
        .textContent('ระบุรหัสผ่านใหม่ที่ต้องการเปลี่ยน')
        .placeholder('***')
        .ariaLabel('Changepass')
        // .initialValue('Buddy')
        .targetEvent(ev)
        .ok('เปลี่ยนรหัสผ่าน!')
        .cancel('ยกเลิก');

      $mdDialog.show(confirm).then(password => {
        if (password) {
          LayoutService.changePassword(password)
            .then(res => {
              let data = res.data;
              if (data.ok) {
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('เปลี่ยนรหัสผ่านเสร็จเรียบร้อยแล้ว')
                    .position('top right')
                    .hideDelay(3000)
                );
              } else {
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('ไม่สามารถเปลี่ยนรหัสผ่านได้ : ' + JSON.stringify(data.msg))
                    .position('top right')
                    .hideDelay(3000)
                );
              }
            }, () => {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('การเชื่อมต่อผิดพลาด')
                  .position('top right')
                  .hideDelay(3000)
              );
            });
        }
      }, function () {
        // no action
      });
    };


  });