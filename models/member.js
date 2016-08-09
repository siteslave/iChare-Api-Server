'use strict';

module.exports = {
  save(db, member) {
    return db('members')
      .insert(member)
      .returning('member_id');
  },

  savePatient(db, data) {
    return db('member_patients')
      .insert(data);
  },

  removePatient(db, memberId) {
    return db('member_patients')
      .where('member_id', memberId)
      .del();
  },

  savePatientImage(db, memberId, hn, image) {
    return db('member_patients')
      .where('member_id', memberId)
      .where('patient_hn', hn)
      .update({ image: image });
  },

  list(db, limit, offset) {
    return db('members as m')
      .select('m.member_id', 'm.register_date', 'm.first_name', 'm.last_name', 't.name as title_name', 'm.username',
      'm.birthdate', 'm.sex', 'm.telephone', 'm.cid', 'm.email', 'm.active_status', 'm.created_at', 'm.last_login')
      .leftJoin('titles as t', 't.id', 'm.title_id')
      .limit(limit)
      .offset(offset);
  },

  total(db) {
    return db('members')
      .count('* as total');
  },

  isMemberExist(db, cid) {
    return db('members')
      .count('* as total')
      .where('cid', cid);
  },

  update(db, memberId, member) {
    return db('members')
      .where('member_id', memberId)
      .update(member);
  },

  detail(db, memberId) {
    return db('members')
      .select('member_id', 'cid', 'active_status', 'title_id', 'birthdate', 'sex', 'register_date',
      'first_name', 'last_name', 'last_login', 'telephone', 'email')
      .where('member_id', memberId)
      .limit(1);
  },

  getPatients(db, memberId) {
    return db('member_patients')
      .select()
      .where('member_id', memberId);
  },

  changePassword(db, memberId, password) {
    return db('members')
      .where('member_id', memberId)
      .update({ password: password });
  },

  searchByCid(db, cid) {
    return db('members as m')
      .select('m.member_id', 'm.register_date', 'm.first_name', 'm.last_name', 't.name as title_name', 'm.username',
      'm.birthdate', 'm.sex', 'm.telephone', 'm.cid', 'm.email', 'm.active_status', 'm.created_at', 'm.last_login')
      .leftJoin('titles as t', 't.id', 'm.title_id')
      .where('m.cid', cid)
      .limit(20);
  },

  searchByFirstName(db, query) {
    let _query = `%${query}%`;

    return db('members as m')
      .select('m.member_id', 'm.register_date', 'm.first_name', 'm.last_name', 't.name as title_name', 'm.username',
      'm.birthdate', 'm.sex', 'm.telephone', 'm.cid', 'm.email', 'm.active_status', 'm.created_at', 'm.last_login')
      .leftJoin('titles as t', 't.id', 'm.title_id')
      .where('m.first_name', 'like', _query)
      .limit(20);
  },

  setActive(db, memberId, status) {
    return db('members')
      .where('member_id', memberId)
      .update({ active_status: status });
  },

  checkAuth(db, username, password) {
    return db('members')
      .where({
        username: username,
        password: password
      })
      .limit(1);
  },

  getAllPatientsHn(db) {
    return db('member_patients')
      .distinct('patient_hn');
  },
  /*****************************************************
   * API Service
   *****************************************************/

  getPatientsHn(db, memberId) {
    return db('member_patients')
      .distinct('patient_hn', 'hash_key')
      .where('member_id', memberId);
  },

  getPatientMemberList(db, memberId) {
    return db('member_patients')
      .select('hash_key', 'ptname', 'image', 'is_default',
      db.raw('timestampdiff(year, birth, current_date()) as age'))
      .where('member_id', memberId);
  },

  setDefault(db, memberId, hashKey) {
    return db('member_patients')
      .where('member_id', memberId)
      .where('hash_key', hashKey)
      .update({ is_default: 'Y' });
  },

  clearDefault(db, memberId) {
    return db('member_patients')
      .where('member_id', memberId)
      .update({ is_default: 'N' });
  },

  savePhoto(db, memberId, hashKey, image) {
    return db('member_patients')
      .where('member_id', memberId)
      .where('hash_key', hashKey)
      .update({ image: image });
  },

  saveDeviceToken(db, memberId, deviceToken) {
    return db('members')
      .where('member_id', memberId)
      .update({ device_token: deviceToken });
  },

  getDefaultPatient(db, memberId) {
    return db('member_patients')
      .select('patient_hn')
      .where('member_id', memberId)
      .where('is_default', 'Y')
      .limit(1);
  },

  getPatientHnFromHashKey(db, hashKey) {
    return db('member_patients')
      .select('patient_hn')
      .where('hash_key', hashKey)
      .limit(1);
  },

  toggleAlertService(db, memberId, status) {
    return db('members')
      .where('member_id', memberId)
      .update({alert_service: status});
  },

  toggleAlertAppoint(db, memberId, status) {
    return db('members')
      .where('member_id', memberId)
      .update({alert_appoint: status});
  },

  toggleAlertNews(db, memberId, status) {
    return db('members')
      .where('member_id', memberId)
      .update({alert_news: status});
  },

  getAlertSetting(db, memberId) {
    return db('members')
      .select('alert_news', 'alert_appoint', 'alert_service')
      .where('member_id', memberId)
      .limit(1);
  },

  getDeviceTokenAlertAppointment(db, hns) {
    return db('member_patients as mp')
      .select('m.device_token')
      .whereIn('mp.patient_hn', hns)
      .where('m.alert_appoint', 'Y')
      .innerJoin('members as m', 'm.member_id', 'mp.member_id');
  },

  getDeviceTokenAlertService(db, hns) {
    return db('member_patients as mp')
      .select('m.device_token')
      .whereIn('mp.patient_hn', hns)
      .where('m.alert_service', 'Y')
      .innerJoin('members as m', 'm.member_id', 'mp.member_id');
  }
};