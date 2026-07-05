var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");

const BestPractice = require("../../../models/best_practice/best_practice.model");

const {
    saveAndPrepareDocumentMetadata,
    saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const DocumentModel = require("../../../models/documents/documents.model");

// module.exports.fetch_best_practices_datatable = async (req, res, next) => {
//     try {
//         // var sql = `select * from t_best_practice`;


//         var sql = `
// SELECT 
//     tbp.*,
//     proj.tproj_proposal_name AS project_name,
//     theme.tthm_theme_name AS theme_name,
//     focus.tsubshcm_sub_schedule_name AS focus_area_name
// FROM t_best_practice tbp
// LEFT JOIN t_projects proj
//     ON proj.tproj_id = tbp.tbp_project_id
// LEFT JOIN t_theme_master theme
//     ON theme.tthm_theme_id = tbp.tbp_theme_id
// LEFT JOIN t_sub_schedule_master focus
//     ON focus.tsubshcm_sub_schedule_id = tbp.tbp_focus_area_id
// `;


//         // var where = ` t_block.tbl_is_active = 'true' `;

//         var records = await Datatables.build(req, sql);

//         res.json(records);
//     } catch (err) {
//         console.log(err);
//         next(
//             CustomErrorHandler.internalServerError({
//                 message: err.message,
//                 stack: err.stack,
//             })
//         );
//     }
// };




module.exports.fetch_best_practices_datatable = async (req, res, next) => {
    try {

        const file_url = process.env.SERVER_FILE_URL || "";

        var sql = `
        SELECT 
            tbp.*,
            proj.tproj_proposal_name AS project_name,
            theme.tthm_theme_name AS theme_name,
            focus.tsubshcm_sub_schedule_name AS focus_area_name
        FROM t_best_practice tbp
        LEFT JOIN t_projects proj
            ON proj.tproj_id = tbp.tbp_project_id
        LEFT JOIN t_theme_master theme
            ON theme.tthm_theme_id = tbp.tbp_theme_id
        LEFT JOIN t_sub_schedule_master focus
            ON focus.tsubshcm_sub_schedule_id = tbp.tbp_focus_area_id
        `;

        // Datatable records
        var records = await Datatables.build(req, sql);

        const bestPracticeIds = records.data.map(r => r.tbp_id);

        if (bestPracticeIds.length > 0) {

            const documentSql = `
                SELECT 
                    td.final_doc_id AS tbp_id,
                    json_agg(
                        jsonb_build_object(
                            'tdoc_id', td.tdoc_id,
                            'title', td.doc_title,
                            'file_name', td.doc_name,
                            'full_url', :file_url || td.doc_path
                        )
                    ) AS documents
                FROM t_documents td
                WHERE td.doc_purpose = 'tbp_picture_documents'
                  AND td.final_doc_id IN (:ids)
                GROUP BY td.final_doc_id
            `;

            const documentRows = await sequelize.query(documentSql, {
                replacements: { file_url, ids: bestPracticeIds },
                type: QueryTypes.SELECT,
            });

            const documentsMap = {};
            documentRows.forEach(row => {
                documentsMap[row.tbp_id] = row.documents || [];
            });

            records.data = records.data.map(row => ({
                ...row,
                documents: documentsMap[row.tbp_id] || []
            }));
        }

        res.json(records);

    } catch (err) {
        console.log(err);
        next(
            CustomErrorHandler.internalServerError({
                message: err.message,
                stack: err.stack,
            })
        );
    }
};

module.exports.createOrUpdateBestPractice = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const formData = req.body;
        const created_by = req.user?.id || formData.tbp_created_by;

        // ✅ multer files
        const files = req.files || [];

        let isUpdate = req.params.id || formData?.tbp_id || null;

        if (isUpdate === "undefined" || isUpdate === "") {
            isUpdate = null;
        }


        let bestPracticeId;

        // ========================================
        // 🔁 UPDATE MODE
        // ========================================
        if (isUpdate) {

            const bestPractice = await BestPractice.findByPk(isUpdate, { transaction });

            if (!bestPractice) {
                throw new Error("Best Practice not found for update.");
            }

            await bestPractice.update(
                {
                    tbp_project_id: formData.tbp_project_id,
                    tbp_theme_id: formData.tbp_theme_id,
                    tbp_focus_area_id: formData.tbp_focus_area_id,
                    tbp_problem: formData.tbp_problem,
                    tbp_solution: formData.tbp_solution,
                    tbp_benefit: formData.tbp_benefit,
                    tbp_is_active: formData.tbp_is_active ?? true,
                    tbp_updated_by: created_by,
                    tbp_updated_at: new Date(),
                },
                { transaction }
            );

            bestPracticeId = bestPractice.tbp_id;
        }

        // ========================================
        // ➕ CREATE MODE
        // ========================================
        else {

            const bestPractice = await BestPractice.create(
                {
                    tbp_project_id: formData.tbp_project_id,
                    tbp_theme_id: formData.tbp_theme_id,
                    tbp_focus_area_id: formData.tbp_focus_area_id,
                    tbp_problem: formData.tbp_problem,
                    tbp_solution: formData.tbp_solution,
                    tbp_benefit: formData.tbp_benefit,
                    tbp_is_active: formData.tbp_is_active ?? true,
                    tbp_created_by: created_by,
                    tbp_updated_by: created_by,
                    tbp_created_at: new Date(),
                    tbp_updated_at: new Date(),
                },
                { transaction }
            );

            bestPracticeId = bestPractice.tbp_id;
        }

        // ========================================
        // 📁 FILE HANDLING
        // ========================================
        if (files.length > 0) {

            const groupedFiles = files.reduce((acc, file) => {
                if (!acc[file.fieldname]) {
                    acc[file.fieldname] = [];
                }
                acc[file.fieldname].push(file);
                return acc;
            }, {});

            if (groupedFiles.tbp_picture_documents?.length) {

                const { metadata } = await saveAndPrepareDocumentMetadata(
                    groupedFiles.tbp_picture_documents,
                    bestPracticeId, // ✅ correct id
                    "uploads/best_practice",
                    created_by, // ✅ correct user
                    transaction
                );

                if (metadata?.length) {
                    await DocumentModel.bulkCreate(metadata, { transaction });
                }
            }
        }

        await transaction.commit();

        return res.status(200).json({
            message: isUpdate
                ? "Best Practice updated successfully."
                : "Best Practice created successfully.",
            data: { tbp_id: bestPracticeId },
            status: true,
        });

    } catch (err) {

        if (transaction) await transaction.rollback();

        console.error("Best Practice Create/Update Error:", err);

        return next(
            CustomErrorHandler.internalServerError({
                message: err.message,
                stack: err.stack,
            })
        );
    }
};

