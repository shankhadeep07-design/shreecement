const { Op } = require("sequelize");
const MasterListModel = require("../../../models/master_management/masterlist.model");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const Datatables = require("../../../service/DatatableService");
const { generateSlug } = require("../../../utils/slugify");



module.exports.fetch_master_list_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_master_list`;

    // var where = `t_master_list.tml_is_active = 'true' `;
        var where;


    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createMasterList = async function (req, res, next) {
  try {
    let userId = req?.body?.payload?.id;
    const id = req?.params?.id;
    const { tml_master_list_name, tml_master_list_desc } = req?.body;

    if (!tml_master_list_name || !tml_master_list_desc || !userId) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }

    if (id) {
      const existingMasterList = await MasterListModel.findOne({
        where: { tml_id: id },
      });

      if (!existingMasterList) {
        return next(
          CustomErrorHandler.validationError("No Master List found.")
        );
      }

      // Check for duplicate vertical name
      const duplicateVertical = await MasterListModel.findOne({
        where: {
          tml_master_list_name: {
            [Op.iLike]: tml_master_list_name,
          },
        },
      });

      if (duplicateVertical && duplicateVertical.tml_id !== id) {
        return res.status(409).json({
          status: false,
          message: "Master List name already exists",
        });
      }

      await MasterListModel.update(
        {
          tml_master_list_name,
          tml_updated_by: userId,
          tml_master_list_desc,
          tml_master_list_slug: generateSlug(tml_master_list_name),
        },
        { where: { tml_id: id } }
      );

      return res.json({
        status: 1,
        message: "Master List updated successfully.",
      });
    } else {
      // Check for duplicate entry
      const existingMasterList = await MasterListModel.findOne({
        where: {
          tml_master_list_name: {
            [Op.iLike]: tml_master_list_name,
          },
        },
      });

      if (existingMasterList) {
        return res.status(409).json({
          status: false,
          message: "Master List name already exists",
        });
      }

      const newMasterList = await MasterListModel.create({
        tml_master_list_name,
        tml_created_by: userId,
        tml_updated_by: userId,
        tml_master_list_desc,
        tml_master_list_slug: generateSlug(tml_master_list_name),
        // tml_created_at and tml_updated_at are handled by DB defaults
      });

      return res.json({
        status: 1,
        message: "Master List created successfully.",
        data: newMasterList,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};



