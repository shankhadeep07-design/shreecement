var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const StateModel = require("../../../models/masters/state.model");
const DistrictModel = require("../../../models/masters/district.model");

const BlockModel = require("../../../models/masters/block.model");
const { Op, fn, col, where } = require("sequelize");
const FinancialYearModel = require("../../../models/masters/financial_year.model");
const LocationModel = require("../../../models/masters/location.model");

const FactoryMaster = require("../../../models/master_management/factory.model");
const ProfitCenterMaster = require("../../../models/master_management/profit_center.model");
const ProjectTypeModel = require("../../../models/masters/project_type.model");
const SubProjectTypeModel = require("../../../models/masters/sub_project_type.model");
const ScheduleSevenMaster = require("../../../models/priority_alignment/schedule_seven.model");
const SdgMasterModel = require("../../../models/priority_alignment/sdg.model");
const NationalIndicatorModel = require("../../../models/priority_alignment/national_indicator.model");
const MasterListModel = require("../../../models/master_management/masterlist.model");
const SubMasterListModel = require("../../../models/master_management/subMasterList.model");
const User = require("../../../models/users/user.model");
const ActivityMaster = require("../../../models/priority_alignment/activity.model");

const SubActivityMaster = require("../../../models/priority_alignment/sub_activity.model");
const ThemeManagement = require("../../../models/master_management/theme.model");
const RevenueVillageModel = require("../../../models/masters/revenue_village.model");
const UnitModel = require("../../../models/masters/unit.model");
const KpiMasterModel = require("../../../models/masters/kpi_master.model");
const VillagesModel = require("../../../models/masters/village.model");

const DistanceModel = require("../../../models/masters/distance.model");

const SubThemeManagement = require("../../../models/master_management/sub_theme.model");
const TypeOfBeneficiaryModel = require("../../../models/masters/type_of_beneficiary.model");
const KpiVariableMasterModel = require("../../../models/masters/kpi_variable_master.model");
const CategoryModel = require("../../../models/masters/category.model");
const GrampanchayatModel = require("../../../models/masters/grampanchayat.model");
const SubScheduleMaster = require("../../../models/priority_alignment/sub_schedule_master.model");

const KpiOutcomeMasterModel = require("../../../models/masters/kpi_out_come_master.model");

