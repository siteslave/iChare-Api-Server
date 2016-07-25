'use strict';

module.exports = {
  getEGfr(db, hn) {
    let sql = `
    select o.vstdate, o.egfr
    from opdscreen as o
    where o.egfr > 0
    and o.hn='0024437'
    order by o.vstdate desc
    limit 5
    `;

    return db.raw(sql, []);
  },
  
  getFBS(db, hn) {
    let sql = `
    select o.vstdate, o.fbs
    from opdscreen as o
    where o.fbs > 0
    and o.hn='0007238'
    order by o.vstdate desc
    limit 5
    `;

    return db.raw(sql, []);
  },
  
  getTc(db, hn) {
    let sql = `
    select o.vstdate, o.tc
    from opdscreen as o
    where o.tc > 0
    and o.hn='0022536'
    order by o.vstdate desc
    limit 5
    `;

    return db.raw(sql, []);
  },

  getHdl(db, hn) {
    let sql = `
    select o.vstdate, o.hdl
    from opdscreen as o
    where o.hdl > 0
    and o.hn='0022536'
    order by o.vstdate desc
    limit 5
    `;

    return db.raw(sql, []);
  },

  getCreatinine(db, hn) {
    let sql = `
    select o.vstdate, o.creatinine
    from opdscreen as o
    where o.creatinine > 0
    and o.hn='0022536'
    order by o.vstdate desc
    limit 5
    `;

    return db.raw(sql, []);
  },

  getHbA1c(db, hn) {
    let sql = `
    select o.vstdate, o.hba1c
    from opdscreen as o
    where o.hba1c > 0
    and o.hn='0022536'
    order by o.vstdate desc
    limit 5
    `;

    return db.raw(sql, []);
  }
}