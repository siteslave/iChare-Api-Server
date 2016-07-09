'use stirct';

angular.module('app.utils.Baisc', [])
  .factory('Basic', ($http) => {
    return {
      getTitle() {
        return $http.get('/basic/title')
      },
      getSex() {
        return $http.get('/basic/sex')
      }
    }
  });