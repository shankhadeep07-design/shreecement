var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes, Sequelize } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProposalBudgetLocationModel = require("../../../models/proposal/proposal_budget_location.model");
const ProposalBudgetLocationDataModel = require("../../../models/proposal/proposal_budget_location_data.model");
const NotificationModel = require("../../../models/notification/notifications.model");
const ApprovalProcessTrackModel = require("../../../models/approval/ApprovalProcessTrackModel");
const { ApprovalPathList, generateTenDigitNumber, getUserByRoleId, notificationStatusChange } = require("../../../helpers/web.helper");
const { log } = require("handlebars");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const ProfitCenterMaster = require("../../../models/master_management/profit_center.model");

const FinancialYearModel = require("../../../models/masters/financial_year.model");
const DocumentModel = require("../../../models/documents/documents.model");
const { Op } = require("sequelize");

const StateModel = require("../../../models/masters/state.model");
const DistrictModel = require("../../../models/masters/district.model");
const BlockModel = require("../../../models/masters/block.model");
const LocationModel = require("../../../models/masters/location.model");

const ProjectsModel = require("../../../models/projects/projects.model");

const ProjectTypeModel = require("../../../models/masters/project_type.model");
const ThemeManagement = require("../../../models/master_management/theme.model");

const SubScheduleMaster = require("../../../models/priority_alignment/sub_schedule_master.model");


const ScheduleSevenMaster = require("../../../models/priority_alignment/schedule_seven.model");
const SdgMasterModel = require("../../../models/priority_alignment/sdg.model");
const SubProjectTypeModel = require("../../../models/masters/sub_project_type.model");

const { BudgetsModel } = require("../../../models/budget/budgets.model");



const ProposalAdditionalInformationModel = require("../../../models/proposal/proposal_additional_information.model");


const {
  BudgetMasterModel,
} = require("../../../models/budget/budget_master.model");

