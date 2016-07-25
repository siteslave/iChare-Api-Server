'use strict';

module.exports = {
  getHistory(db, hn) {
    let sql = `
    select ov.hn, ov.vstdate, ov.vsttime, o.vn, pv.vaccine_name, pv.vaccine_code
    from ovst_vaccine as o
    inner join ovst as ov on ov.vn=o.vn
    left join person_vaccine as pv on pv.person_vaccine_id=o.person_vaccine_id
    where ov.hn=?
    order by o.vn desc
    limit 10
    `;

    return db.raw(sql, [hn]);
  }
}