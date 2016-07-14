'use strict'; 

angular.module('app.appoint.notify.Service', [])
  .factory('AppointNotifyService', ($http) => {
    return {
      list(start, end) {
        return $http.post('/appoint-notify/list', { start: start, end: end });
      },
    }
  });