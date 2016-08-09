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
      .select('a.hn', 'a.nextdate', 'a.nexttime', db.raw('concat(p.pname, " ", p.fname, " ", p.lname) as ptname'), 'c.name as clinic_name', 'd.department', 'dt.name as doctor_name')
      .innerJoin('patient as p', 'p.hn', 'a.hn')
      .leftJoin('clinic as c', 'c.clinic', 'a.clinic')
      .leftJoin('kskdepartment as d', 'd.depcode', 'a.depcode')
      .leftJoin('doctor as dt', 'dt.code', 'a.doctor')
      .whereBetween('a.nextdate', [start, end])
      .whereIn('a.hn', hns)
      .whereRaw('(a.patient_visit<>"Y" or a.patient_visit is null)')
      .orderBy('a.nextdate', 'desc');
  },

  getVisitListByDate(db, hns, date) {
    /**
     *select o.hn, concat(p.pname, " ", p.fname, " ", p.lname) as ptname, o.vstdate, k.department,
d.icd10, icd.name
from ovst as o
inner join patient as p on p.hn=o.hn
left join kskdepartment as k on k.depcode=o.main_dep
left join ovstdiag as d on d.vn=o.vn and o.hn=d.hn
left join icd101 as icd on icd.code=d.icd10
where o.hn in ('0002335', '0043233', '0011349', '0016723', '0000054', '0000266')
and left(d.icd10, 1) not in ('1', '2', '3', '4', '5', '6', '7', '8', '9' ,'0')
and o.vstdate='2016-06-06'
limit 100
     */
    return db('ovst as o')
      .select('o.hn', db.raw('concat(p.pname, " ", p.fname, " ", p.lname) as ptname'),
      'o.vstdate', 'o.vsttime', 'k.department', 'd.icd10 as icd_code', 'icd.name as icd_name')
      .innerJoin('patient as p', 'p.hn', 'o.hn')
      .leftJoin('kskdepartment as k', 'k.depcode', 'o.main_dep')
      .leftJoin('ovstdiag as d', 'd.vn', 'o.vn')
      .leftJoin('icd101 as icd', 'icd.code', 'd.icd10')
      .whereIn('o.hn', hns)
      .whereRaw('left(d.icd10, 1) not in ("1", "2", "3", "4", "5", "6", "7", "8", "9" ,"0")')
      .where('o.vstdate', date)
      .groupByRaw('o.hn, o.vn')
      .limit(100);
  }
};