const TypeOfVillageModel = require("../../../models/masters/type_of_village.model");
var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
module.exports.getAllTypeOfVillageList = async (req, res, next) => {
  try {
    const typeOfVillage = await TypeOfVillageModel.findAll({
      where: {
        ttovill_is_active: true,
        ttovill_deleted_at: null,
      },
      attributes: ["ttovill_type_village_id", "ttovill_type_of_village"],
      order: [["ttovill_type_of_village", "ASC"]],
    });

    // Format response as label-value pairs
    const response = typeOfVillage.map((type) => ({
      value: type?.ttovill_type_village_id,
      label: type?.ttovill_type_of_village,
    }));

    return res.status(200).json({
      status: true,
      message: "Type of village list fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
