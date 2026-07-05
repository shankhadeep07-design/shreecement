var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");

const DocumentModel = require("../../../models/documents/documents.model");

const {
    saveAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const Gallery = require("../../../models/gallery/gallery.model");


/* ===========================================================
   📊 FETCH DATATABLE LIST
=========================================================== */
// module.exports.fetch_gallery_datatable = async (req, res, next) => {
//     try {

//         const file_url = process.env.SERVER_FILE_URL || "";

//         const sql = `
//         SELECT 
//             tcs.*,
//             proj.tproj_proposal_name AS project_name,
//             theme.tthm_theme_name AS theme_name
//         FROM t_case_study tcs
//         LEFT JOIN t_projects proj
//             ON proj.tproj_id = tcs.tgl_project_id
//         LEFT JOIN t_theme_master theme
//             ON theme.tthm_theme_id = tcs.tgl_theme_id
//         `;

//         const records = await Datatables.build(req, sql);

//         const GalleryIds = records.data.map(r => r.tgl_id);

//         if (GalleryIds.length > 0) {

//             const documentSql = `
//                 SELECT 
//                     td.final_doc_id AS tgl_id,
//                     json_agg(
//                         jsonb_build_object(
//                             'tdoc_id', td.tdoc_id,
//                             'title', td.doc_title,
//                             'file_name', td.doc_name,
//                             'full_url', :file_url || td.doc_path
//                         )
//                     ) AS documents
//                 FROM t_documents td
//                 WHERE td.doc_purpose = 'tgl_gallery_images'
//                   AND td.final_doc_id IN (:ids)
//                 GROUP BY td.final_doc_id
//             `;

//             const documentRows = await sequelize.query(documentSql, {
//                 replacements: { file_url, ids: GalleryIds },
//                 type: QueryTypes.SELECT,
//             });

//             const documentsMap = {};
//             documentRows.forEach(row => {
//                 documentsMap[row.tgl_id] = row.documents || [];
//             });

//             records.data = records.data.map(row => ({
//                 ...row,
//                 documents: documentsMap[row.tgl_id] || []
//             }));
//         }

//         res.json(records);

//     } catch (err) {
//         console.error(err);
//         next(
//             CustomErrorHandler.internalServerError({
//                 message: err.message,
//                 stack: err.stack,
//             })
//         );
//     }
// };


module.exports.fetch_gallery_datatable = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 12;
    const offset = (page - 1) * limit;

    // Query to get total count
    const countSql = `
      SELECT COUNT(*) AS total FROM t_gallery tgl
      LEFT JOIN t_projects proj ON proj.tproj_id = tgl.tgl_project_id
      LEFT JOIN t_theme_master theme ON theme.tthm_theme_id = tgl.tgl_theme_id
    `;
    const totalResult = await sequelize.query(countSql, { type: QueryTypes.SELECT });
    const totalRecords = parseInt(totalResult[0].total);

    // Main query with limit and offset for pagination
    const sql = `
      SELECT 
        tgl.*,
        proj.tproj_project_title AS project_name,
        theme.tthm_theme_name AS theme_name
      FROM t_gallery tgl
      LEFT JOIN t_projects proj ON proj.tproj_id = tgl.tgl_project_id
      LEFT JOIN t_theme_master theme ON theme.tthm_theme_id = tgl.tgl_theme_id
      ORDER BY tgl.tgl_id DESC
      LIMIT :limit OFFSET :offset
    `;

    const records = await sequelize.query(sql, {
      replacements: { limit, offset },
      type: QueryTypes.SELECT,
    });

    const galleryIds = records.map(r => r.tgl_id);

    let documentsMap = {};
    if (galleryIds.length > 0) {
      const documentSql = `
        SELECT 
          td.final_doc_id AS tgl_id,
          json_agg(
            jsonb_build_object(
              'tdoc_id', td.tdoc_id,
              'title', td.doc_title,
              'file_name', td.doc_name,
              'full_url', :file_url || td.doc_path
            )
          ) AS documents
        FROM t_documents td
        WHERE td.doc_purpose = 'tgl_gallery_images'
          AND td.final_doc_id IN (:ids)
        GROUP BY td.final_doc_id
      `;
      const documentRows = await sequelize.query(documentSql, {
        replacements: { file_url, ids: galleryIds },
        type: QueryTypes.SELECT,
      });

      documentRows.forEach(row => {
        documentsMap[row.tgl_id] = row.documents || [];
      });
    }

    const paginatedData = records.map(row => ({
      ...row,
      documents: documentsMap[row.tgl_id] || [],
    }));

    res.json({
      data: paginatedData,
      total: totalRecords,
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
    });

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
   ➕ CREATE / UPDATE GALLERY
=========================================================== */
module.exports.createOrUpdateGallery = async (req, res, next) => {

    const transaction = await sequelize.transaction();

    try {

        const formData = req.body;
        const created_by = req.user?.id || formData.tgl_created_by || 0;
        const files = req.files || [];

        let isUpdate = req.params.id || formData?.tgl_id || null;

        if (!isUpdate || isUpdate === "undefined" || isUpdate === "") {
            isUpdate = null;
        }

        let GalleryId;

        /* =========================
           🔁 UPDATE MODE
        ========================== */
        if (isUpdate) {

            const GalleryData = await Gallery.findByPk(isUpdate, { transaction });

            if (!GalleryData) {
                throw new Error("Gallery not found for update.");
            }

            await Gallery.update(
                {
                    tgl_project_id: formData.tgl_project_id,
                    tgl_theme_id: formData.tgl_theme_id,
                    tgl_problem: formData.tgl_problem,
                    tgl_solution: formData.tgl_solution,
                    tgl_benefit: formData.tgl_benefit,
                    tgl_is_active: formData.tgl_is_active ?? true,
                    tgl_updated_by: created_by,
                    tgl_updated_at: new Date(),
                },
                {  where: { tgl_id: isUpdate }, transaction }
            );

            GalleryId = GalleryData.tgl_id;
        }

        /* =========================
           ➕ CREATE MODE
        ========================== */
        else {

            const GalleryData = await Gallery.create(
                {
                    tgl_project_id: formData.tgl_project_id,
                    tgl_theme_id: formData.tgl_theme_id,
                    tgl_problem: formData.tgl_problem,
                    tgl_solution: formData.tgl_solution,
                    tgl_benefit: formData.tgl_benefit,
                    tgl_is_active: formData.tgl_is_active ?? true,
                    tgl_created_by: created_by,
                    tgl_updated_by: created_by,
                    tgl_created_at: new Date(),
                    tgl_updated_at: new Date(),
                },
                { transaction }
            );

            GalleryId = GalleryData.tgl_id;
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

            if (groupedFiles.tgl_gallery_images?.length) {

                const { metadata } = await saveAndPrepareDocumentMetadata(
                    groupedFiles.tgl_gallery_images,
                    GalleryId,
                    "uploads/gallery",
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
                ? "Gallery updated successfully."
                : "Gallery created successfully.",
            data: { tgl_id: GalleryId },
            status: true,
        });

    } catch (err) {

        if (transaction) await transaction.rollback();

        console.error("Gallery Create/Update Error:", err);

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
module.exports.getExcelExportGalleryList = async (req, res, next) => {
    try {

        const sql = `
        SELECT 
            tcs.*,
            proj.tproj_proposal_name AS project_name,
            theme.tthm_theme_name AS theme_name
        FROM t_case_study tcs
        LEFT JOIN t_projects proj
            ON proj.tproj_id = tcs.tgl_project_id
        LEFT JOIN t_theme_master theme
            ON theme.tthm_theme_id = tcs.tgl_theme_id
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


module.exports.deleteGalleryImage = async (req,res,next)=>{

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