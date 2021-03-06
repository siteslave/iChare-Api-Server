'use strict'; 

angular.module('app.service.notify.Service', [])
  .factory('ServiceNotifyService', ($http) => {
    return {
      list(date) {
        return $http.post('/service-notify/list', { date: date });
      },
      send(hns) {
        return $http.post('/service-notify/send', { hns: hns });
      }
    }
  });