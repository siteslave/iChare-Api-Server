'use strict';

module.exports = {
  getCurrentPttype(db, hn) {
    let sql = `
    select p.*, pt.name as pttype_name, concat(hm.hosptype, hm.name) as hmain, concat(hs.hosptype, hs.name) as hsub
    from pttypeno as p
    left join pttype as pt on pt.pttype=p.pttype
    left join hospcode as hm on hm.hospcode=p.hospmain
    left join hospcode as hs on hs.hospcode=p.hospsub
    where p.hn=?
    limit 1
    `;

    return db.raw(sql, [hn]);
  },

  getHistory(db, hn) {
    let sql = `
    select o.vstdate, o.vsttime, pt.name as pttype_name
    from ovst as o
    left join pttype as pt on pt.pttype=o.pttype
    where o.hn=?
    order by o.vstdate desc
    limit 10
    `;

    return db.raw(sql, [hn]);
  }
}