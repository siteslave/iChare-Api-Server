'use strict';

angular.module('app.members.Controller', [
  'app.utils.Baisc',
  'app.members.Service',
  'app.members.Dialogs'
])
  .controller('MemberCtrl', ($scope, $rootScope, $mdDialog, $mdToast, MemberService) => {

$scope.showLoading = false;
    $scope.showPaging = true;
    $scope.members = [];
    $scope.total = 0;

    $scope.query = {
      limit: 20,
      page: 1
    };

    $scope.onPaginate = (page, limit) => {
      let offset = (page - 1) * limit;
      $scope.getList(limit, offset);
    };

    $scope.getList = (limit, offset) => {
      $scope.members = [];
      $scope.showLoading = true;
      $scope.showPaging = true;
      MemberService.list(limit, offset)
        .then(res => {
          let data = res.data;

          if (data.ok) {
            let rows = data.rows;

            rows.forEach(v => {
              let obj = {};
              obj.fullname = `${v.title_name} ${v.first_name} ${v.last_name}`;
              obj.sex = v.sex == '1' ? 'ชาย' : 'หญิง';
              obj.birthdate = `${moment(v.birthdate).format('DD/MM')}/${moment(v.birthdate).get('year') + 543}`;
              obj.cid = v.cid;
              obj.email = v.email;
              obj.telephone = v.telephone;
              obj.activeStatus = v.active_status;
              obj.username = v.username;
              obj.memberId = v.member_id;
              $scope.members.push(obj);
            });

          } else {
            $mdToast.show(
              $mdToast.simple()
                .textContent('เกิดข้อผิดพลาด : ' + JSON.stringify(data.msg))
                .position('top right')
                .hideDelay(3000)
            );
          }

          $scope.showLoading = false;

        }, err => {
          $mdToast.show(
            $mdToast.simple()
              .textContent('การเชื่อมต่อผิดพลาด')
              .position('top right')
              .hideDelay(3000)
          );
        });
    };

    $scope.getTotal = () => {
      MemberService.total()
        .then(res => {
          let data = res.data;
          $scope.total = data.total;
        });
    };

    $scope.initialData = () => {

      let limit = $scope.query.limit;
      let offset = ($scope.query.page - 1) * $scope.query.limit;

      $scope.getTotal();
      $scope.getList(limit, offset);
    };

    $scope.register = (ev) => {
      $mdDialog.show({
        controller: 'MemberRegisterCtrl',
        templateUrl: '/dialogs/members/new',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      })
        .then(() => {
          $scope.initialData();
        }, () => {
          // cancel
        });
    };

    $scope.update = (ev, memberId) => {
      // console.log(memberId);

      MemberService.detail(memberId)
        .then(res => {
          let data = res.data;
          $rootScope.memberDetail = data.rows;
          $mdDialog.show({
            controller: 'MemberUpdateCtrl',
            templateUrl: '/dialogs/members/update',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false
          })
            .then(() => {
              if ($scope.searchQuery) {
                $scope.searchMember();
              } else {
                $scope.initialData();
              }
            }, () => {
              // cancel
            });

        });

    };

    $scope.changePassword = (ev, member) => {

      var confirm = $mdDialog.prompt()
        .title('คุณต้องการเปลี่ยนรหัสผ่าน ใช่หรือไม่?')
        .textContent('ระบุรหัสผ่านใหม่ที่ต้องการเปลี่ยนสำหรับ "' + member.fullname + '"')
        .placeholder('***')
        .ariaLabel('Changepass')
        // .initialValue('Buddy')
        .targetEvent(ev)
        .ok('เปลี่ยนรหัสผ่าน!')
        .cancel('ยกเลิก');

      $mdDialog.show(confirm).then((password) => {
        let newPassword = password;

        if (newPassword) {
          MemberService.changePassword(member.memberId, newPassword)
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

    $scope.enterSearch = (event) => {
      // console.log(event);
      if (event.charCode == 13) {
        $scope.search();
      }
    };
    $scope.search = () => {
      if ($scope.searchQuery) {
        $scope.showLoading = true;
        $scope.showPaging = false;
        MemberService.searchMember($scope.searchQuery)
          .then(res => {
            let data = res.data;
            $scope.members = [];

            if (data.ok) {
              let rows = data.rows;

              rows.forEach(v => {
                let obj = {};
                obj.fullname = `${v.title_name} ${v.first_name} ${v.last_name}`;
                obj.sex = v.sex == '1' ? 'ชาย' : 'หญิง';
                obj.birthdate = `${moment(v.birthdate).format('DD/MM')}/${moment(v.birthdate).get('year') + 543}`;
                obj.cid = v.cid;
                obj.email = v.email;
                obj.telephone = v.telephone;
                obj.activeStatus = v.active_status;
                obj.username = v.username;
                obj.memberId = v.member_id;
                $scope.members.push(obj);
              });

            } else {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('เกิดข้อผิดพลาด : ' + JSON.stringify(data.msg))
                  .position('top right')
                  .hideDelay(3000)
              );
            }

            $scope.showLoading = false;
          }, () => {
            $mdToast.show(
              $mdToast.simple()
                .textContent('การเชื่อมต่อผิดพลาด')
                .position('top right')
                .hideDelay(3000)
            );
          });
      }
    };

    $scope.toggleActive = (ev, member) => {

      var confirm = $mdDialog.confirm()
        .title('คุณต้องการเปลี่ยนสถานะ ใช่หรือไม่?')
        .textContent('ยืนยันการเปลี่ยนสถานะการใช้งานของ "' + member.fullname + '"')
        .ariaLabel('Changepass')
        // .initialValue('Buddy')
        .targetEvent(ev)
        .ok('เปลี่ยนสถานะ')
        .cancel('ยกเลิก');

      $mdDialog.show(confirm).then(() => {
        let status = null;
        if (member.activeStatus == 'Y') status = 'N';
        if (member.activeStatus == 'N') status = 'Y';

        let memberId = member.memberId;

        MemberService.toggleActive(memberId, status)
          .then(res => {
            let data = res.data;
            if (data.ok) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('เปลี่ยนสถานะเสร็จเรียบร้อยแล้ว')
                  .position('top right')
                  .hideDelay(3000)
              );

              $scope.initialData();

            } else {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('เกิดข้อผิดพลาด : ' + JSON.stringify(data.msg))
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
        });

    };

    $scope.hideSearch = () => {
      $scope.showSearch = !$scope.showSearch;
      $scope.initialData();
    }

    $scope.initialData();

  });