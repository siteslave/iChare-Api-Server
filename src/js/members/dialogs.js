angular.module('app.members.Dialogs', [])
  .controller('MemberRegisterCtrl', ($scope, $mdDialog, $mdToast, Basic, MemberService) => {

    $scope.member = {};
    $scope.patient = [];
    $scope.selectedPatient = [];

    // get title
    Basic.getTitle()
      .then(res => {
        let data = res.data;
        $scope.titles = data.rows;
      }, err => {
        console.log(err);
      });

    Basic.getSex()
      .then(res => {
        let data = res.data;
        $scope.sexes = data.rows;
      }, err => {
        console.log(err);
      });

    $scope.cancel = () => {
      $mdDialog.hide();
    }

    $scope.save = () => {

      let data = {};
      data.titleId = $scope.member.titleId;
      data.firstName = $scope.member.firstName;
      data.lastName = $scope.member.lastName;
      data.birthDate = moment($scope.member.birthDate).format('YYYY-MM-DD');
      data.registerDate = moment($scope.member.registerDate).format('YYYY-MM-DD');
      data.sex = $scope.member.sex;
      data.cid = $scope.member.cid;
      data.telephone = $scope.member.telephone;
      data.email = $scope.member.email;
      data.username = $scope.member.username;
      data.password = $scope.member.password;
      data.activeStatus = $scope.member.activeStatus ? 'Y' : 'N';
      data.expireDate = $scope.member.expiredDate ? moment($scope.member.expiredDate).add(1, 'years').format('YYYY-MM-DD') : moment().add(1, 'years').format('YYYY-MM-DD');
      data.patients = [];

      $scope.selectedPatient.forEach(v => {
        data.patients.push(v.hn);
      });

      if (data.firstName && data.lastName && data.birthDate && data.cid) {
        MemberService.save(data)
          .then(res => {
            let data = res.data;
            if (data.ok) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('ลงทะเบียนเสร็จเรียบร้อย')
                  .position('top right')
                  .hideDelay(3000)
              );
              $mdDialog.hide();
            } else {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('เกิดข้อผิดพลาด: ' + JSON.stringify(data.msg))
                  .position('top right')
                  .hideDelay(3000)
              );
            }
          });
      } else {
        $mdToast.show(
          $mdToast.simple()
            .textContent('ข้อมุลไม่สมบูรณ์ กรุณาตรวจสอบ')
            .position('top right')
            .hideDelay(3000)
        );
      }
    };

    $scope.search = (ev) => {
      $scope.showPaging = true;

      if (ev.charCode == 13) {
        if ($scope.query) {
          $scope.patient = [];

          MemberService.search($scope.query)
            .then(res => {
              let data = res.data;
              if (data.ok) {

                data.rows.forEach(v => {
                  let obj = {};
                  obj.ptname = v.ptname;
                  obj.birthday = `${moment(v.birthday).format('DD/MM')}/${moment(v.birthday).get('year') + 543}`;
                  obj.age = v.age;
                  obj.cid = v.cid;
                  obj.hn = v.hn;
                  obj.sex = v.sex;
                  obj.clinic_name = v.clinic_name;

                  $scope.patient.push(obj);
                });

                $scope.showPaging = false;
              } else {
                $scope.showPaging = false;
                console.log(data.code);
                console.log(data.msg);
              }
            }, err => {
              $scope.showPaging = false;
              // Connection error
            });
        }
      }
    };

    $scope.addPatient = (ev, patient) => {
      // console.log($scope.selectedPatient.length);

      if ($scope.selectedPatient.length <= 2) {
        let idx = _.findIndex($scope.selectedPatient, { hn: patient.hn });
        if (idx == -1) {
          $scope.selectedPatient.push(patient);
        }
      } else {
        $mdToast.show(
          $mdToast.simple()
            .textContent('ข้อมูลครบ 3 รายการแล้ว กรุณาลบรายการอื่นออก หากต้องการเพิ่มใหม่')
            .position('top right')
            .hideDelay(3000)
        );
      }

    };

    $scope.remove = (patient) => {
      let idx = _.findIndex($scope.selectedPatient, { hn: patient.hn });
      if (idx > -1) {
        $scope.selectedPatient.splice(idx, 1);
      }
    };


  })
  .controller('MemberUpdateCtrl', ($scope, $rootScope, $mdDialog, $mdToast, Basic, MemberService) => {
    $scope.patient = [];
    $scope.selectedPatient = [];
    $scope.data = {};

    $scope.data = $rootScope.memberDetail;
    // console.log($scope.member);
    let _member = $scope.data.detail;
    $scope.member = {};
    $scope.member.memberId = _member.member_id;
    $scope.member.birthDate = new Date(moment(_member.birthdate).format());
    $scope.member.registerDate = new Date(moment(_member.register_date).format());
    $scope.member.cid = _member.cid;
    $scope.member.titleId = _member.title_id;
    $scope.member.sex = _member.sex;
    $scope.member.firstName = _member.first_name;
    $scope.member.lastName = _member.last_name;
    $scope.member.telephone = _member.telephone;
    $scope.member.email = _member.email;
    $scope.member.activeStatus = _member.active_status == 'Y' ? true : false;

    $scope.selectedPatient = $scope.data.patients;
    // get title
    Basic.getTitle()
      .then(res => {
        let data = res.data;
        $scope.titles = data.rows;
      }, err => {
        console.log(err);
      });

    Basic.getSex()
      .then(res => {
        let data = res.data;
        $scope.sexes = data.rows;
      }, err => {
        console.log(err);
      });

    $scope.cancel = () => {
      $mdDialog.hide();
    }

    $scope.save = () => {

      let data = {};
      data.memberId = $scope.member.memberId;
      data.titleId = $scope.member.titleId;
      data.firstName = $scope.member.firstName;
      data.lastName = $scope.member.lastName;
      data.birthDate = moment($scope.member.birthDate).format('YYYY-MM-DD');
      data.registerDate = moment($scope.member.registerDate).format('YYYY-MM-DD');
      data.sex = $scope.member.sex;
      data.cid = $scope.member.cid;
      data.telephone = $scope.member.telephone;
      data.email = $scope.member.email;
      data.username = $scope.member.username;
      data.password = $scope.member.password;
      data.activeStatus = $scope.member.activeStatus ? 'Y' : 'N';
      data.expireDate = $scope.member.expiredDate ? moment($scope.member.expiredDate).add(1, 'years').format('YYYY-MM-DD') : moment().add(1, 'years').format('YYYY-MM-DD');
      data.patients = [];

      $scope.selectedPatient.forEach(v => {
        data.patients.push(v.hn);
      });

      if (data.firstName && data.lastName && data.birthDate && data.cid) {
        MemberService.update(data)
          .then(res => {
            let data = res.data;
            if (data.ok) {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('ลงทะเบียนเสร็จเรียบร้อย')
                  .position('top right')
                  .hideDelay(3000)
              );
              $mdDialog.hide();
            } else {
              $mdToast.show(
                $mdToast.simple()
                  .textContent('เกิดข้อผิดพลาด: ' + JSON.stringify(data.msg))
                  .position('top right')
                  .hideDelay(3000)
              );
            }
          });
      } else {
        $mdToast.show(
          $mdToast.simple()
            .textContent('ข้อมุลไม่สมบูรณ์ กรุณาตรวจสอบ')
            .position('top right')
            .hideDelay(3000)
        );
      }
    };

    $scope.search = (ev) => {
      $scope.showPaging = true;

      if (ev.charCode == 13) {
        if ($scope.query) {
          $scope.patient = [];

          MemberService.search($scope.query)
            .then(res => {
              let data = res.data;
              if (data.ok) {

                data.rows.forEach(v => {
                  let obj = {};
                  obj.ptname = v.ptname;
                  obj.birthday = `${moment(v.birthday).format('DD/MM')}/${moment(v.birthday).get('year') + 543}`;
                  obj.age = v.age;
                  obj.cid = v.cid;
                  obj.hn = v.hn;
                  obj.sex = v.sex;
                  obj.clinic_name = v.clinic_name;

                  $scope.patient.push(obj);
                });

                $scope.showPaging = false;
              } else {
                $scope.showPaging = false;
                console.log(data.code);
                console.log(data.msg);
              }
            }, err => {
              $scope.showPaging = false;
              // Connection error
            });
        }
      }
    };

    $scope.addPatient = (ev, patient) => {
      console.log($scope.selectedPatient.length);

      if ($scope.selectedPatient.length <= 2) {
        let idx = _.findIndex($scope.selectedPatient, { hn: patient.hn });
        if (idx == -1) {
          $scope.selectedPatient.push(patient);
        }
      } else {
        $mdToast.show(
          $mdToast.simple()
            .textContent('ข้อมูลครบ 3 รายการแล้ว กรุณาลบรายการอื่นออก หากต้องการเพิ่มใหม่')
            .position('top right')
            .hideDelay(3000)
        );
      }

    };

    $scope.remove = (patient) => {
      let idx = _.findIndex($scope.selectedPatient, { hn: patient.hn });
      if (idx > -1) {
        $scope.selectedPatient.splice(idx, 1);
      }
    };
  });