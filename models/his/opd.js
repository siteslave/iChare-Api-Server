'use strict';

module.exports = {
  getService(db, hn) {
    let sql = `
    select o.hn,o.vn, o.vstdate, o.vsttime, sp.name as spclty_name, k.department,
    s.cc
    from ovst as o
    left join spclty as sp on sp.spclty=o.spclty
    left join kskdepartment as k on k.depcode=o.main_dep
    left join opdscreen as s on s.vn=o.vn
    where o.hn=?
    order by o.vn desc
    limit 10
    `;

    return db.raw(sql, [hn]);
  },

  getScreening(db, vn) {
    let sql = `
      select o.hn,o.vn, o.vstdate, o.vsttime, sp.name as spclty_name, k.department,
      s.cc, s.height, s.bw, s.bmi, s.waist, s.bpd, s.bps, pt.name as pttype_name
      from ovst as o
      left join pttype as pt on pt.pttype=o.pttype
      left join spclty as sp on sp.spclty=o.spclty
      left join kskdepartment as k on k.depcode=o.main_dep
      left join opdscreen as s on s.vn=o.vn
      where o.vn=?
    `;

    return db.raw(sql, [vn]);
  },

  getDrug(db, vn) {
    let sql = `
      select i.qty, d.name as drug_name, d.units,
      du.name1, du.name2, du.name3
      from opitemrece as i
      left join drugitems as d on d.icode=i.icode
      left join drugusage as du on du.drugusage=i.drugusage
      where i.vn=?
      and i.income='03'
      order by d.name
    `;

    return db.raw(sql, [vn]);
  },

  getDiag(db, vn) {
    let sql = `
      select od.diagtype, od.icd10, icd.tname, icd.name as diag_name
      from ovstdiag as od
      left join icd101 as icd on icd.code=od.icd10
      where od.vn=?
      and left(od.icd10, 1) not in ('1', '2', '3', '4', '5', '6', '7', '8', '9', '0') 
      order by od.diagtype asc
    `;

    return db.raw(sql, [vn]);
  }
}