module.exports.getBudgetingAmountFetchByFocusAreaActivityId = async (
  req,
  res,
  next
) => {
  const {
    tpros_financial_year_id,
    tpros_schedule_seven_id,
    tpros_focus_area_id,
    tpros_activity_id,
  } = req?.body;

  try {
    var sql = `
          select  t_budgets.tbad_amount from t_budgets
           where tbad_fy_id = '${tpros_financial_year_id}'
          and tbad_sch_vii_id = '${tpros_schedule_seven_id}' 
           and tbad_focus_area_id = '${tpros_focus_area_id}'
            and tbad_activity_id = '${tpros_activity_id}' `;

    const data = await sequelize.query(sql, { type: QueryTypes.SELECT });

    return res.status(200).json({
      status: true,
      message: "Budget Amount fetched successfully",
      data: data,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};










const parseDate = (date) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}
module.exports.createOrUpdateProposal = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body || {};
    const files = req.files || [];
    const userId = req?.user?.[0]?.id || 0;


    let proposalId = formData?.tpros_id;



    if (!proposalId || proposalId === "undefined" || proposalId === "") {
      proposalId = null;
    }

    if (formData?.tpros_proposal_name) {
      const proposalName = formData.tpros_proposal_name.trim().toLowerCase();

      let whereClause = Sequelize.literal(
        `LOWER(tpros_proposal_name) = '${proposalName}'`
      );

      // while updating → ignore current record

      if (proposalId) {
        whereClause.tpros_id = { [Op.ne]: proposalId };
      }

      //     console.log('-------',whereClause);
      // return;

      const duplicate = await ProposalModel.findOne({
        where: whereClause,
        transaction,
      });

      // if (duplicate) {
      //   await transaction.rollback();
      //   return res.status(200).json({
      //     status: false,
      //     message: "Proposal name already exists. Please use a different name.",
      //   });
      // }

    }

    let total_budget_amount = 0;

    if (formData?.tpros_sub_district) {
      const findBudgetMaster = await BudgetMasterModel.findOne({
        where: {
          tbm_block_id: formData.tpros_sub_district,
        },
        attributes: ['tbm_id', 'tbm_total_budget_amount'], // 👈 add this
      });

      if (findBudgetMaster) {
        total_budget_amount = findBudgetMaster.tbm_total_budget_amount || 0;
      }


      const totalBudget = parseInt(total_budget_amount, 10) || 0;
      const proposalAmount = parseInt(formData.tpros_allocate_budget_for_approved_line_item, 10) || 0;

      if (totalBudget < proposalAmount) {
        return res.status(200).json({
          status: false,
          message: `Proposal Limit Exceeding. Proposal Max limit is Rs. ${totalBudget} For this Sub district anf FY`,
        });
      }

    }



    /* =====================================================
       BUILD COMMON DATA OBJECT (USED FOR CREATE & UPDATE)
    ===================================================== */


    const proposalData = {
      // ================= Basic =================
      tpros_proposal_name: formData?.tpros_proposal_name || null,
      tpros_financial_year_id: formData?.tpros_financial_year_id || null,
      tpros_current_date: parseDate(formData?.tpros_current_date),
      tpros_nature_of_the_project: formData?.tpros_nature_of_the_project || null,
      tpros_project_type: formData?.tpros_project_type || null,
      tpros_type_of_the_project: formData?.tpros_type_of_the_project || null,
      tpros_type_of_the_sub_project: formData?.tpros_type_of_the_sub_project || null,
      tpros_ngo_engagement: formData?.tpros_ngo_engagement || null,
      tpros_description: formData?.tpros_description || null,
      tpros_base_project_year: formData?.tpros_base_project_year || null,
      tpros_project_value: formData?.tpros_project_value || null,



      tpros_implementation_by: formData?.tpros_implementation_by || null,
      tpros_implementation_partner_name: formData?.tpros_implementation_partner_name || null,
      tpros_ngo_compliance_check: formData?.tpros_ngo_compliance_check || null,
      tpros_vendor_compliance_check: formData?.tpros_vendor_compliance_check || null,

      tpros_baseline_data_information: formData?.tpros_baseline_data_information || null,
      tpros_proposal_details: formData?.tpros_proposal_details || null,

      tpros_govt_scheme_linkage: formData?.tpros_govt_scheme_linkage || null,
      tpros_stakeholder_request_level: formData?.tpros_stakeholder_request_level || null,

      tpros_government_approval: formData?.tpros_government_approval || null,


      tpros_approval_order: formData?.tpros_approval_order || 0,
      tpros_approval_type: formData?.tpros_approval_type || null,






      // ================= Dates =================
      tpros_date_of_the_program: parseDate(formData?.tpros_date_of_the_program),
      tpros_start_date: parseDate(formData?.tpros_start_date),
      tpros_end_date: parseDate(formData?.tpros_end_date),
      tpros_frequency: formData?.tpros_frequency || null,

      // ================= Location =================
      tpros_state: formData?.tpros_state || null,
      tpros_district: formData?.tpros_district || null,
      tpros_sub_district: formData?.tpros_sub_district || null,
      tpros_location: formData?.tpros_location || null,
      tpros_gps_latitude: formData?.tpros_gps_latitude || null,
      tpros_gps_longitude: formData?.tpros_gps_longitude || null,

      // ================= Classification =================
      tpros_activity_id: formData?.tpros_activity_id || null,
      tpros_org_unit: formData?.tpros_org_unit || null,
      tpros_bu: formData?.tpros_bu || null,
      tpros_thematic_area: formData?.tpros_thematic_area || null,
      tpros_gl_code: formData?.tpros_gl_code || null,
      tpros_profit_center: formData?.tpros_profit_center || null,
      tpros_cost_center: formData?.tpros_cost_center || null,

      // ================= Flags =================
      tpros_is_aspirational_district: formData?.tpros_is_aspirational_district || false,
      tpros_is_gromor_village: formData?.tpros_is_gromor_village || false,
      tpros_schedule_seven: formData?.tpros_schedule_seven || false,
      tpros_sdg: formData?.tpros_sdg || null,

      // ================= Beneficiaries =================
      tpros_target_beneficiaries: formData?.tpros_target_beneficiaries || null,
      tpros_male_beneficiaries: formData?.male_beneficiaries || null,
      tpros_female_beneficiaries: formData?.female_beneficiaries || null,
      tpros_mix_group_beneficiaries: formData?.mix_group_beneficiaries || null,

      // ================= Budget =================
      tpros_approved_line_item: formData?.tpros_approved_line_item || null,
      tpros_allocate_budget_for_approved_line_item:
        formData?.tpros_allocate_budget_for_approved_line_item || null,
      tpros_utilized_till_date: formData?.tpros_utilized_till_date || null,
      tpros_project_budget: formData?.tpros_project_budget || null,

      // ================= Program =================
      tpros_program_background: formData?.tpros_program_background || null,
      tpros_program_objective: formData?.tpros_program_objective
        ? JSON.stringify(formData.tpros_program_objective)
        : null,
      tpros_activities_planned: formData?.tpros_activities_planned || null,
      tpros_expected_outcome: formData?.tpros_expected_outcome || null,
      tpros_project_uniqueness: formData?.tpros_project_uniqueness || null,
      tpros_branding_communication: formData?.tpros_branding_communication || null,
      tpros_monitoring_scope: formData?.tpros_monitoring_scope || null,
      tpros_budget_breakup: Number(formData?.tpros_budget_breakup || 0),

      // ================= Cost =================
      tpros_particular: formData?.tpros_particular || null,
      tpros_unit: formData?.tpros_unit || null,
      tpros_no_of_units: formData?.tpros_no_of_units || null,
      tpros_unit_cost: formData?.tpros_unit_cost || null,
      tpros_total_amount: formData?.tpros_total_amount || null,
      tpros_gst_amount: formData?.tpros_gst_amount || null,
      tpros_total_incl_gst: formData?.tpros_total_incl_gst || null,
      tpros_capex_cost: formData?.tpros_capex_cost || null,
      tpros_opex_cost: formData?.tpros_opex_cost || null,
      tpros_service_charges: formData?.tpros_service_charges || null,
      tpros_tax_details: formData?.tpros_tax_details || null,
      tpros_total_project_cost: formData?.tpros_total_project_cost || null,

      // ================= Vendor =================
      tpros_l1_party_budget: formData?.tpros_l1_party_budget || null,
      tpros_recommended_party: formData?.tpros_recommended_party || null,
      tpros_justification_other_than_l1:
        formData?.tpros_justification_other_than_l1 || null,
      tpros_single_party_justification:
        formData?.tpros_single_party_justification || null,
      tpros_remarks: formData?.tpros_remarks || null,
    };

    /* =====================================================
       UPDATE OR CREATE
    ===================================================== */
    if (proposalId) {
      const proposal = await ProposalModel.findByPk(proposalId, { transaction });
      if (!proposal) throw new Error("Proposal not found for update.");

      await proposal.update(
        {
          ...proposalData,
          tpros_updated_by: userId,
          tpros_updated_at: new Date(),
        },
        { transaction }
      );
    } else {
      const proposal = await ProposalModel.create(
        {
          ...proposalData,
          tpros_status: "draft",
          tpros_fl_archive: "N",
          tpros_created_by: userId,
          tpros_updated_by: userId,
        },
        { transaction }
      );

      proposalId = proposal.tpros_id;
    }


    console.log('-----------', formData?.budgetRows);

    // return;
    let budgetRows = [];

    if (formData?.budgetRows) {
      try {
        // case 1: already array (FormData sends multiple entries)
        if (Array.isArray(formData.budgetRows)) {
          budgetRows = formData.budgetRows
            .map(item => {
              // skip invalid "[object Object]"
              if (typeof item === "string") {
                try {
                  return JSON.parse(item);
                } catch {
                  return null;
                }
              }
              return item;
            })
            .filter(Boolean)  // remove nulls
            .flat();          // flatten if nested arrays
        }

        // case 2: single JSON string
        else if (typeof formData.budgetRows === "string") {
          budgetRows = JSON.parse(formData.budgetRows);
        }

        // case 3: already object
        else {
          budgetRows = formData.budgetRows;
        }

      } catch (err) {
        console.error("BudgetRows parse error:", err);
        budgetRows = [];
      }
    }


    if (proposalId) {
        await ProposalAdditionalInformationModel.destroy({
          where: { tpai_proposal_id: proposalId },
          transaction,
        });
      }

    if (budgetRows.length > 0) {
      // Delete existing rows if updating
      

      // Prepare new rows — use `budgetRows` here, not `formData.budgetRows`
      const addMoreRows = budgetRows
        .filter(row => row.tpros_particular && row.tpros_particular.trim() !== "")
        .map((row) => ({
          tpai_proposal_id: proposalId,
          tpai_particular: row.tpros_particular,
          tpai_unit: row.tpros_unit?.value || row.tpros_unit || null,
          tpai_no_of_unit: Number(row.tpros_no_of_units) || 0,
          tpai_unit_cost: Number(row.tpros_unit_cost) || 0,
          tpai_total: Number(row.tpros_total_amount) || 0,
          tpai_gst_percentage: Number(row.tpros_gst_amount) || 0,
          tpai_total_including_gst: Number(row.tpros_total_incl_gst) || 0,
          tpai_created_by: userId,
          tpai_updated_by: userId,
          tpai_created_at: new Date(),
          tpai_updated_at: new Date(),
        }));

      if (addMoreRows.length > 0) {
        await ProposalAdditionalInformationModel.bulkCreate(addMoreRows, { transaction });
      }
    }






    /* =====================================================
       FILE UPLOAD
    ===================================================== */
    if (files.length) {
      const groupedFiles = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      if (groupedFiles.tpros_attachment_documents?.length) {
        const { metadata } = await saveAndPrepareDocumentMetadata(
          groupedFiles.tpros_attachment_documents,
          proposalId,
          "uploads/proposal",
          userId,
          transaction
        );

        if (metadata?.length) {
          await DocumentModel.bulkCreate(metadata, { transaction });
        }
      }
    }

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: proposalId ? "Proposal saved successfully." : "Proposal created successfully.",
      data: { tpros_id: proposalId },
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Proposal Create/Update Error:", err);

    return next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      })
    );
  }
};





