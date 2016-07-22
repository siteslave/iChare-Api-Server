'use strict';

module.exports = {
  doLogin(db, username, password) {
    return db('doctors')
      .where('username', username)
      .where('password', password)
      .limit(1);
  },

  getCommunityServiceType(db) {
    return db('ovst_community_service_type')
    .orderBy('ovst_community_service_type_name')
  }, 

  saveHhc(db, hhc) {
    return db('hhc')
      .insert(hhc);
  },

  checkHhcDuplicated(db, dateServ, communityServiceId) {
    return db('hhc')
      .count('* as total')
      .where({
        date_serv: dateServ,
        community_service_id: communityServiceId
      });
  }, 

  getHhcHistory(db, hn) {
    return db('hhc')
      .where('hn', hn)
      .orderByRaw('date_serv, time_serv desc');
  },

  getHhcDetail(db, id) {
    return db('hhc')
      .where('id', id);
  },
  
  updateHhc(db, id, data) {
    return db('hhc')
      .where('id', id)
      .update(data);
  },

  checkIsOwner(db, id, doctorId) {
    return db('hhc')
      .where('id', id)
      .where('doctor_id', doctorId)
      .count('* as total');
  },

  remove(db, id) {
    return db('hhc')
      .where('id', id)
      .del();
  },

  search(db, hashKey) {
    return db('member_patients')
      .select('patient_hn as hn', 'ptname', db.raw('timestampdiff(year, birth, current_date()) as age'))
      .where('hash_key', hashKey)
      .limit(1);
  }
}