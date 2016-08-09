'use strict';

module.exports = {
  getAllergy(db, hn) {
    let sql = `
    select a.report_date, a.agent, a.symptom, ag.allergy_group_name, ar.result_name, ass.seiousness_name, arl.relation_name
    from opd_allergy as a
    left join allergy_group as ag on ag.allergy_group_id=a.allergy_group_id
    left join allergy_result as ar on ar.allergy_result_id=a.allergy_result_id
    left join allergy_seriousness as ass on ass.seriousness_id=a.seriousness_id
    left join allergy_relation as arl on arl.allergy_relation_id=a.allergy_relation_id
    where a.hn=?
    `;

    return db.raw(sql, [hn]);
  }
}