'use strict';

module.exports = {

    apiGetAppointment(db, hns) {
    // let sql = `
    // select a.oapp_id, a.hn,a.nextdate, a.nexttime, a.clinic, d.department,
    // c.name as clinic_name, concat(p.pname,p.fname, " ", p.lname) as ptname
    // from oapp as a
    // inner join patient as p on p.hn=a.hn
    // left join kskdepartment as d on d.depcode=a.depcode
    // left join clinic as c on c.clinic=a.clinic
    // where (a.patient_visit<>'Y' or a.patient_visit is null)
    // and a.hn=
    // order by a.nextdate desc
    // limit 5
    // `;
      
      return db('oapp as a')
        .select(
        'a.oapp_id', 'a.hn', 'a.nextdate', 'a.nexttime', 'a.clinic', 'd.department',
        'c.name as clinic_name', db.raw('concat(p.pname, p.fname, " ", p.lname) as ptname'))
        .innerJoin('patient as p', 'p.hn', 'a.hn')
        .leftJoin('kskdepartment as d', 'd.depcode', 'a.depcode')
        .leftJoin('clinic as c', 'c.clinic', 'a.clinic')
        .whereRaw('(a.patient_visit<>"Y" or a.patient_visit is null)')
        .whereIn('a.hn', hns)
        .orderBy('a.nextdate', 'desc')
        .limit(10);
      
    // return db.raw(sql, [hn]);
  },

    apiGetAppointmentDetail(db, id) {
    let sql = `
    select a.oapp_id, a.hn,a.nextdate, a.nexttime, a.clinic, d.department, a.contact_point,
    c.name as clinic_name, doc.name as doctor_name
    from oapp as a
    left join kskdepartment as d on d.depcode=a.depcode
    left join clinic as c on c.clinic=a.clinic
    left join doctor as doc on doc.code=a.doctor
    where a.oapp_id=?
    `;

    return db.raw(sql, [id]);
  },

  apiGetLastVisit(db, hns, startDate, endDate) {
    // let sql = `
    // select 
    // from ovst as o 
    // inner join patient as p on p.hn=o.hn
    // left join opdscreen as s on s.vn=o.vn
    // where o.hn in ('0016470', '0021347', '0039225')
    // and o.vstdate between ? and ?
    // order by o.vstdate desc
    // limit 10
    // `;

    return db('ovst as o')
      .select('o.hn', 'o.vn', 'o.vstdate', 'o.vsttime',
      db.raw('concat(p.pname, p.fname, " ", p.lname) as ptname'),
      's.cc', 's.bps', 's.bpd')
      .innerJoin('patient as p', 'p.hn', 'o.hn')
      .leftJoin('opdscreen as s', 's.vn', 'o.vn')
      .whereBetween('o.vstdate', [startDate, endDate])
      .whereIn('o.hn', hns)
      .orderBy('o.vstdate', 'desc');
  }

};
