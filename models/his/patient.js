'use strict';

module.exports = {
  search(db, cid) {
    let sql = `
    select p.hn, p.cid, p.sex, concat(p.pname, p.fname, ' ', p.lname) as ptname,
    p.birthday, timestampdiff(year, p.birthday, current_date()) as age,
    cm.clinic, group_concat(c.name SEPARATOR ',') as clinic_name
    from patient as p
    inner join clinicmember as cm on cm.hn=p.hn
    left join clinic as c on c.clinic=cm.clinic
    where p.cid=?
    group by p.hn
    limit 10`;

    return db.raw(sql, [cid])
  },

  getPatientMember(db, hns) {
    return db('patient')
      .select('hn', 'cid', 'sex', db.raw(`concat(pname, fname, ' ', lname) as ptname`),
      'birthday', db.raw('timestampdiff(year, birthday, current_date()) as age'))
      .whereIn('hn', hns);
  },

  getAppointment(db, hns, start, end) {
    return db('oapp as a')
      .select('a.nextdate', 'a.nexttime', db.raw('concat(p.pname, " ", p.fname, " ", p.lname) as ptname'), 'c.name as clinic_name', 'd.department', 'dt.name as doctor_name')
      .innerJoin('patient as p', 'p.hn', 'a.hn')
      .leftJoin('clinic as c', 'c.clinic', 'a.clinic')
      .leftJoin('kskdepartment as d', 'd.depcode', 'a.depcode')
      .leftJoin('doctor as dt', 'dt.code', 'a.doctor')
      .whereBetween('a.nextdate', [start, end])
      .whereIn('a.hn', hns)
      .whereRaw('(a.patient_visit<>"Y" or a.patient_visit is null)')
      .orderBy('a.nextdate', 'desc');
  } 
};