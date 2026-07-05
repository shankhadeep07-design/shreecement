var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");

const CaseStudy = require("../../../models/case_study/case_study.model");
const DocumentModel = require("../../../models/documents/documents.model");

const {
    saveAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");


/* ===========================================================
   📊 FETCH DATATABLE LIST
=========================================================== */
module.exports.fetch_case_study_datatable = async (req, res, next) => {
    try {

        const file_url = process.env.SERVER_FILE_URL || "";

        const sql = `
        SELECT 
            tcs.*,
            proj.tproj_project_title AS project_name,
            theme.tthm_theme_name AS theme_name
        FROM t_case_study tcs
        LEFT JOIN t_projects proj
            ON proj.tproj_id = tcs.tcs_project_id
        LEFT JOIN t_theme_master theme
            ON theme.tthm_theme_id = tcs.tcs_theme_id
        `;

        const records = await Datatables.build(req, sql);

        const caseStudyIds = records.data.map(r => r.tcs_id);

        if (caseStudyIds.length > 0) {

            const documentSql = `
                SELECT 
                    td.final_doc_id AS tcs_id,
                    json_agg(
                        jsonb_build_object(
                            'tdoc_id', td.tdoc_id,
                            'title', td.doc_title,
                            'file_name', td.doc_name,
                            'full_url', :file_url || td.doc_path
                        )
                    ) AS documents
                FROM t_documents td
                WHERE td.doc_purpose = 'tcs_picture_documents'
                  AND td.final_doc_id IN (:ids)
                GROUP BY td.final_doc_id
            `;

            const documentRows = await sequelize.query(documentSql, {
                replacements: { file_url, ids: caseStudyIds },
                type: QueryTypes.SELECT,
            });

            const documentsMap = {};
            documentRows.forEach(row => {
                documentsMap[row.tcs_id] = row.documents || [];
            });

            records.data = records.data.map(row => ({
                ...row,
                documents: documentsMap[row.tcs_id] || []
            }));
        }

        res.json(records);

    } catch (err) {
        console.error(err);
        next(
            CustomErrorHandler.internalServerError({
                message: err.message,
                stack: err.stack,
            })
        );
    }
};



/* ===========================================================
   ➕ CREATE / UPDATE CASE STUDY
=========================================================== */
module.exports.createOrUpdateCaseStudy = async (req, res, next) => {

    const transaction = await sequelize.transaction();

    try {

        const formData = req.body;
        const created_by = req.user?.id || formData.tcs_created_by || 0;
        const files = req.files || [];

        let isUpdate = req.params.id || formData?.tcs_id || null;

        if (!isUpdate || isUpdate === "undefined" || isUpdate === "") {
            isUpdate = null;
        }

        let caseStudyId;

        /* =========================
           🔁 UPDATE MODE
        ========================== */
        if (isUpdate) {

            const caseStudy = await CaseStudy.findByPk(isUpdate, { transaction });

            if (!caseStudy) {
                throw new Error("Case Study not found for update.");
            }

            await caseStudy.update(
                {
                    tcs_project_id: formData.tcs_project_id,
                    tcs_theme_id: formData.tcs_theme_id,
                    tcs_problem: formData.tcs_problem,
                    tcs_solution: formData.tcs_solution,
                    tcs_benefit: formData.tcs_benefit,
                    tcs_is_active: formData.tcs_is_active ?? true,
                    tcs_updated_by: created_by,
                    tcs_updated_at: new Date(),
                },
                { transaction }
            );

            caseStudyId = caseStudy.tcs_id;
        }

        /* =========================
           ➕ CREATE MODE
        ========================== */
        else {

            const caseStudy = await CaseStudy.create(
                {
                    tcs_project_id: formData.tcs_project_id,
                    tcs_theme_id: formData.tcs_theme_id,
                    tcs_problem: formData.tcs_problem,
                    tcs_solution: formData.tcs_solution,
                    tcs_benefit: formData.tcs_benefit,
                    tcs_is_active: formData.tcs_is_active ?? true,
                    tcs_created_by: created_by,
                    tcs_updated_by: created_by,
                    tcs_created_at: new Date(),
                    tcs_updated_at: new Date(),
                },
                { transaction }
            );

            caseStudyId = caseStudy.tcs_id;
        }

        /* =========================
           📁 FILE UPLOAD
        ========================== */
        if (files.length > 0) {

            const groupedFiles = files.reduce((acc, file) => {
                if (!acc[file.fieldname]) {
                    acc[file.fieldname] = [];
                }
                acc[file.fieldname].push(file);
                return acc;
            }, {});

            if (groupedFiles.tcs_picture_documents?.length) {

                const { metadata } = await saveAndPrepareDocumentMetadata(
                    groupedFiles.tcs_picture_documents,
                    caseStudyId,
                    "uploads/case_study",
                    created_by,
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
                ? "Case Study updated successfully."
                : "Case Study created successfully.",
            data: { tcs_id: caseStudyId },
            status: true,
        });

    } catch (err) {

        if (transaction) await transaction.rollback();

        console.error("Case Study Create/Update Error:", err);

        return next(
            CustomErrorHandler.internalServerError({
                message: err.message,
                stack: err.stack,
            })
        );
    }
};



/* ===========================================================
   📥 EXCEL EXPORT
=========================================================== */
module.exports.getExcelExportCaseStudyList = async (req, res, next) => {
    try {

        const sql = `
        SELECT 
            tcs.*,
            proj.tproj_project_title AS project_name,
            theme.tthm_theme_name AS theme_name
        FROM t_case_study tcs
        LEFT JOIN t_projects proj
            ON proj.tproj_id = tcs.tcs_project_id
        LEFT JOIN t_theme_master theme
            ON theme.tthm_theme_id = tcs.tcs_theme_id
        `;

        const records = await Datatables.build(req, sql);

        res.json(records);

    } catch (err) {
        console.error(err);
        next(
            CustomErrorHandler.internalServerError({
                message: err.message,
                stack: err.stack,
            })
        );
    }
};


/* ===========================================================
    📊 THEME WISE PROJECTS LIST
=========================================================== */
module.exports.themeWiseProjectsList = async (req, res, next) => {
  try {

    let { theme_id } = req.body || {};

    console.log("Received theme_id:", theme_id);

    if (!theme_id) {
      return res.status(400).json({
        status: false,
        message: "theme_id is required"
      });
    }

    const sql = `
      SELECT
        proj.tproj_project_title AS label,
        proj.tproj_id AS value
      FROM t_projects proj
      WHERE proj.tproj_theme_id = :theme_id
      ORDER BY proj.tproj_project_title ASC
    `;

    const projects = await sequelize.query(sql, {
      replacements: { theme_id },
      type: QueryTypes.SELECT,
    });

    const records = {
      status: true,
      message: "Projects List",
      data: projects,
    };

    res.json(records);

  } catch (err) {

    console.error(err);

    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack
      })
    );

  }
};



module.exports.deleteCaseStudyDocument = async (req,res,next)=>{

try{

const { tdoc_id } = req.params;

await sequelize.query(
`
DELETE FROM t_documents
WHERE tdoc_id = :tdoc_id
`,
{
replacements:{tdoc_id}
}
);

res.json({
status:true,
message:"Image deleted successfully"
});

}catch(err){

next(err);

}
}