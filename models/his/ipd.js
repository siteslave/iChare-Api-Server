'use strict';

module.exports = {
  getHistory(db, hn) {
    let sql = `
    select i.an, i.dchdate, i.dchtime, i.prediag,
    i.regdate, i.regtime, ward.name as ward_name,
    pt.name as pttype_name
    from ipt as i
    left join ward on ward.ward=i.ward
    left join pttype as pt on pt.pttype=i.pttype
    where (i.dchdate is not null or i.dchdate <> '')
    and hn=?
    order by i.dchdate desc
    limit 10
    `;

    return db.raw(sql, [hn]);
  },
  
  getDetail(db, an) {
    let sql = `
    select i.an, i.dchdate, i.dchtime, i.prediag,
    i.regdate, i.regtime, ward.name as ward_name,
    pt.name as pttype_name, i.dchstts, dchs.name as dchstts_name, dcht.name as dchtype_name,
    icd.tname as diag_name
    from ipt as i
    left join ward on ward.ward=i.ward
    left join pttype as pt on pt.pttype=i.pttype
    left join dchstts as dchs on dchs.dchstts=i.dchstts
    left join dchtype as dcht on dcht.dchtype=i.dchtype
    left join iptdiag as iptdx on iptdx.an=i.an
    left join icd101 as icd on icd.code=iptdx.icd10
    where i.dchdate is not null
    and i.an=?
    and iptdx.diagtype='1'
    `;

    return db.raw(sql, [an]);
  },

  getDrugToHome(db, an) {
    let sql = `
    select i.qty, d.name as drug_name, d.units,
    du.name1, du.name2, du.name3
    from opitemrece as i
    left join drugitems as d on d.icode=i.icode
    left join drugusage as du on du.drugusage=i.drugusage
    where i.an=?
    and i.income='03'
    and i.item_type='H'
    order by d.name
    `;

    return db.raw(sql, [an]);
  }
}