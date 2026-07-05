var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const { generateSlug } = require("../../../utils/slugify");
const CompanyModel = require("../../../models/masters/company.model");


module.exports.fetch_company_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_company`;

    var where = `t_company.tcom_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createCompany = async function (req, res, next) {
  try {
    let userId = req?.body?.payload?.id;
    const id = req?.params?.id;
    const { tcom_company_name } = req?.body;

    if (!tcom_company_name || !userId) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }

    if (id) {
      const existingVertical = await CompanyModel.findOne({
        where: { tcom_id: id },
      });

      if (!existingVertical) {
        return next(CustomErrorHandler.validationError("No Company found."));
      }

      // Check for duplicate company name
      const duplicateVertical = await CompanyModel.findOne({
        where: {
          tcom_company_name: {
            [Op.iLike]: tcom_company_name,
          },
        },
      });

      if (duplicateVertical && duplicateVertical.tcom_id !== id) {
        return res.status(409).json({
          status: false,
          message: "Company name already exists",
        });
      }

      await CompanyModel.update(
        {
          tcom_company_name,
          tcom_updated_by: userId,
          tcom_company_slug:generateSlug(tcom_company_name),
        },
        { where: { tcom_id: id } }
      );

      return res.json({
        status: 1,
        message: "Company updated successfully.",
      });

    } else {
      // Check for duplicate entry
      const existingVertical = await CompanyModel.findOne({
        where: {
          tcom_company_name: {
            [Op.iLike]: tcom_company_name,
          },
        },
      });

      if (existingVertical) {
        return res.status(409).json({
          status: false,
          message: "Company name already exists",
        });
      }

      const newVertical = await CompanyModel.create({
        tcom_company_name,
        tcom_created_by: userId,
        tcom_updated_by: userId,
        tcom_company_slug:generateSlug(tcom_company_name),
        // tcom_created_at and tcom_updated_at are handled by DB defaults
      });

      return res.json({
        status: 1,
        message: "Company created successfully.",
        data: newVertical,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getAllCompanyList = async (req, res, next) => {
  try {

    // Fetch companys
    const companys = await CompanyModel.findAll({
      order: [["tcom_company_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = companys.map((com) => ({
      value: com?.tcom_id,
      label: com?.tcom_company_name,
      slug: com?.tcom_company_slug,
    }));

   
    

    return res.status(200).json({
      status: true,
      message: "Company fetched successfully",
      data: response,
    });
  } catch (err) {    
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportCompanyList = async (req, res, next) => {
  try {
    var sql = `select * from t_company`;
    var where = `t_company.tcom_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
     next(CustomErrorHandler.internalServerError(err.message));
  }
};