'use strict';

module.exports = {
  getLastUsage(db, hn) {
    let sql = `
    select ccs.screen_date, ccs.screen_time,
    op.icode, d.name as drug_name, op.qty,
    ds.name1, ds.name2, ds.name3
    from clinicmember_cormobidity_screen as ccs
    left join opitemrece as op on op.vn=ccs.vn
    left join drugitems as d on d.icode=op.icode
    left join drugusage as ds on ds.drugusage=op.drugusage
    where op.income='03'
    and ccs.hn=?
    and ccs.vn = (SELECT max(vn) from clinicmember_cormobidity_screen where hn=ccs.hn)
    order by d.name
    `;

    return db.raw(sql, [hn]);
  }
}