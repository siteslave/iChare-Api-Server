'use strict'; 

angular.module('app.appoint.notify.Controller', ['app.appoint.notify.Service'])
  .controller('AppointNotifyCtrl', ($scope, $mdToast, AppointNotifyService) => {
    $scope.patients = [];
    $scope.start = new Date(moment().format());
    $scope.end = new Date(moment().add('5', 'days').format());
    $scope.isAll = false;

    $scope.selectedPatient = [];

    $scope.getList = () => {
      let start = moment($scope.start).format('YYYY-MM-DD');
      let end = moment($scope.end).format('YYYY-MM-DD');
      $scope.showLoading = true;

      AppointNotifyService.list(start, end)
        .then(res => {
          $scope.showLoading = false;
          let data = res.data;
          if (data.ok) {
            $scope.patients = [];

            data.rows.forEach(v => {
              let obj = {};
              obj.hn = v.hn;
              obj.ptname = v.ptname;
              obj.nextdate = `${moment(v.nextdate).format('D/M')}/${moment(v.nextdate).get('year') + 543}`;
              obj.nexttime = moment(v.nexttime, 'HH:mm:ss').format('HH:mm');
              obj.clinic_name = v.clinic_name;
              obj.department = v.department;
              $scope.patients.push(obj);
            });

            $mdToast.show(
              $mdToast.simple()
                .textContent('เรียบร้อย')
                .position('top right')
                .hideDelay(3000)
            );

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
    };

    $scope.toggleAll = () => {
      if (!$scope.isAll) {
        $scope.patients.forEach(v => {
          if ($scope.selectedPatient.indexOf(v.hn) == -1) {
            $scope.selectedPatient.push(v.hn);
          }
        })
      } else {
        $scope.selectedPatient = [];
      }
    };
    
    $scope.exists = (hn) => {
      return $scope.selectedPatient.indexOf(hn) > -1;
    };

    $scope.toggle = (hn) => {
      let idx = $scope.selectedPatient.indexOf(hn);
      if (idx > -1) {
        $scope.selectedPatient.splice(idx, 1);
      } else {
        $scope.selectedPatient.push(hn);
      }
    };

    $scope.sendNotification = () => {
      if ($scope.selectedPatient.length) {
        AppointNotifyService.send($scope.selectedPatient)
          .then(res => {
            let data = res.data;
            if (data.ok) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('ส่งเรียบร้อย')
                  .position('top right')
                  .hideDelay(3000)
              );
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
        
      }
      // alert(JSON.stringify($scope.selectedPatient));
    };

    $scope.getList();

  });