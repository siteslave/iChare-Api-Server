'use strict';

module.exports = {
  getFootHistory(db, hn) {
    let sql = `
    select ccs.hn, ccs.screen_date, ccs.screen_time, ccs.do_eye_screen, ccs.do_foot_screen,
    ccs.has_foot_cormobidity, ccs.has_eye_cormobidity, ccs.do_foot_advice,
    dfsrr.dmht_foot_screen_result_name as foot_right_result, 
    dfsrl.dmht_foot_screen_result_name as foot_left_result
    from clinicmember_cormobidity_screen as ccs

    left join clinicmember_cormobidity_foot_screen as ccf on ccf.clinicmember_cormobidity_screen_id=ccs.clinicmember_cormobidity_screen_id
    left join dmht_foot_screen_result as dfsrr on dfsrr.dmht_foot_screen_result_id=ccf.dmht_foot_screen_result_right_id
    left join dmht_foot_screen_result as dfsrl on dfsrl.dmht_foot_screen_result_id=ccf.dmht_foot_screen_result_left_id

    where ccs.hn=?
    group by ccs.hn, ccs.screen_date, ccs.screen_time
    order by ccs.screen_date desc
    limit 1
    `;

    return db.raw(sql, [hn]);
  },

  getEyeHistory(db, hn) {
    let sql = `
      select ccs.hn, ccs.screen_date, ccs.screen_time, ccs.do_eye_screen, ccs.do_foot_screen,
      ccs.has_foot_cormobidity, ccs.has_eye_cormobidity, ccs.do_foot_advice,
      desrr.dmht_eye_screen_result_name as eye_right_result,
      desrl.dmht_eye_screen_result_name as eye_left_result

      from clinicmember_cormobidity_screen as ccs

      left join clinicmember_cormobidity_eye_screen as cce on cce.clinicmember_cormobidity_screen_id=ccs.clinicmember_cormobidity_screen_id
      left join dmht_eye_screen_result as desrr on desrr.dmht_eye_screen_result_id=cce.dmht_eye_screen_result_right_id
      left join dmht_eye_screen_result as desrl on desrr.dmht_eye_screen_result_id=cce.dmht_eye_screen_result_left_id 

      where ccs.hn=?
      group by ccs.hn, ccs.screen_date, ccs.screen_time
      order by ccs.screen_date desc
      limit 1
    `;

    return db.raw(sql, [hn]);
  }
}