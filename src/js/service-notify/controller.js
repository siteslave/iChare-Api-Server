'use strict'; 

angular.module('app.service.notify.Controller', ['app.service.notify.Service'])
  .controller('ServiceNotifyCtrl', ($scope, ServiceNotifyService) => {
    $scope.patients = [];
    $scope.date = new Date(moment().format());
    $scope.isAll = false;

    $scope.selectedPatient = [];

    $scope.getList = () => {
      let date = moment($scope.date).format('YYYY-MM-DD');
      $scope.showLoading = true;

      ServiceNotifyService.list(date)
        .then(res => {
          $scope.showLoading = false;
          let data = res.data;
          if (data.ok) {
            $scope.patients = [];

            data.rows.forEach(v => {
              let obj = {};
              obj.hn = v.hn;
              obj.ptname = v.ptname;
              obj.vstdate = `${moment(v.vstdate).format('D/M')}/${moment(v.vstdate).get('year') + 543}`;
              obj.vsttime = moment(v.vsttime, 'HH:mm:ss').format('HH:mm');
              obj.clinic_name = v.clinic_name;
              obj.department = v.department;
              obj.icd_code = v.icd_code;
              obj.icd_name = v.icd_name;
              $scope.patients.push(obj);
            });
          } else {
            // error
            alert(JSON.stringify(data.msg));
          }
          
        }, () => {
          alert('connection error!');
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
      alert(JSON.stringify($scope.selectedPatient));
    };

    $scope.getList();

  });