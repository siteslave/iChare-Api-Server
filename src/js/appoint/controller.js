'use strict'; 

angular.module('app.appoint.Controller', ['app.appoint.Service'])
  .controller('AppointCtrl', ($scope, AppointService) => {
    $scope.patients = [];
    $scope.start = new Date(moment().format());
    $scope.end = new Date(moment().add('5', 'days').format());
    
    $scope.getList = () => {
      let start = moment($scope.start).format('YYYY-MM-DD');
      let end = moment($scope.end).format('YYYY-MM-DD');

      AppointService.list(start, end)
        .then(res => {
          let data = res.data;
          if (data.ok) {
            $scope.patients = [];

            data.rows.forEach(v => {
              let obj = {};
              obj.ptname = v.ptname;
              obj.nextdate = `${moment(v.nextdate).format('D/M')}/${moment(v.nextdate).get('year') + 543}`;
              obj.nexttime = moment(v.nexttime, 'HH:mm:ss').format('HH:mm');
              obj.clinic_name = v.clinic_name;
              obj.department = v.department;
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

    $scope.getList();

  });