module.exports.proposal_list_datatable = async (req, res, next) => {
  try {


    const sql = `
      SELECT
        p.tpros_id,
        p.tpros_financial_year_id,
        fy.tfy_year_label,
        fy.tfy_year,
        p.tpros_proposal_name,
        p.tpros_status,
        p.tpros_created_at
      FROM t_proposal p
      LEFT JOIN t_financial_year fy
        ON fy.tfy_id = p.tpros_financial_year_id
    `;
    const records = await Datatables.build(req, sql);
    res.json(records);
  } catch (err) {
    console.log("err--------------- ", err);

    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.proposal_details_fun = async (req, res, next) => {
//   const { proposal_id } = req.body;
//   try {
//     var sql = `SELECT * FROM t_proposal p ;`
//     var data = await sequelize.query(sql, {
//       type: QueryTypes.SELECT,
//       replacements: { proposal_id }, // ✅ prevent SQL injection
//     });
//     res.json({
//       status: true,
//       message: "Proposal details fetched successfully.",
//       data: data || null, // return single object with tpros_id
//     });
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };






// module.exports.proposal_details_fun = async (req, res, next) => {
//   try {
//     const { proposal_id } = req.body;
//     const file_url = process.env.SERVER_FILE_URL;

//     if (!proposal_id) {
//       return res.status(400).json({
//         status: false,
//         message: "Proposal ID is required",
//       });
//     }

//     // ✅ Define association only if not already defined
//     if (!ProposalModel.associations?.financialYear) {
//       ProposalModel.belongsTo(FinancialYearModel, {
//         foreignKey: 'tpros_financial_year_id',
//         targetKey: 'tfy_id',
//         as: 'financialYear',
//       });
//     }

//     // 1️⃣ Fetch proposal with Financial Year JOIN
//     const proposal = await ProposalModel.findOne({
//       where: { tpros_id: proposal_id },
//       include: [
//         {
//           model: FinancialYearModel,
//           as: 'financialYear',
//           attributes: ['tfy_year_label'],
//         },
//       ],
//       raw: true,
//       nest: true,
//     });

//     if (!proposal) {
//       return res.json({
//         status: true,
//         message: "Proposal details fetched successfully.",
//         data: null,
//       });
//     }

//     // 2️⃣ Fetch documents linked with proposal
//     const documents = await DocumentModel.findAll({
//       where: {
//         final_doc_id: proposal_id,
//         fl_archive: "N",
//       },
//       attributes: [
//         "tdoc_id",
//         "doc_name",
//         "doc_ext",
//         "doc_original_path",
//         "doc_path",
//         "doc_type",
//         "sub_type",
//         "doc_title",
//         "doc_remarks",
//         "doc_purpose",
//         "doc_informations",
//         "draft_doc_id",
//         "final_doc_id",
//         "created_at",
//         "updated_at",
//         "deleted_at",
//         "created_by",
//         "updated_by",
//         "fl_archive",
//       ],
//       order: [["created_at", "ASC"]],
//       raw: true,
//     });

//     // 3️⃣ Append full_url
//     const documentsWithUrl = documents.map((doc) => ({
//       ...doc,
//       full_url: doc.doc_path ? `${file_url}${doc.doc_path}` : null,
//     }));

//     // 4️⃣ Final response
//     return res.json({
//       status: true,
//       message: "Proposal details fetched successfully.",
//       data: {
//         ...proposal,
//         tfy_year_label: proposal?.financialYear?.tfy_year_label || null,
//         documents: documentsWithUrl,
//       },
//     });
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };


// module.exports.proposal_details_fun = async (req, res, next) => {
//   try {
//     const { proposal_id } = req.body;
//     const file_url = process.env.SERVER_FILE_URL;

//     if (!proposal_id) {
//       return res.status(400).json({
//         status: false,
//         message: "Proposal ID is required",
//       });
//     }

//     // ===============================
//     // Define Associations (SAFE)
//     // ===============================



//     if (!ProposalModel.associations?.projectType) {
//       ProposalModel.belongsTo(ProjectTypeModel, {
//         foreignKey: 'tpros_type_of_the_project',
//         targetKey: 'tprj_id',
//         as: 'projectType',
//       });
//     }

//     if (!ProposalModel.associations?.subprojectType) {
//       ProposalModel.belongsTo(SubProjectTypeModel, {
//         foreignKey: 'tpros_type_of_the_sub_project',
//         targetKey: 'tsprj_id',
//         as: 'subprojectType',
//       });
//     }


//     if (!ProposalModel.associations?.sdg) {
//       ProposalModel.belongsTo(SdgMasterModel, {
//         foreignKey: 'tpros_sdg',
//         targetKey: 'tsdg_id',
//         as: 'sdg',
//       });
//     }




//     if (!ProposalModel.associations?.scheduleSeven) {
//       ProposalModel.belongsTo(ScheduleSevenMaster, {
//         foreignKey: 'tpros_schedule_seven',
//         targetKey: 'tschm_schedule_id',
//         as: 'scheduleSeven',
//       });
//     }


//     if (!ProposalModel.associations?.themeManagement) {
//       ProposalModel.belongsTo(SubScheduleMaster, {
//         foreignKey: 'tpros_thematic_area',
//         targetKey: 'tsubshcm_sub_schedule_id',
//         as: 'themeManagement',
//       });
//     }

//     if (!ProposalModel.associations?.financialYear) {
//       ProposalModel.belongsTo(FinancialYearModel, {
//         foreignKey: 'tpros_financial_year_id',
//         targetKey: 'tfy_id',
//         as: 'financialYear',
//       });
//     }

//     if (!ProposalModel.associations?.state) {
//       ProposalModel.belongsTo(StateModel, {
//         foreignKey: 'tpros_state',
//         targetKey: 'tsl_state_id',
//         as: 'state',
//       });
//     }

//     if (!ProposalModel.associations?.district) {
//       ProposalModel.belongsTo(DistrictModel, {
//         foreignKey: 'tpros_district',
//         targetKey: 'tdl_district_id',
//         as: 'district',
//       });
//     }

//     if (!ProposalModel.associations?.block) {
//       ProposalModel.belongsTo(BlockModel, {
//         foreignKey: 'tpros_sub_district',
//         targetKey: 'tbl_block_id',
//         as: 'block',
//       });
//     }

//     if (!ProposalModel.associations?.location) {
//       ProposalModel.belongsTo(LocationModel, {
//         foreignKey: 'tpros_location',
//         targetKey: 'tloc_location_id',
//         as: 'location',
//       });
//     }


//     // if (!ProposalModel.associations?.projectType) {
//     //   ProposalModel.belongsTo(ProjectTypeModel, {
//     //     foreignKey: 'tpros_type_of_the_project',   // ✅ correct FK
//     //     targetKey: 'tprj_id',
//     //     as: 'projectType',
//     //   });
//     // }


//     // ===============================
//     // Fetch Proposal with JOINs
//     // ===============================

//     const proposal = await ProposalModel.findOne({
//       where: { tpros_id: proposal_id },
//       include: [

//         {
//           model: ProjectTypeModel,
//           as: 'projectType',
//           attributes: ['tprj_project_type_name'],
//         },

//         {
//           model: SubProjectTypeModel,
//           as: 'subprojectType',
//           attributes: ['tsprj_sub_project_type_name'],
//         },

//         {
//           model: SdgMasterModel,
//           as: 'sdg',
//           attributes: ['tsdg_name'],
//         },

//         {
//           model: ScheduleSevenMaster,
//           as: 'scheduleSeven',
//           attributes: ['tschm_schedule_name'],
//         },
//         {
//           model: SubScheduleMaster,
//           as: 'themeManagement',
//           attributes: ['tsubshcm_sub_schedule_name'],
//         },
//         {
//           model: FinancialYearModel,
//           as: 'financialYear',
//           attributes: ['tfy_year_label'],
//         },
//         {
//           model: StateModel,
//           as: 'state',
//           attributes: ['tsl_state_id', 'tsl_state_name'],
//         },
//         {
//           model: DistrictModel,
//           as: 'district',
//           attributes: ['tdl_district_id', 'tdl_district_name'],
//         },
//         {
//           model: BlockModel,
//           as: 'block',
//           attributes: ['tbl_block_id', 'tbl_block_name'],
//         },
//         {
//           model: LocationModel,
//           as: 'location',
//           attributes: ['tloc_location_id', 'tloc_location_name'],
//         },
//         { model: ProjectTypeModel, as: 'projectType', attributes: ['tprj_id', 'tprj_project_type_name'] },

//       ],
//       raw: true,
//       nest: true,
//     });

//     if (!proposal) {
//       return res.json({
//         status: true,
//         message: "Proposal details fetched successfully.",
//         data: null,
//       });
//     }

//     // ===============================
//     // Fetch Documents
//     // ===============================

//     const documents = await DocumentModel.findAll({
//       where: {
//         final_doc_id: proposal_id,
//         fl_archive: "N",
//       },
//       attributes: [
//         "tdoc_id",
//         "doc_name",
//         "doc_ext",
//         "doc_original_path",
//         "doc_path",
//         "doc_type",
//         "sub_type",
//         "doc_title",
//         "doc_remarks",
//         "doc_purpose",
//         "doc_informations",
//         "draft_doc_id",
//         "final_doc_id",
//         "created_at",
//         "updated_at",
//         "deleted_at",
//         "created_by",
//         "updated_by",
//         "fl_archive",
//       ],
//       order: [["created_at", "ASC"]],
//       raw: true,
//     });

//     const documentsWithUrl = documents.map((doc) => ({
//       ...doc,
//       full_url: doc.doc_path ? `${file_url}${doc.doc_path}` : null,
//     }));

//     // ===============================
//     // Final Response
//     // ===============================

//     return res.json({
//       status: true,
//       message: "Proposal details fetched successfully.",
//       data: {
//         ...proposal,
//         tprj_project_type_name: proposal?.projectType?.tprj_project_type_name || null,
//         tsprj_sub_project_type_name: proposal?.subprojectType?.tsprj_sub_project_type_name || null,



//         tsdg_name: proposal?.sdg?.tsdg_name || null,

//         tschm_schedule_name: proposal?.scheduleSeven?.tschm_schedule_name || null,

//         tsubshcm_sub_schedule_name: proposal?.themeManagement?.tsubshcm_sub_schedule_name || null,


//         // Financial Year
//         tfy_year_label: proposal?.financialYear?.tfy_year_label || null,

//         // State
//         state: proposal?.state || null,
//         tsl_state_name: proposal?.state?.tsl_state_name || null,

//         // District
//         district: proposal?.district || null,
//         tdl_district_name: proposal?.district?.tdl_district_name || null,

//         // Block
//         block: proposal?.block || null,
//         tbl_block_name: proposal?.block?.tbl_block_name || null,

//         // Location
//         location: proposal?.location || null,
//         tloc_location_name: proposal?.location?.tloc_location_name || null,

//         // Documents
//         documents: documentsWithUrl,
//       },
//     });
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };


