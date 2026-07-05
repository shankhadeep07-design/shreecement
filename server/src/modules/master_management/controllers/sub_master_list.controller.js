var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const { generateSlug } = require("../../../utils/slugify");
const SubMasterListModel = require("../../../models/master_management/subMasterList.model");
const MasterListModel = require("../../../models/master_management/masterlist.model");


module.exports.fetch_sub_master_list_datatable = async (req, res, next) => {
  let tsml_tml_id = req?.params?.id;
  try {
    var sql = `SELECT * FROM t_sub_master_list`;

    const where = `t_sub_master_list.tsml_tml_id = $tsml_tml_id `;
    let replacements = {};
    if (tsml_tml_id) {
      replacements.tsml_tml_id = tsml_tml_id;
    }

    var records = await Datatables.build(req, sql, where, replacements);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createSubMasterList = async function (req, res, next) {
  try {
    let userId = req?.body?.payload?.id;
    const id = req?.params?.id;
    const {
      tsml_sub_master_list_name,
      tsml_sub_master_list_desc,
      tsml_tml_id,
    } = req?.body;

    if (
      !tsml_sub_master_list_name ||
      !tsml_sub_master_list_desc ||
      !tsml_tml_id ||
      !userId
    ) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }

    const MasterList = await MasterListModel.findOne({
      where: {
        tml_id: {
          [Op.iLike]: tsml_tml_id,
        },
      },
    });

    let Master_slug = '';
    if (MasterList) {
      Master_slug = MasterList.tml_master_list_slug;
    }

    if (id) {
      const existingMasterList = await SubMasterListModel.findOne({
        where: { tsml_id: id },
      });

      if (!existingMasterList) {
        return next(
          CustomErrorHandler.validationError("No Sub Master List found.")
        );
      }

      // Check for duplicate vertical name
      const duplicateVertical = await SubMasterListModel.findOne({
        where: {
          tsml_sub_master_list_name: {
            [Op.iLike]: tsml_sub_master_list_name,
          },
          tsml_tml_id: tsml_tml_id,
        },
      });

      if (duplicateVertical && duplicateVertical.tsml_id !== id) {
        return res.status(409).json({
          status: false,
          message: "Sub Master List name already exists",
        });
      }

      await SubMasterListModel.update(
        {
          tsml_sub_master_list_name,
          tsml_updated_by: userId,
          tsml_master_slug: Master_slug,
          tsml_sub_master_list_desc,
          tsml_tml_id,
          tsml_sub_master_list_slug: generateSlug(tsml_sub_master_list_name),
        },
        { where: { tsml_id: id } }
      );

      return res.json({
        status: 1,
        message: "Sub Master List updated successfully.",
      });
    } else {
      // Check for duplicate entry
      const existingMasterList = await SubMasterListModel.findOne({
        where: {
          tsml_sub_master_list_name: {
            [Op.iLike]: tsml_sub_master_list_name,
          },
          tsml_tml_id: tsml_tml_id,
        },
      });

      if (existingMasterList) {
        return res.status(409).json({
          status: false,
          message: "Sub Master List name already exists",
        });
      }

      const newMasterList = await SubMasterListModel.create({
        tsml_sub_master_list_name,
        tsml_created_by: userId,
        tsml_updated_by: userId,
        tsml_master_slug: Master_slug,
        tsml_sub_master_list_desc,
        tsml_tml_id,
        tsml_sub_master_list_slug: generateSlug(tsml_sub_master_list_name),
        // tsml_created_at and tsml_updated_at are handled by DB defaults
      });

      return res.json({
        status: 1,
        message: "Sub Master List created successfully.",
        data: newMasterList,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.subMasterListByMasterSlug = async (req, res, next) => {

  let { master_slug } = req?.body;
  try {
    var sql = `SELECT * FROM t_sub_master_list join t_master_list on t_master_list.tml_id = t_sub_master_list.tsml_tml_id where t_master_list.tml_master_list_slug = '${master_slug}'`;

    var records = await sequelize.query(sql, { type: QueryTypes.SELECT });

    return res.json({
      status: 1,
      message: "Sub Master List by Master Slug.",
      data: records,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }

};
