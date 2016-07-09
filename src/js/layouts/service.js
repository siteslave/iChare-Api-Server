'use strict';

angular.module('app.layouts.Service', [])
  .factory('LayoutService', ($http) => {
    return {
      changePassword(password) {
        return $http.post('/users/changepass', { password: password });
      }
    }
  });