module.exports.proposal_details_fun = async (req, res, next) => {
  try {
    const { proposal_id } = req.body;
    const file_url = process.env.SERVER_FILE_URL;

    if (!proposal_id) {
      return res.status(400).json({
        status: false,
        message: "Proposal ID is required",
      });
    }

    // ===============================
    // Define Associations (SAFE)
    // ===============================
    if (!ProposalModel.associations?.projectType) {
      ProposalModel.belongsTo(ProjectTypeModel, {
        foreignKey: 'tpros_type_of_the_project',
        targetKey: 'tprj_id',
        as: 'projectType',
      });
    }
    if (!ProposalModel.associations?.subprojectType) {
      ProposalModel.belongsTo(SubProjectTypeModel, {
        foreignKey: 'tpros_type_of_the_sub_project',
        targetKey: 'tsprj_id',
        as: 'subprojectType',
      });
    }
    if (!ProposalModel.associations?.sdg) {
      ProposalModel.belongsTo(SdgMasterModel, {
        foreignKey: 'tpros_sdg',
        targetKey: 'tsdg_id',
        as: 'sdg',
      });
    }
    if (!ProposalModel.associations?.scheduleSeven) {
      ProposalModel.belongsTo(ScheduleSevenMaster, {
        foreignKey: 'tpros_schedule_seven',
        targetKey: 'tschm_schedule_id',
        as: 'scheduleSeven',
      });
    }
    if (!ProposalModel.associations?.themeManagement) {
      ProposalModel.belongsTo(SubScheduleMaster, {
        foreignKey: 'tpros_thematic_area',
        targetKey: 'tsubshcm_sub_schedule_id',
        as: 'themeManagement',
      });
    }
    if (!ProposalModel.associations?.financialYear) {
      ProposalModel.belongsTo(FinancialYearModel, {
        foreignKey: 'tpros_financial_year_id',
        targetKey: 'tfy_id',
        as: 'financialYear',
      });
    }
    if (!ProposalModel.associations?.state) {
      ProposalModel.belongsTo(StateModel, {
        foreignKey: 'tpros_state',
        targetKey: 'tsl_state_id',
        as: 'state',
      });
    }
    if (!ProposalModel.associations?.district) {
      ProposalModel.belongsTo(DistrictModel, {
        foreignKey: 'tpros_district',
        targetKey: 'tdl_district_id',
        as: 'district',
      });
    }
    if (!ProposalModel.associations?.block) {
      ProposalModel.belongsTo(BlockModel, {
        foreignKey: 'tpros_sub_district',
        targetKey: 'tbl_block_id',
        as: 'block',
      });
    }
    if (!ProposalModel.associations?.location) {
      ProposalModel.belongsTo(LocationModel, {
        foreignKey: 'tpros_location',
        targetKey: 'tloc_location_id',
        as: 'location',
      });
    }



    // GL Code
if (!ProposalModel.associations?.glCodeMaster) {
  ProposalModel.belongsTo(ProfitCenterMaster, {
    foreignKey: 'tpros_gl_code',
    targetKey: 'tprofc_id',
    as: 'glCodeMaster',
  });
}

// Profit Center
if (!ProposalModel.associations?.profitCenterMaster) {
  ProposalModel.belongsTo(ProfitCenterMaster, {
    foreignKey: 'tpros_profit_center',
    targetKey: 'tprofc_id',
    as: 'profitCenterMaster',
  });
}

// Cost Center
if (!ProposalModel.associations?.costCenterMaster) {
  ProposalModel.belongsTo(ProfitCenterMaster, {
    foreignKey: 'tpros_cost_center',
    targetKey: 'tprofc_id',
    as: 'costCenterMaster',
  });
}




    // ===============================
    // Fetch Proposal with JOINs
    // ===============================
    const proposal = await ProposalModel.findOne({
      where: { tpros_id: proposal_id },
      include: [
        { model: ProjectTypeModel, as: 'projectType', attributes: ['tprj_project_type_name'] },
        { model: SubProjectTypeModel, as: 'subprojectType', attributes: ['tsprj_sub_project_type_name'] },
        { model: SdgMasterModel, as: 'sdg', attributes: ['tsdg_name'] },
        { model: ScheduleSevenMaster, as: 'scheduleSeven', attributes: ['tschm_schedule_name'] },
        { model: SubScheduleMaster, as: 'themeManagement', attributes: ['tsubshcm_sub_schedule_name'] },
        { model: FinancialYearModel, as: 'financialYear', attributes: ['tfy_year_label'] },
        { model: StateModel, as: 'state', attributes: ['tsl_state_id', 'tsl_state_name'] },
        { model: DistrictModel, as: 'district', attributes: ['tdl_district_id', 'tdl_district_name'] },
        { model: BlockModel, as: 'block', attributes: ['tbl_block_id', 'tbl_block_name'] },
        { model: LocationModel, as: 'location', attributes: ['tloc_location_id', 'tloc_location_name'] },


        { 
  model: ProfitCenterMaster,
  as: 'glCodeMaster',
  attributes: ['tprofc_id', 'tprofc_gl_account'],
},
{ 
  model: ProfitCenterMaster,
  as: 'profitCenterMaster',
  attributes: ['tprofc_id', 'tprofc_profit_centre'],
},
{ 
  model: ProfitCenterMaster,
  as: 'costCenterMaster',
  attributes: ['tprofc_id', 'tprofc_cost_centre'],
},

      ],
      raw: true,
      nest: true,
    });

    if (!proposal) {
      return res.json({
        status: true,
        message: "Proposal details fetched successfully.",
        data: null,
      });
    }

    // ===============================
    // Fetch Additional Information / Budget Rows
    // ===============================
    const additionalRows = await ProposalAdditionalInformationModel.findAll({
      where: { tpai_proposal_id: proposal_id },
      attributes: [
        'tpai_particular',
        'tpai_unit',
        'tpai_no_of_unit',
        'tpai_unit_cost',
        'tpai_total',
        'tpai_gst_percentage',
        'tpai_total_including_gst',
      ],
      order: [['tpai_created_at', 'ASC']],
      raw: true,
    });

    // ===============================
    // Fetch Documents
    // ===============================
    const documents = await DocumentModel.findAll({
      where: { final_doc_id: proposal_id, fl_archive: 'N' },
      attributes: [
        "tdoc_id",
        "doc_name",
        "doc_ext",
        "doc_original_path",
        "doc_path",
        "doc_type",
        "sub_type",
        "doc_title",
        "doc_remarks",
        "doc_purpose",
        "doc_informations",
        "draft_doc_id",
        "final_doc_id",
        "created_at",
        "updated_at",
        "deleted_at",
        "created_by",
        "updated_by",
        "fl_archive",
      ],
      order: [['created_at', 'ASC']],
      raw: true,
    });

    const documentsWithUrl = documents.map(doc => ({
      ...doc,
      full_url: doc.doc_path ? `${file_url}${doc.doc_path}` : null,
    }));

    // ===============================
    // Final Response
    // ===============================
    return res.json({
      status: true,
      message: "Proposal details fetched successfully.",
      data: {
        ...proposal,
        budgetRows: additionalRows, // ✅ add the additional info rows
        documents: documentsWithUrl,
      },
    });

  } catch (err) {
    console.error("Proposal Details Fetch Error:", err);
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.send_proposal_for_approval_fun = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { approval_remarks, approval_item_id } = req.body;
    const creatorUserId = req.body.payload.id;
    const roleId = req.body.payload.role_id;
    const approval_order = 1;

    // Notify system about status change
    await notificationStatusChange("proposal", approval_item_id);

    // Step 1: Update Proposal
    await ProposalModel.update(
      {
        tpros_status: "send_for_approval",
        tpros_approval_order: approval_order,
        tpros_approval_type: "proposal",
        tpros_updated_by: creatorUserId,
      },
      { where: { tpros_id: approval_item_id }, transaction }
    );

    // Step 2: Get Approval Path
    const ApprovalPathListData = await ApprovalPathList("proposal", approval_order);

    // Step 3: Create Notifications for each approver
    for (const path of ApprovalPathListData) {
      // Handle comma-separated role ids
      const roleIds = path.tapp_role_id.split(",").map(id => id.trim());

      let approvalUsers = [];
      for (const roleId of roleIds) {
        const users = await getUserByRoleId(roleId);
        approvalUsers = approvalUsers.concat(users);
      }

      if (approvalUsers.length > 0) {
        const tenDigitNumber = generateTenDigitNumber();

        const notifications = approvalUsers.map(user => ({
          tnot_module: "proposal",
          tnot_type: "proposal",
          tnot_item_id: approval_item_id,
          tnot_receiver_id: user.id,
          tnot_text: approval_remarks,
          tnot_url: `proposal/proposal_details/${approval_item_id}?rand=${tenDigitNumber}`,
          tnot_sender_id: creatorUserId,
        }));

        await NotificationModel.bulkCreate(notifications, { transaction });
      }
    }


    // Step 4: Insert approval process tracking
    await ApprovalProcessTrackModel.create(
      {
        apt_type: "proposal",
        apt_item_id: approval_item_id,
        apt_user_id: creatorUserId,
        apt_user_role: roleId,
        apt_recipient_id: creatorUserId,
        apt_remarks: approval_remarks,
        apt_accept_step: "initial",
        apt_accept_status: "approval",
        apt_created_by: creatorUserId,
        apt_updated_by: creatorUserId,
      },
      { transaction }
    );

    // Commit Transaction
    await transaction.commit();

    return res.status(200).json({
      message: "Proposal sent for approval successfully.",
      status: true,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Proposal Approval Error:", err);
    return next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      })
    );
  }
};




module.exports.getExcelExportProposalList = async (req, res, next) => {
  try {
    var sql = `SELECT
        p.tpros_id,
        p.tpros_financial_year_id,
        fy.tfy_year_label,
        fy.tfy_year,
        p.tpros_proposal_name,
        p.tpros_status,
        p.tpros_created_at
      FROM t_proposal p
      LEFT JOIN t_financial_year fy
        ON fy.tfy_id = p.tpros_financial_year_id
    `;

    var records = await Datatables.build(req, sql);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.deleteProposalDocument = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { tdoc_id } = req.body;
  
    await DocumentModel.update(
      { deleted_at: new Date() },   // current timestamp
      { where: { tdoc_id } }
    );
    await transaction.commit();
    return res.status(200).json({
      status: true,
      message: "Document deleted successfully",
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Delete Document Error:", err);

    return next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      })
    );
  }
};