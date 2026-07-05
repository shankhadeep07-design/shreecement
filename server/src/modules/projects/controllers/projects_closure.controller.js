var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const DocumentModel = require("../../../models/documents/documents.model");
const {
  saveAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const ProjectClosureStakeholderModel = require("../../../models/projects/projects_closure_stakeholder.model");
const ProjectClosureModel = require("../../../models/projects/projects_closure.model");
const { isEmpty } = require("../../../helpers/common.helper");
const { 
  ApprovalPathList,
  getUserById,
  generateTenDigitNumber,
  notificationStatusChange,
  ApprovalDetails
} = require("../../../helpers/web.helper");
const NotificationModel = require("../../../models/notification/notifications.model");
const ApprovalProcessTrackModel = require("../../../models/approval/ApprovalProcessTrackModel");

///// listing method start
module.exports.projects_closure_datatable = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";
    const { project_id } = req.body;

    const sql = `
      SELECT
        c.tpclsr_id,
        c.tpclsr_project_id,

        /* ===== CORE FIELDS ===== */
        c.tpclsr_deliverable_achieved,
        c.tpclsr_closure_date,
        c.tpclsr_beneficiary_impacted,
        c.tpclsr_closed_type,
        c.tpclsr_closed_finally,
        c.tpclsr_summary_report,
        c.tpclsr_total_payment_received,
        c.tpclsr_status,

        /* ===== META ===== */
        c.tpclsr_created_at,
        c.tpclsr_updated_at,

        '' AS action,

        /* ===== DOCUMENTS ===== */
        COALESCE(docs.documents, '[]'::json) AS documents

      FROM t_project_closures c

      LEFT JOIN LATERAL (
        SELECT json_agg(
          jsonb_build_object(
            'tdoc_id',    td.tdoc_id,
            'doc_purpose',td.doc_purpose,
            'name',       td.doc_name,
            'file_name',  td.doc_name,
            'doc_path',   td.doc_path,
            'url',        '${file_url}' || td.doc_path,
            'full_url',   '${file_url}' || td.doc_path,
            'status',     'done'
          )
          ORDER BY td.created_at ASC
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = c.tpclsr_id
          AND td.doc_purpose  = 'closure_docs'  
          AND td.deleted_at IS NULL  
      ) docs ON true
    `;

    let where = `c.tpclsr_deleted_at IS NULL`;

    if (project_id) {
      where += ` AND c.tpclsr_project_id = '${project_id}'`;
    }

    const records = await Datatables.build(req, sql, where);
    return res.json(records);
  } catch (err) {
    console.error("Project closure datatable error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.projects_closure_create_update = async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const isUpdate = !!req.body.tpclsr_id;
    const id = isUpdate ? req.body.tpclsr_id : null;

    const formData = req.body;
    const files = req.files || [];
    const created_by = req?.user?.[0]?.id || 0;

    /* ================= VALIDATION ================= */
    if (!formData.tpclsr_project_id) throw new Error("Project ID is required");
    if (!formData.tpclsr_deliverable_achieved?.trim())
      throw new Error("Deliverable Achieved is required");
    if (!formData.tpclsr_closure_date)
      throw new Error("Closure Date is required");
    if (!formData.tpclsr_closed_finally)
      throw new Error("Closed Finally is required");

    /* ================= MAP FIELDS ================= */
    const requestData = {
      tpclsr_project_id: formData.tpclsr_project_id || null,
      tpclsr_deliverable_achieved: formData.tpclsr_deliverable_achieved.trim(),
      tpclsr_closure_date: formData.tpclsr_closure_date || null,
      tpclsr_beneficiary_impacted: formData.tpclsr_beneficiary_impacted || null,
      tpclsr_closed_type: formData.tpclsr_closed_type || null, 
      tpclsr_closed_finally: formData.tpclsr_closed_finally || null,
      tpclsr_summary_report: formData.tpclsr_summary_report || null,
      tpclsr_total_payment_received: formData.tpclsr_total_payment_received
        ? BigInt(formData.tpclsr_total_payment_received)
        : null,
      tpclsr_status: formData.tpclsr_status || 'draft',
      tpclsr_updated_by: created_by,
    };

    let projectClosure;

    /* ================= CREATE / UPDATE ================= */
    if (isUpdate) {
      const existing = await ProjectClosureModel.findOne({
        where: { tpclsr_id: id },
        transaction,
      });

      if (!existing) throw new Error("Closure record not found");

      requestData.tpclsr_updated_by = created_by;

      await ProjectClosureModel.update(requestData, {
        where: { tpclsr_id: id },
        transaction,
      });

      projectClosure = await ProjectClosureModel.findOne({
        where: { tpclsr_id: id },
        transaction,
      });
    } else {
      requestData.tpclsr_created_by = created_by;
      requestData.tpclsr_updated_by = created_by;

      projectClosure = await ProjectClosureModel.create(requestData, {
        transaction,
      });
    }

    const closureId = projectClosure.tpclsr_id;

    /* ================= HANDLE FILE UPLOADS ================= */
    if (files.length > 0) {
      const { metadata } = await saveAndPrepareDocumentMetadata(
        files,
        closureId,
        "uploads/project/closure",
        created_by,
        transaction,
      );

      for (const doc of metadata) {
        doc.doc_title = "Closure Document";
        doc.doc_purpose = "closure_docs";
        doc.final_doc_id = closureId;
        doc.created_by = created_by;
        doc.updated_by = created_by;

        await DocumentModel.create(doc, { transaction });
      }
    }

    /* ================= COMMIT ================= */
    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: isUpdate
        ? "Project closure updated successfully"
        : "Project closure created successfully",
      data: projectClosure,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Project Closure Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

module.exports.projectAllClosureDetailsFunction = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;

    const sql = `
          SELECT 
         c.*,

    -- aggregate stakeholders in a subquery
    COALESCE(stakeholders.stakeholders, '[]'::json) AS stakeholders,

    -- aggregate documents in a lateral subquery
    COALESCE(docs.documents, '[]'::json) AS documents

    FROM t_project_closures c

    -- Stakeholders aggregated per closure
    LEFT JOIN LATERAL (
        SELECT json_agg(
            json_build_object(
                'tpclsrsh_id', sh.tpclsrsh_id,
                'tpclsrsh_stackeholder_name', sh.tpclsrsh_stackeholder_name,
                'tpclsrsh_role_in_project', sh.tpclsrsh_role_in_project,
                'tpclsrsh_feedback_summary', sh.tpclsrsh_feedback_summary,
                'tpclsrsh_action_taken', sh.tpclsrsh_action_taken,
                'tpclsrsh_comments', sh.tpclsrsh_comments
            )
        ) AS stakeholders
        FROM t_project_closure_stakeholder sh
        WHERE sh.tpclsrsh_project_closure_id = c.tpclsr_id
    ) stakeholders ON true

    -- Documents aggregated per closure
    LEFT JOIN LATERAL (
        SELECT json_agg(
            to_jsonb(td) ||
            jsonb_build_object(
                'full_url', '${file_url}' || td.doc_path
            )
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = c.tpclsr_id
    ) docs ON true
    `;
    const closureData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Closure details fetched successfully",
      data: closureData || [], 
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.projectClosureDetailsFunction = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;
    const tpclsr_id = req.body.tpclsr_id;
    const project_id = req.body.project_id;

    if (!tpclsr_id && !project_id) {
      return res.status(400).json({ message: "Closure ID or Project ID is required" });
    }

    let whereClause = tpclsr_id ? `c.tpclsr_id = '${tpclsr_id}'` : `c.tpclsr_project_id = '${project_id}'`;

    const sql = `
          SELECT 
         c.*,
         p.tproj_unit_id,
         p.tproj_state_id,
         p.tproj_district_id,
         p.tproj_block_id,
         p.tproj_project_title,

    -- aggregate stakeholders in a subquery
    COALESCE(stakeholders.stakeholders, '[]'::json) AS stakeholders,

    -- aggregate documents in a lateral subquery
    COALESCE(docs.documents, '[]'::json) AS documents

    FROM t_project_closures c
    LEFT JOIN t_projects p ON c.tpclsr_project_id = p.tproj_id

    -- Stakeholders aggregated per closure
    LEFT JOIN LATERAL (
        SELECT json_agg(
            json_build_object(
                'tpclsrsh_id', sh.tpclsrsh_id,
                'tpclsrsh_stackeholder_name', sh.tpclsrsh_stackeholder_name,
                'tpclsrsh_role_in_project', sh.tpclsrsh_role_in_project,
                'tpclsrsh_feedback_summary', sh.tpclsrsh_feedback_summary,
                'tpclsrsh_action_taken', sh.tpclsrsh_action_taken,
                'tpclsrsh_comments', sh.tpclsrsh_comments
            )
        ) AS stakeholders
        FROM t_project_closure_stakeholder sh
        WHERE sh.tpclsrsh_project_closure_id = c.tpclsr_id
    ) stakeholders ON true

    -- Documents aggregated per closure
    LEFT JOIN LATERAL (
        SELECT json_agg(
            to_jsonb(td) ||
            jsonb_build_object(
                'full_url', '${file_url}' || td.doc_path
            )
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = c.tpclsr_id
    ) docs ON true
    WHERE ${whereClause}
    `;
    const closureData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    const data = tpclsr_id ? (closureData ? closureData[0] : {}) : (closureData || []);

    return res.status(200).json({
      status: true,
      message: "Closure details fetched successfully",
      data: data,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.send_project_closure_for_approval_fun = async (req, res, next) => {
  try {
    const {
      item_id,
      remarks,
      user_id,
      payload: { id: createdById, user_type, role_id: initiator_role_id },
    } = req.body;

    if (
      !item_id ||
      !user_id ||
      !createdById ||
      !user_type ||
      !initiator_role_id
    ) {
      return res.status(400).json({
        status: 0,
        message: "Missing required fields.",
      });
    }

    const moduleType = "project_closure";

    // Get approval path
    const ApprovalPathListData = await ApprovalDetails(
      moduleType,
      initiator_role_id,
    );
    // console.log(ApprovalPathListData);return

    // Change notification status
    await notificationStatusChange(moduleType, item_id);

    if (!ApprovalPathListData || !ApprovalPathListData.length) {
      return res.status(404).json({
        status: 0,
        message: "No approval path found.",
      });
    }

    const approvalPath = ApprovalPathListData[0];
    const approval_path_id = approvalPath.tac_id;
    const firstStep = approvalPath.tac_approval_json?.[0];

    if (!firstStep) {
      return res.status(400).json({
        status: 0,
        message: "Approval steps not defined in the path.",
      });
    }

    const { role_id, forward: forward_option } = firstStep;

    

    const tenDigitNumber = generateTenDigitNumber();

    await NotificationModel.create({
      tnot_type: moduleType,
      tnot_item_id: item_id,
      tnot_receiver_id: user_id,
      tnot_text: "Approval For Project Closure",
      tnot_url: `project/closure/view-list/${item_id}?rand=${tenDigitNumber}`,
      tnot_sender_id: createdById,
      tnot_table_type: "t_project_closures",
    });

    await ApprovalProcessTrackModel.create({
      apt_type: moduleType,
      apt_item_id: item_id,
      apt_user_id: createdById,
      apt_user_role: initiator_role_id,
      apt_recipient_id: user_id,
      apt_remarks: remarks,
      apt_accept_step: "send_for_approval",
      apt_accept_status: "send_for_approval",
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: createdById,
      apt_updated_by: createdById,
    });

    await ProjectClosureModel.update(
      {
        tpclsr_approval_id: approval_path_id,
        tpclsr_user_id: user_id,
        tpclsr_user_role_id: role_id,
        tpclsr_not_type: moduleType,
        tpclsr_status: "pending",
        tpclsr_approver_index: 1,
      },
      { where: { tpclsr_id: item_id } },
    );

    return res.status(200).json({
      status: 1,
      message: "Notification submitted successfully",
      data: [],
    });
  } catch (error) {
    return next(CustomErrorHandler.databaseError(error.message));
  }
};

module.exports.getProjectClosurePendingUser = async (req, res, next) => {
  const {
    item_id,
  } = req.body;

  if (isEmpty(item_id)) {
    return res.status(200).json({
      data: [],
      status: 0,
      message: "Item ID is required.",
    });
  }

  try {
    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        tpclsr_status AS status,
        r.trl_role_name AS role_name,
        tpclsr_approver_index AS current_sequence,
        tpclsr_approval_id AS approval_id
      FROM t_project_closures
      LEFT JOIN users u ON CAST(tpclsr_user_id AS BIGINT) = u.id
      LEFT JOIN t_roles r ON tpclsr_user_role_id = r.trl_role_id
      WHERE tpclsr_id = :idValue
      LIMIT 1;
    `;

    const data = await sequelize.query(sql, {
      replacements: { idValue: item_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!data || data.length === 0) {
      return res.status(200).json({
        data: [],
        status: 0,
        message: "No matching record found.",
      });
    }

    const current_sequence = data[0]["current_sequence"];
    const approval_id = data[0]["approval_id"];

    const approval_sql = `
      SELECT
        tapp_role_id AS role_id
      FROM
        t_approval_path
      WHERE
        tapp_id = :approvalId
      LIMIT 1;
    `;

    const approval_data = await sequelize.query(approval_sql, {
      replacements: { approvalId: approval_id },
      type: sequelize.QueryTypes.SELECT,
    });

    const send_data = {
      role_id: approval_data.length > 0 ? approval_data[0].role_id : null,
      details: data[0],
    };

    return res.json({
      status: 1,
      message: "Pending user details",
      data: send_data,
    });
  } catch (err) {
    console.error("Error in getProjectClosurePendingUser:", err);
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

// Aliases to match routes
module.exports.projects_closure_save = module.exports.projects_closure_create_update;
module.exports.projects_closure_details_fun = module.exports.projectClosureDetailsFunction;
