'use strict';

module.exports = {
  getScreening(db, hn) {
    let sql = `
    select hn,vstdate, bw, height, bpd, bps, pulse, bmi, waist
    from opdscreen
    where (bw>0 and height>0 and bpd>0 and bps>0 and pulse>0)
    and hn=?
    order by vstdate desc
    limit 1
    `;

    return db.raw(sql, [hn]);
  },

  getHISScreeningHistory(db, hn) {
    let sql = `
    select hn, vstdate, vsttime, bw, height, bpd, bps, pulse, bmi
    from opdscreen
    where (bw>0 and height>0 and bpd>0 and bps>0 and pulse>0)
    and hn=?
    order by vstdate desc
    limit 10
    `;

    return db.raw(sql, [hn]);
  },
  
  getHHCLastScreeningHistory(db, hn) {
    let sql = `
    select hn, date_serv as vstdate, time_serv as vsttime, sbp as bps, dbp as bpd, weight as bw, height,
    (weight/pow((height/100),2)) as bmi, pluse as pulse
    from hhc
    where hn=?
    order by date_serv desc
    limit 10
    `;

    return db.raw(sql, [hn])
  },
  
  getHHCLastScreening(db, hn) {
    let sql = `
    select hn, date_serv as vstdate, time_serv as vsttime, sbp as bps, dbp as bpd, weight as bw, height,
    (weight/pow((height/100),2)) as bmi, pluse as pulse
    from hhc
    where hn=?
    order by date_serv desc
    limit 1
    `;

    return db.raw(sql, [hn])
  }
}