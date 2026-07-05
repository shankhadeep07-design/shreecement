var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");


module.exports.budget_transfer_Datatable = async (req, res, next) => {
  try {
   var sql = `
          select 
            master.*,
            tfin_year_label,
            details.from_budget_type,
            details.to_budget_type,
            details.tbad_amount,
            users.name
          from t_budget_transfer_master as master
          join t_financial_years on t_financial_years.tfin_id = master.tbtm_fy_id
          join (
            SELECT 
              tbad_transaction_id,
              MAX(tbad_budget_type) AS from_budget_type,
              MIN(tbad_budget_type) AS to_budget_type,
              tbad_amount
            FROM 
                t_budget_allo_deallocation
            GROUP BY 
                tbad_transaction_id,tbad_amount

          ) as details on master.tbtm_id = details.tbad_transaction_id
           LEFT JOIN users ON users.id = master.tbtm_created_by
      `;

    // let where = ` 1=1 `;

    var records = await Datatables.build(req, sql);

    res.json(records);
  } catch (err) {    
    next(CustomErrorHandler.internalServerError(err.message));
  }
};