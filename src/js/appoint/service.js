'use strict'; 

angular.module('app.appoint.Service', [])
  .factory('AppointService', ($http) => {
    return {
      list(start, end) {
        return $http.post('/appoint/list', { start: start, end: end });
      },
    }
  });