module.exports.getFinancialYears = async (req, res, next) => {
  try {
    // Fetch states
    const states = await FinancialYearModel.findAll({
      order: [["tfy_year_label", "DESC"]],
    });

    // Format response as label-value pairs
    const response = states.map((state) => ({
      value: state?.tfy_id,
      label: state?.tfy_year_label,
      tfy_current_year: state?.tfy_current_year,
    }));

    return res.status(200).json({
      status: true,
      message: "Financial Year fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.statusChange = async (req, res, next) => {
  const { table_name, primary_key, status } = req.body;

  if (!table_name || !primary_key || status === undefined) {
    return res.status(400).json({
      status: false,
      message: "Missing required parameters",
    });
  }

  try {
    let updateResult;

    switch (table_name) {
      case "t_state":
        updateResult = await StateModel.update(
          { tsl_is_active: status },
          { where: { tsl_state_id: primary_key } },
        );
        break;

      case "t_district":
        updateResult = await DistrictModel.update(
          { tdl_is_active: status },
          { where: { tdl_district_id: primary_key } },
        );
        break;
      case "t_revenue_village":
        updateResult = await RevenueVillageModel.update(
          { trevvlg_is_active: status },
          { where: { trevvlg_revenue_village_id: primary_key } },
        );
        break;
      case "t_unit":
        updateResult = await UnitModel.update(
          { tun_is_active: status },
          { where: { tun_id: primary_key } },
        );
        break;
      case "t_kpi_master":
        updateResult = await KpiMasterModel.update(
          { tkpi_is_active: status },
          { where: { tkpi_id: primary_key } },
        );
        break;
      case "t_sub_schedule_master":
        updateResult = await SubScheduleMaster.update(
          { tsubshcm_is_active: status },
          { where: { tsubshcm_sub_schedule_id: primary_key } },
        );
        break;

      //   case "t_block":
      // updateResult = await BlockModel.update(
      //   { tbl_is_active: status },
      //   {
      //     where: where(
      //       fn("LOWER", col("tbl_block_id")),
      //       fn("LOWER", primary_key)
      //     )
      //   }
      // );
      //       break;

      case "t_block":
        updateResult = await BlockModel.update(
          { tbl_is_active: status },
          { where: { tbl_block_id: primary_key } },
        );
        break;
      case "t_grampanchayat":
        updateResult = await GrampanchayatModel.update(
          { tgrm_is_active: status },
          { where: { tgrm_grampanchayat_id: primary_key } },
        );
        break;

      case "t_location":
        updateResult = await LocationModel.update(
          { tloc_is_active: status },
          { where: { tloc_location_id: primary_key } },
        );
        break;

      case "t_factory_master":
        updateResult = await FactoryMaster.update(
          { tfact_is_active: status },
          { where: { tfact_factory_id: primary_key } },
        );
        break;

      case "t_profit_center_master":
        updateResult = await ProfitCenterMaster.update(
          { tprofc_is_active: status },
          { where: { tprofc_id: primary_key } },
        );
        break;

      case "t_project_type":
        updateResult = await ProjectTypeModel.update(
          { tprj_is_active: status },
          { where: { tprj_id: primary_key } },
        );
        break;

      case "t_sub_project_type":
        updateResult = await SubProjectTypeModel.update(
          { tsprj_is_active: status },
          { where: { tsprj_id: primary_key } },
        );
        break;

      case "t_schedule_seven_master":
        updateResult = await ScheduleSevenMaster.update(
          { tschm_is_active: status },
          { where: { tschm_schedule_id: primary_key } },
        );
        break;
      case "t_sdgs":
        updateResult = await SdgMasterModel.update(
          { tsdg_is_active: status },
          { where: { tsdg_id: primary_key } },
        );
        break;
      case "t_national_indicator_master":
        updateResult = await NationalIndicatorModel.update(
          { tnif_is_active: status },
          { where: { tnif_id: primary_key } },
        );
        break;

      case "t_master_list":
        updateResult = await MasterListModel.update(
          { tml_is_active: status },
          { where: { tml_id: primary_key } },
        );
        break;

      case "t_sub_master_list":
        updateResult = await SubMasterListModel.update(
          { tsml_is_active: status },
          { where: { tsml_id: primary_key } },
        );
        break;

      case "t_activity_master":
        updateResult = await ActivityMaster.update(
          { tactm_is_active: status },
          { where: { tactm_activity_id: primary_key } },
        );
        break;

      case "t_sub_activity_master":
        updateResult = await SubActivityMaster.update(
          { tsactm_is_active: status },
          { where: { tsactm_sub_activity_id: primary_key } },
        );
        break;

      case "users": {
        // normalize status
        const normalizedStatus =
          status === 0 || status === "0" ? "inactive" : "active";

        updateResult = await User.update(
          { status: normalizedStatus },
          { where: { id: primary_key } },
        );
        break;
      }

      case "t_theme_master":
        updateResult = await ThemeManagement.update(
          { tthm_is_active: status },
          { where: { tthm_theme_id: primary_key } },
        );
        break;

      case "t_villages":
        updateResult = await VillagesModel.update(
          { tvl_is_active: status },
          { where: { tvl_village_id: primary_key } },
        );
        break;

      case "t_distance":
        updateResult = await DistanceModel.update(
          { tdis_is_active: status },
          { where: { tdis_distance_id: primary_key } },
        );
        break;

      case "t_sub_theme_master":
        updateResult = await SubThemeManagement.update(
          { tsthm_is_active: status },
          { where: { tsthm_sub_theme_id: primary_key } },
        );
        break;

      case "t_type_of_beneficiary":
        updateResult = await TypeOfBeneficiaryModel.update(
          { tben_is_active: status },
          { where: { tben_beneficiary_type_id: primary_key } },
        );
        break;

      case "t_kpi_variable_master":
        updateResult = await KpiVariableMasterModel.update(
          { tkpiv_is_active: status },
          { where: { tkpiv_id: primary_key } },
        );
        break;

      case "t_category":
        updateResult = await CategoryModel.update(
          { tcat_is_active: status },
          { where: { tcat_id: primary_key } },
        );
        break;

      case "t_kpi_outcome_master":
        updateResult = await KpiOutcomeMasterModel.update(
          { tkpio_is_active: status },
          { where: { tkpio_id: primary_key } },
        );
        break;

      default:
        return res.status(400).json({
          status: false,
          message: "Invalid table name",
        });
    }

    // Sequelize returns [affectedRows]
    if (updateResult[0] === 0) {
      return res.status(404).json({
        status: false,
        message: "Record not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Status updated successfully",
    });
  } catch (err) {
    console.error("Status change error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
