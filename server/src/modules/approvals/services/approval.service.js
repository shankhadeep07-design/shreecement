const Datatables = require("../../../service/DatatableService");



module.exports.getApprovalPathDatatable = (req) => {


  var sql =`select *,t_approval_master_list.taml_approval_name,t_roles.trl_role_name ,
  t_sub_master_list.tsml_sub_master_list_name as tsml_sub_master_list_name
  from t_approval_channel
  
  LEFT JOIN users ON users.id = t_approval_channel.tac_created_by
  LEFT JOIN t_approval_master_list ON t_approval_master_list.taml_id = t_approval_channel.tac_approval_master_id
  LEFT JOIN t_roles ON t_roles.trl_role_id = t_approval_channel.tac_initiator_role_id
  LEFT JOIN t_sub_master_list ON t_sub_master_list.tsml_id = t_approval_channel.tac_bu_id
  `

  var where = " t_approval_channel.tac_fl_archive = 'N' ";
  return Datatables.build(req, sql, where);
};



