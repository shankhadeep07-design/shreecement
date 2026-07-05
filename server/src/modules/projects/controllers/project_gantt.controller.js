var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes, where } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const ActivityTimelineMasterModel = require("../../../models/projects/activity/activity_timeline_master.model");
const ActivityTimelineDetailsModel = require("../../../models/projects/activity/activity_timeline_details.model");


module.exports.project_task_sub_task_list_fun = async (req, res, next) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const ActivityTimeline = await ActivityTimelineMasterModel.findAll({
      where: { atim_project_id: id, atim_fl_archive: 'N' },
      order: [['atim_order', 'ASC'], ['atim_created_at', 'ASC']]
    });

    return res.status(200).json({
      status: true,
      message: "Activity Timeline fetched successfully",
      data: ActivityTimeline.length ? ActivityTimeline : [],
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.project_task_sub_task_create_update_fun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      atim_id,
      atim_project_id,
      atim_activities,
      atim_parent_id,
      atim_order, // 👈 New field
      atim_wightage,
      atim_planned_start_dt,
        atim_planned_end_dt
    } = req.body;

    const created_by = req?.user?.[0]?.id || "SYSTEM";

    console.log("req.body----------------------------------", req.body);

    let task;

    if (atim_id) {
      // 🔄 UPDATE EXISTING TASK
      task = await ActivityTimelineMasterModel.findOne({
        where: { atim_id },
        transaction,
      });

      if (!task) {
        throw new Error(`Task with id ${atim_id} not found`);
      }

      await task.update(
        {
          atim_project_id,
          atim_activities,
          atim_parent_id: atim_parent_id || null,
          atim_order: atim_order || task.atim_order, // keep same if not provided
          atim_wightage: atim_wightage || null,
            atim_planned_start_dt: atim_planned_start_dt || null,
            atim_planned_end_dt: atim_planned_end_dt || null,
          atim_updated_at: new Date(),
          atim_updated_by: created_by,
        },
        { transaction }
      );
    } else {
      // ➕ CREATE NEW TASK / SUBTASK

      // 1️⃣ Find max order in the same "scope" (parent or root level)
      const maxOrder = await ActivityTimelineMasterModel.max("atim_order", {
        where: {
          atim_project_id,
          atim_parent_id: atim_parent_id || null, // 👈 scoped within same parent
        },
        transaction,
      });

      const nextOrder = (maxOrder || 0) + 1;

      task = await ActivityTimelineMasterModel.create(
        {
          atim_project_id,
          atim_activities,
          atim_parent_id: atim_parent_id || null,
          atim_order: atim_order || nextOrder, // 👈 set order
            atim_wightage: atim_wightage || null,
            atim_planned_start_dt: atim_planned_start_dt || null,
            atim_planned_end_dt: atim_planned_end_dt || null,
          atim_created_by: created_by,
          atim_updated_by: created_by,
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: atim_id
        ? "Task/Subtask updated successfully"
        : "Task/Subtask created successfully",
      data: task,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in project_task_sub_task_create_update_fun:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.project_task_sub_task_order_changed_fun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      atim_id,
      atim_project_id,
      atim_activities,
      atim_parent_id,
      atim_order, // 👈 New field
    } = req.body;

    const created_by = req?.user?.[0]?.id || "SYSTEM";

    console.log("req.body----------------------------------", req.body);

    let task;

    // 🔄 UPDATE EXISTING TASK
      task = await ActivityTimelineMasterModel.findOne({
        where: { atim_id },
        transaction,
      });

      if (!task) {
        throw new Error(`Task with id ${atim_id} not found`);
      }

      await task.update(
        {
          atim_project_id,
          atim_activities,
          atim_order: atim_order || task.atim_order, // keep same if not provided
          atim_updated_by: created_by,
        },
        { transaction }
      );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: atim_id
        ? "Task/Subtask updated successfully"
        : "Task/Subtask created successfully",
      data: task,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in project_task_sub_task_create_update_fun:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.project_parent_task_start_fun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      atim_id,
      date,
      description,
      atim_project_id
    } = req.body;

    const created_by = req?.user?.[0]?.id || "SYSTEM";

    const presentDate = new Date();

    let task;

    // 🔄 UPDATE EXISTING TASK
      task = await ActivityTimelineMasterModel.findOne({
        where: { atim_id },
        transaction,
      });

      if (!task) {
        throw new Error(`Task with id ${atim_id} not found`);
      }

      await task.update(
        {
          atim_actual_start_dt: date,
          atim_actual_start_dt_user: presentDate,
          atim_actual_start_dt_by: created_by,
          atim_status : "started"
        },
        {
            where: { atim_id }
        },
        { transaction }
      );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: atim_id
        ? "Task/Subtask updated successfully"
        : "Task/Subtask created successfully",
      data: task,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in project_task_sub_task_create_update_fun:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.project_parent_task_end_fun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      atim_id,
      date,
      description,
      atim_project_id
    } = req.body;

    const created_by = req?.user?.[0]?.id || "SYSTEM";

    const presentDate = new Date();

    let task;

    // 🔄 UPDATE EXISTING TASK
      task = await ActivityTimelineMasterModel.findOne({
        where: { atim_id },
        transaction,
      });

      if (!task) {
        throw new Error(`Task with id ${atim_id} not found`);
      }

      await task.update(
        {
          atim_actual_end_dt: date,
          atim_actual_end_dt_user: presentDate,
          atim_actual_end_dt_by: created_by,
          atim_status : "ended"
        },
        {
            where: { atim_id }
        },
        { transaction }
      );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: atim_id
        ? "Task/Subtask updated successfully"
        : "Task/Subtask created successfully",
      data: task,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in project_task_sub_task_create_update_fun:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.project_child_task_start_fun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      atim_id,
      atim_project_id,
      atim_activities,
      atim_parent_id,
      atim_order, // 👈 New field
    } = req.body;

    const created_by = req?.user?.[0]?.id || "SYSTEM";

    console.log("req.body----------------------------------", req.body);

    let task;

    // 🔄 UPDATE EXISTING TASK
      task = await ActivityTimelineMasterModel.findOne({
        where: { atim_id },
        transaction,
      });

      if (!task) {
        throw new Error(`Task with id ${atim_id} not found`);
      }

      await task.update(
        {
          atim_project_id,
          atim_activities,
          atim_order: atim_order || task.atim_order, // keep same if not provided
          atim_updated_by: created_by,
        },
        { transaction }
      );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: atim_id
        ? "Task/Subtask updated successfully"
        : "Task/Subtask created successfully",
      data: task,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in project_task_sub_task_create_update_fun:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.project_activity_submit_fun = async (req, res) => {

  try {
    const {
      atd_id, // 👈 will decide create vs update
      atd_project_id,
      atd_activity_id,
      atd_activity_date,
      atd_activity_details,
      atd_status
    } = req.body;

    const files = req.files || [];
    let uploadedFilePaths = [];
    const created_by = req?.user?.[0]?.id || "SYSTEM";

    // console.log("req.body----------------------------------", req.body);
    // console.log("files----------------------------------", files);return
    

    let result;

    if (!atd_id) {
      // ✅ CREATE
      result = await ActivityTimelineDetailsModel.create(
        {
          atd_project_id,
          atd_activity_id,
          atd_activity_date,
          atd_activity_details,
          atd_status,
          atd_created_by: created_by,
        }
      );
    } else {
      // ✅ UPDATE
      await ActivityTimelineDetailsModel.update(
        {
          atd_project_id,
          atd_activity_id,
          atd_activity_date,
          atd_activity_details,
          atd_status,
          atd_updated_by: created_by,
        },
        {
          where: { atd_id }
        }
      );

      result = await ActivityTimelineDetailsModel.findOne({
        where: { atd_id }
      });
    }

      
  

    // ✅ Handle file uploads
    if (files.length > 0) {

      await DocumentModel.destroy({
        where: {  final_doc_id : result.atd_id  }
      });

      const grouped = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      for (const [key, fileGroup] of Object.entries(grouped)) {
        if (key === "file") {
          const { metadata, filePaths } = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            atd_id || result.atd_id, // use new or existing ID
            "uploads/project/activity/",
            created_by,
            
          );
          uploadedFilePaths.push(...filePaths);

          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata);
          }
        }
      }
    }

    // await transaction.commit();

    res.status(200).json({
      success: true,
      message: !atd_id
        ? "Activity created successfully"
        : "Activity updated successfully",
      data: result,
    });
  } catch (error) {
  
    console.error("Error in project_activity_submit_fun:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.project_activity_list_fun = async (req, res) => {
    
    try {
      
      let {atd_activity_id} = req.body;
      let file_url = process.env.SERVER_FILE_URL;

        var sql = `
          SELECT 
                t_activity_timeline_details.*, 
                users.name,
                t_activity_timeline_master.atim_activities,
                t_activity_timeline_master.atim_status,
                COALESCE(docs.documents, '[]'::json) AS documents

            FROM t_activity_timeline_details
            LEFT JOIN LATERAL (
                SELECT json_agg(
                    to_jsonb(td) ||
                    jsonb_build_object(
                        'full_url', '${file_url}' || td.doc_path
                    )
                ) AS documents
                FROM t_documents td
                WHERE td.final_doc_id = t_activity_timeline_details.atd_id
            ) docs ON true
            LEFT JOIN users ON users.id = t_activity_timeline_details.atd_created_by
            LEFT JOIN t_activity_timeline_master ON t_activity_timeline_master.atim_id = t_activity_timeline_details.atd_activity_id
            
            WHERE t_activity_timeline_details.atd_activity_id = '${atd_activity_id}'
            ORDER BY t_activity_timeline_details.atd_id DESC
            `;

        const ngoData = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
        });
       

    return res.status(200).json({
      status: true,
      message: "NGO User Id fetched successfully",
      data: ngoData,
    });

    } catch (error) {
 
      console.error("Error in project_activity_list_fun:", error);
      res.status(500).json({ success: false, message: error.message });
    }

};