// module.exports.createOrUpdateBestPractice = async (req, res, next) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const formData = req.body;
//         const created_by = req.user?.id || formData.tbp_created_by || 'SYSTEM';
//         const files = req.tbp_picture_documents || [];
//         let isUpdate = formData?.tbp_id;
//         if (!isUpdate || isUpdate === "undefined" || isUpdate === "") {
//             isUpdate = null;
//         }
//         let bestPracticeId;
//         // ========================================
//         // 🔁 UPDATE MODE
//         // ========================================
//         if (isUpdate) {

//             const bestPractice = await BestPractice.findByPk(isUpdate, { transaction });

//             if (!bestPractice) {
//                 throw new Error("Best Practice not found for update.");
//             }

//             await bestPractice.update(
//                 {
//                     tbp_project_id: formData.tbp_project_id,
//                     tbp_theme_id: formData.tbp_theme_id,
//                     tbp_focus_area_id: formData.tbp_focus_area_id,
//                     tbp_problem: formData.tbp_problem,
//                     tbp_solution: formData.tbp_solution,
//                     tbp_benefit: formData.tbp_benefit,
//                     // tbp_name: formData.tbp_name,
//                     tbp_is_active: formData.tbp_is_active ?? true,
//                     tbp_updated_by: created_by,
//                     tbp_updated_at: new Date(),
//                 },
//                 { transaction }
//             );

//             bestPracticeId = bestPractice.tbp_id;
//         }

//         // ========================================
//         // ➕ CREATE MODE
//         // ========================================
//         else {

//             const bestPractice = await BestPractice.create(
//                 {
//                     tbp_project_id: formData.tbp_project_id,
//                     tbp_theme_id: formData.tbp_theme_id,
//                     tbp_focus_area_id: formData.tbp_focus_area_id,
//                     tbp_problem: formData.tbp_problem,
//                     tbp_solution: formData.tbp_solution,
//                     tbp_benefit: formData.tbp_benefit,
//                     // tbp_name: formData.tbp_name,
//                     tbp_is_active: formData.tbp_is_active ?? true,
//                     tbp_created_by: created_by,
//                     tbp_updated_by: created_by,
//                     tbp_created_at: new Date(),
//                     tbp_updated_at: new Date(),
//                 },
//                 { transaction }
//             );

//             bestPracticeId = bestPractice.tbp_id;
//         }


//         if (files.length) {
//             const groupedFiles = files.reduce((acc, file) => {
//                 (acc[file.fieldname] ||= []).push(file);
//                 return acc;
//             }, {});

//             if (groupedFiles.tbp_picture_documents?.length) {
//                 const { metadata } = await saveAndPrepareDocumentMetadata(
//                     groupedFiles.tbp_picture_documents,
//                     proposalId,
//                     "uploads/best_practice",
//                     userId,
//                     transaction
//                 );

//                 if (metadata?.length) {
//                     await DocumentModel.bulkCreate(metadata, { transaction });
//                 }
//             }
//         }

//         await transaction.commit();

//         return res.status(200).json({
//             message: isUpdate
//                 ? "Best Practice updated successfully."
//                 : "Best Practice created successfully.",
//             data: { tbp_id: bestPracticeId },
//             status: true,
//         });

//     } catch (err) {

//         if (transaction) await transaction.rollback();

//         console.error("Best Practice Create/Update Error:", err);

//         return next(
//             CustomErrorHandler.internalServerError({
//                 message: err.message,
//                 stack: err.stack,
//             })
//         );
//     }
// };



module.exports.getExcelExportBestPracticeList = async (req, res, next) => {
    try {
        // var sql = `select * from t_best_practice`;
         var sql = `
        SELECT 
            tbp.*,
            proj.tproj_proposal_name AS project_name,
            theme.tthm_theme_name AS theme_name,
            focus.tsubshcm_sub_schedule_name AS focus_area_name
        FROM t_best_practice tbp
        LEFT JOIN t_projects proj
            ON proj.tproj_id = tbp.tbp_project_id
        LEFT JOIN t_theme_master theme
            ON theme.tthm_theme_id = tbp.tbp_theme_id
        LEFT JOIN t_sub_schedule_master focus
            ON focus.tsubshcm_sub_schedule_id = tbp.tbp_focus_area_id
        `;
        // var where = `t_company.tcom_is_active = 'true' `;
        var where = null;


        var records = await Datatables.build(req, sql, where);

        res.json(records);
    } catch (err) {
        console.log(err);
        next(CustomErrorHandler.internalServerError(err.message));
    }
};

