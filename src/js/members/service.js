'use strict';

angular.module('app.members.Service', [])
  .factory('MemberService', ($http) => {
    return {
      search(cid) {
        return $http.post('/patient/search', { cid: cid });
      },
      save(member) {
        return $http.post('/members', { member: member });
      },
      update(member) {
        return $http.put('/members', { member: member });
      },

      list(limit, offset) {
        return $http.post('/members/list', { limit: limit, offset: offset });
      },

      total() {
        return $http.post('/members/total');
      },

      detail(memberId) {
        return $http.get('/members/' + memberId);
      },

      changePassword(memberId, password) {
        return $http.put('/members/changepass', { memberId: memberId, password: password });
      },

      searchMember(query) {
        return $http.post('/members/search', { query: query });
      },


    }
  });