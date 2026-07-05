var { validationResult } = require("express-validator");
// const { getPermissionService } = require('../services/permission.service');
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes, Op } = require("sequelize");
// const ApprovalMasterListModel = require("../../../models/approval/ApprovalMaster.model");
const { getApprovalPathDatatable } = require("../services/approval.service");
const ApprovalMasterListModel = require("../../../models/approval/ApprovalMasterList.model");
const { ApprovalChannelModel } = require("../../../models/approval/ApprovalChannel.model");
const { isEmpty } = require("../../../helpers/common.helper");



// module.exports.fetch_parent_module_permission = async (req, res) => {
//   try {
//     const validation_errors = validationResult(req);
//     console.log('----------------------------------------',req.body);
    
//     if (!validation_errors.isEmpty()) {
//       return next(
//         CustomErrorHandler.validationError(validation_errors.array()[0]["msg"])
//       );
//     }

//     const { role_id } = req.body.payload;
//     const { module_slug } = req.body;

//     if (!role_id || !module_slug) {
//       return next(CustomErrorHandler.validationError("role_id and module_slug are required"));
//     }

//     const query = `
//       SELECT tmd_slug_name
//       FROM public.t_permissions as permissions
//       LEFT JOIN t_modules ON tmd_id = permissions.tpr_module_id
//       WHERE tpr_role_id = :role_id;
//     `;

//     const entries = await sequelize.query(query, {
//       type: QueryTypes.SELECT,
//       replacements: { role_id, module_slug }, // Use replacements to prevent SQL injection
//     });

//     if (!entries.length) {
//       return res.status(200).json({
//         status: 0,
//         message: "No permissions found for the given role and module",
//         data: [],
//       });
//     }

//     const slugNames = entries.map(entry => entry.tmd_slug_name);

    
//     return res.status(200).json({
//       status: 1,
//       message: "Permission fetched successfully",
//       data: slugNames,
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports.fetch_my_module_permission = async function (req, res, next) {
//   try {
//     const validation_errors = validationResult(req);

//     if (!validation_errors.isEmpty()) {
//       return next(
//         CustomErrorHandler.validationError(validation_errors.array()[0]["msg"])
//       );
//     }

//     const { role_id } = req.body.payload;
//     const { module_slug } = req.body;

//     if (!role_id || !module_slug) {
//       return next(CustomErrorHandler.validationError("role_id and module_slug are required"));
//     }

//     const query = `
//       SELECT permissions.tpr_actions, tmd_slug_name
//       FROM public.t_permissions as permissions
//       LEFT JOIN t_modules ON tmd_id = permissions.tpr_module_id
//       WHERE tpr_role_id = :role_id AND tmd_slug_name = :module_slug;
//     `;

//     const entries = await sequelize.query(query, {
//       type: QueryTypes.SELECT,
//       replacements: { role_id, module_slug }, // Use replacements to prevent SQL injection
//     });

//     if (!entries.length || !entries[0].tpr_actions) {
//       return res.status(200).json({
//         status: 0,
//         message: "No permissions found for the given role and module",
//         data: [],
//       });
//     }

//     const actions = entries[0].tpr_actions.split(','); // Ensure tpr_actions exists
    

//     return res.status(200).json({
//       status: 1,
//       message: "Permission fetched successfully",
//       data: actions,
//     });

//   } catch (err) {
//     console.error('Error in getMyModulePermissions:', err);
//     next(CustomErrorHandler.databaseError(err.message));
//   }
// };

module.exports.getAllApprovalMasterList = async (req, res, next) => {
  try {

    // Fetch approvalMasterList
    const approvalMasterList = await ApprovalMasterListModel.findAll({
      order: [["taml_approval_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = approvalMasterList.map((department) => ({
      taml_id: department?.taml_id,
      taml_approval_name: department?.taml_approval_name,
      taml_slug: department?.taml_slug,
    }));

    return res.status(200).json({
      status: true,
      message: "Approval Master List fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getDepartmentList = async (req, res, next) => {
  try {
    var sql = `SELECT * 
    FROM t_department
    ORDER BY td_department_name DESC
    `;
    const data = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })



    res.json({
      status: 1,
      message: "Department List",
      data: data // Sending the created ID in the response
    });
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.getLocationsList = async (req, res, next) => {
  try {
    var sql = `SELECT * 
    FROM t_location
    ORDER BY tloc_location_name DESC
    `;
    const data = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })



    res.json({
      status: 1,
      message: "Location List",
      data: data // Sending the created ID in the response
    });
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.datatable = async function(req, res, next) {
    try{
        var records = await getApprovalPathDatatable(req);
        res.json(records);
    }catch(err){
        next(CustomErrorHandler.internalServerError({message: err.message, stack : err.stack}));
    }
}





module.exports.approvalPathCreate = async (req, res, next) => {
    // console.log("req.body ",req.body);
  
   const masterlistSlug=await ApprovalMasterListModel.findAll(
    {
      attributes: ['taml_slug'],
      where : {
        taml_id : req.body?.tac_approval_master_id

      }
    }
  );

   
    
    try{
        const newApprovalPathData = await ApprovalChannelModel.create({
            tac_module_name: req.body?.tac_module_name,
             tac_from_amount: req.body?.tac_from_amount,
            tac_to_amount: req.body?.tac_to_amount,
            tac_approved_type: req.body?.tac_approved_type,
            tac_module_id: masterlistSlug[0]?.taml_slug,
            tac_bu_id : req.body?.tac_bu_id,
            tac_approval_master_id: req.body?.tac_approval_master_id,
            tac_initiator_role_id: req.body?.tac_initiator_role_id,
            tac_status:"draft",
            tac_created_by: req.body?.payload?.id,
            tac_updated_by: req.body?.payload?.id,

            tac_approval_json: req.body?.tac_approval_json,


        })


      return res.status(200).json({
        status: 1,
        message: "Approval path created successfully",
        data: newApprovalPathData,
      });
    }catch(err){
        next(CustomErrorHandler.internalServerError({message: err.message}));
    }
}

  module.exports.approvalPathUpdate = async (req, res) => {
      const id = !isEmpty(req.params.id) && req.params.id;
      
      const masterlistSlug=await ApprovalMasterListModel.findAll({attributes: ['taml_slug'],where : {taml_id : req.body?.tac_approval_master_id}});
      
      const formData = req?.body;

      console.log("req.body ",req.body);
    
    const requestData = {
      tac_status:"draft",
      tac_module_id: masterlistSlug[0]?.taml_slug,
      ...(formData.tac_module_name && {
        tac_module_name: formData.tac_module_name,
      }),

      ...(formData.tac_from_amount && {
        tac_from_amount: formData.tac_from_amount,
      }),
      ...(formData.tac_to_amount && {
        tac_to_amount: formData.tac_to_amount,
      }),
      ...(formData.tac_approval_master_id && {
        tac_approval_master_id: formData.tac_approval_master_id,
      }),
      ...(formData.tac_initiator_role_id && {
        tac_initiator_role_id: formData.tac_initiator_role_id,
      }),
      ...(formData.tac_bu_id && {
        tac_bu_id: formData.tac_bu_id,
      }),
      ...(formData.tac_approval_json && {
        tac_approval_json: formData.tac_approval_json,
      }),
       ...(formData.tac_approved_type && {
        tac_approved_type: formData.tac_approved_type,
      }),
           
    };
  
    
    if (id) {
      // Update record: Add updated_by field
      requestData.tac_updated_by = req.body.payload?.id;
            requestData.tac_updated_at = new Date();

    } 
    
    
  
    if (Object.keys(requestData).length > 0) {
      if (id) {
        const approvalPathData = await ApprovalChannelModel.findOne({
          where: { tac_id: id },
        });
        
        if (!approvalPathData) {
          return res.status(404).json({
            status: false,
            message: "Approval path not found",
          });
        }
        const newApprovalPathData = await approvalPathData.update(requestData, { where: { tac_id: id } })
       
  
        return res.status(201).json({
          status: true,
          message: "Approval path updated successfully",
          data: newApprovalPathData,
        });
      } 
    } else {
      res.json({ status: 0, message: "No data to process." });
    }
  };


  // Approval List Details Api
  
  module.exports.approvalListDetails = async (req, res, next) => {
  
      try {
  
          if(isEmpty(req.params?.id)){
                  next(CustomErrorHandler.inValidRequestBodyError("Invalid request body"));
              }
       
        const query = `SELECT * from t_approval_channel
        LEFT JOIN t_roles ON trl_role_id = tac_initiator_role_id
        WHERE tac_id = '${req?.params?.id}'
        `;
        const data = await sequelize.query(query, {
          type: sequelize.QueryTypes.SELECT,
        });
  
  
  
        res.json({
          status : 1,
          message : "Approval List Details Fetched successfully",
          data: data
      })
      } catch (err) {
          next(CustomErrorHandler.internalServerError({message: err.message}));
         
      }
    };
  

    // Approval Status Update Api
  module.exports.approvalPathStatusUpdate = async (req, res) => {
    const id = !isEmpty(req.params.id) && req.params.id;

    // console.log(req.body.record);return
    

  if (Object.keys(req?.body).length > 0) {
    if (id) {


      if(req?.body.checked == true){
     
        const newApprovalPathData = await ApprovalChannelModel.update(
          { tac_status: "inactive" },
          {
            where: {
              tac_module_id: req?.body?.record?.tac_module_id,
              tac_initiator_role_id: req?.body?.record?.tac_initiator_role_id,
              tac_status: {
                [Op.ne]: "draft"
              }
            }
          }
        );
      
        const newApprovalPathData2 = await ApprovalChannelModel.update({tac_status:"active",tac_published_date: new Date()}, { where: { tac_id: req?.body?.record?.tac_id } });
            
      }


      return res.status(200).json({
        status: 0,
        message: "Approval Status updated successfully",
      });
    } 
  } else {
    res.json({ status: 0, message: "No data to process." });
  }
};



  // Approval Path copy
  module.exports.copyApprovalPathFunction = async (req, res) => {
    const id = !isEmpty(req.params.id) && req.params.id;

    // console.log(req.body.record);return
    

  if (Object.keys(req?.body).length > 0) {
    if (id) {

     
        const approvalPathData = await ApprovalChannelModel.findOne(
          {
            where: {
              tac_id: id,
            }
          }
        );

        const newApprovalPathData = await ApprovalChannelModel.create({
          tac_module_name: approvalPathData.dataValues?.tac_module_name ? approvalPathData.dataValues?.tac_module_name+'- Copy' :'Copy',
          tac_module_id: approvalPathData.dataValues?.tac_module_id,
          tac_approval_master_id: approvalPathData.dataValues?.tac_approval_master_id,
          tac_initiator_role_id: approvalPathData.dataValues?.tac_initiator_role_id,
          tac_status:"draft",
          tac_created_by: approvalPathData.dataValues?.payload?.id,
          tac_approval_json: approvalPathData.dataValues?.tac_approval_json,
          tac_updated_by: approvalPathData.dataValues?.payload?.id,
        })


      return res.status(200).json({
        status: 1,
        message: "Approval Copy successfully",
      });
    } 
  } else {
    res.json({ status: 0, message: "No data to process." });
  }
};


module.exports.approvalUsersFunction = async (req, res, next) => {
  let { 
    item_row_id, 
    approval_id, 
    approvar_index, 
    type, 
    previous_present_next, 
    bu_id, 
    state_id,
    district_id,
    block_id, 
  } = req.body;

  const role_id = req.body.payload?.role_id;

  try {


    let master_amount = 0;
    let approved_type ='';
    if (type == "project") {
      const project_sql = `SELECT tproj_id,tproj_approved_type, tproj_budget_amount FROM t_projects WHERE tproj_id = :item_row_id`;
      const project_data = await sequelize.query(project_sql, {
        replacements: { item_row_id },
        type: sequelize.QueryTypes.SELECT,
      });

      master_amount = project_data[0]?.tproj_budget_amount || 0;
      approved_type = project_data[0]?.tproj_approved_type || '';
    } else if (type == "budgeting") {
      const budget_sql = `SELECT tbm_id, tbm_proposed_total_amount FROM t_budget_master WHERE tbm_id = :item_row_id`;
      const budget_data = await sequelize.query(budget_sql, {
        replacements: { item_row_id },
        type: sequelize.QueryTypes.SELECT,
      });

      master_amount = budget_data[0]?.tbm_proposed_total_amount || 0;
    }

    // Handle initial stage if no approval ID or index is provided
    if (approval_id == null && approvar_index == null) {
        let sql = `
          SELECT master ->> 'role_id' AS role_id
          FROM t_approval_channel,
              jsonb_array_elements(tac_approval_json) AS master
          WHERE (master ->> 'sequence')::int = 1
            AND tac_status = 'active'
            AND tac_module_id = :type
            AND tac_bu_id = :bu_id
            AND tac_from_amount <= :master_amount
            AND tac_to_amount >= :master_amount
            AND tac_initiator_role_id = :role_id
      `;

      if (type === "project") {
        sql += ` AND tac_approved_type = :approved_type`;
      }

      const role_data = await sequelize.query(sql, {
        replacements: {
          role_id,
          type,
          bu_id,
          master_amount,
          approved_type
        },
        type: sequelize.QueryTypes.SELECT,
      });

        if (!role_data.length) {
          return res.status(200).json({
            data: [],
            status: 0,
            message: "No roles found for the given approval step.",
          });
        }

        const forwardRoleIds = role_data.map(r => r.role_id);

        // Fetch geography details if not provided in request
        if (!state_id || !district_id) {
            let geo_sql = "";
            if (type === "project") {
              geo_sql = `SELECT tproj_state_id as state_id, tproj_district_id as district_id FROM t_projects WHERE tproj_id = :item_row_id`;
            } else {
              geo_sql = `SELECT tbm_state_id as state_id, tbm_district_id as district_id FROM t_budget_master WHERE tbm_id = :item_row_id`;
            }
            const geo_data = await sequelize.query(geo_sql, {
              replacements: { item_row_id },
              type: sequelize.QueryTypes.SELECT,
            });
            if (geo_data.length > 0) {
              state_id = geo_data[0].state_id;
              district_id = geo_data[0].district_id;
            }
        }
      
        const users_sql = `
          SELECT DISTINCT users.id, users.name
          FROM public.t_user_state_district
          JOIN users ON users.id = t_user_state_district.tus_user_id
          WHERE role_id IN (:forwardRoleIds)
            AND tus_state_id = :state_id
            AND tus_district_id = :district_id;
        `;
      
        const usersList = await sequelize.query(users_sql, {
          replacements: { forwardRoleIds, state_id, district_id },
          type: sequelize.QueryTypes.SELECT,
        });

        return res.status(200).json({
          status: 1,
          data: usersList,
          approval_details: {},
          message: "Users fetched successfully.",
        });
      
    } else {
      const approverIndex = parseInt(approvar_index) || 1;
      const targetSequence = previous_present_next === 'previous'
        ? approverIndex - 1
        : previous_present_next === 'present'
        ? approverIndex
        : approverIndex + 1;
      
      const roleQuery = (previous_present_next === 'previous' && approverIndex === 1)
        ? `
            SELECT tac_initiator_role_id AS role_id
            FROM t_approval_channel
            WHERE tac_id = :approval_id;
          `
        : `
            SELECT master ->> 'role_id' AS role_id
            FROM t_approval_channel,
            jsonb_array_elements(tac_approval_json) AS master
            WHERE (master ->> 'sequence')::int = :targetSequence
            AND tac_id = :approval_id;
          `;
      
      const role_data = await sequelize.query(roleQuery, {
        replacements: (previous_present_next === 'previous' && approverIndex === 1)
          ? { approval_id }
          : { approval_id, targetSequence },
        type: sequelize.QueryTypes.SELECT,
      });
      
      if (!role_data.length) {
        return res.status(200).json({ status: 0, data: [], message: "No roles found for the given approval step." });
      }
      
      const forwardRoleIds = role_data.map(r => `'${r.role_id}'`).join(",");
      
      // Fetch geography details if not provided
      if (!state_id || !district_id) {
          let geo_sql = "";
          if (type === "project") {
            geo_sql = `SELECT tproj_state_id as state_id, tproj_district_id as district_id FROM t_projects WHERE tproj_id = :item_row_id`;
          } else {
            geo_sql = `SELECT tbm_state_id as state_id, tbm_district_id as district_id FROM t_budget_master WHERE tbm_id = :item_row_id`;
          }
          const geo_data = await sequelize.query(geo_sql, {
            replacements: { item_row_id },
            type: sequelize.QueryTypes.SELECT,
          });
          if (geo_data.length > 0) {
            state_id = geo_data[0].state_id;
            district_id = geo_data[0].district_id;
          }
      }
      
      const usersList = await sequelize.query(
        `
        SELECT DISTINCT users.id, users.name
        FROM public.t_user_state_district
        JOIN users ON users.id = t_user_state_district.tus_user_id
        WHERE role_id IN (${forwardRoleIds})
          AND tus_state_id = :state_id
          AND tus_district_id = :district_id;
        `,
        {
          replacements: { state_id, district_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
    
      let approval_details_sql = `SELECT master 
          FROM t_approval_channel,
          jsonb_array_elements(tac_approval_json) AS master
          WHERE (master ->> 'sequence')::int = :targetSequence
          AND tac_id = :approval_id;`;
                
      const approval_details = await sequelize.query(approval_details_sql, {
        replacements: { approval_id, targetSequence },
        type: sequelize.QueryTypes.SELECT,
      });

      return res.status(200).json({
        status: 1,
        data: usersList,
        approval_details: approval_details?.[0]?.master || null,
        message: "Users fetched successfully.",
      });
    }
  } catch (error) {
    next(CustomErrorHandler.databaseError(error.message));
  }
};

module.exports.approvalProjectClosureUsersFunction = async (req, res, next) => {
  let { 
    item_row_id, 
    approval_id, 
    approvar_index, 
    type, 
    previous_present_next, 
    state_id,
    district_id,
    block_id, 
  } = req.body;

  const role_id = req.body.payload?.role_id;

  try {
    // Handle initial stage if no approval ID or index is provided
    if (approval_id == null && approvar_index == null) {
        const sql = `
          SELECT master ->> 'role_id' AS role_id
          FROM t_approval_channel,
               jsonb_array_elements(tac_approval_json) AS master
          WHERE (master ->> 'sequence')::int = 1
            AND tac_status = 'active'
            AND tac_module_id = :type
            AND tac_initiator_role_id = :role_id;
        `;
      
        const role_data = await sequelize.query(sql, {
          replacements: { role_id ,type},
          type: sequelize.QueryTypes.SELECT,
        });

        if (!role_data.length) {
          return res.status(200).json({
            data: [],
            status: 0,
            message: "No roles found for the given approval step.",
          });
        }

        const forwardRoleIds = role_data.map(r => r.role_id);

      
      
        const users_sql = `
          SELECT DISTINCT users.id, users.name
          FROM public.users
          WHERE role_id IN (:forwardRoleIds);
        `;
      
        const usersList = await sequelize.query(users_sql, {
          replacements: { forwardRoleIds },
          type: sequelize.QueryTypes.SELECT,
        });

        return res.status(200).json({
          status: 1,
          data: usersList,
          approval_details: {},
          message: "Users fetched successfully.",
        });
      
    } else {
      const approverIndex = parseInt(approvar_index) || 1;
      const targetSequence = previous_present_next === 'previous'
        ? approverIndex - 1
        : previous_present_next === 'present'
        ? approverIndex
        : approverIndex + 1;
      
      const roleQuery = (previous_present_next === 'previous' && approverIndex === 1)
        ? `
            SELECT tac_initiator_role_id AS role_id
            FROM t_approval_channel
            WHERE tac_id = :approval_id;
          `
        : `
            SELECT master ->> 'role_id' AS role_id
            FROM t_approval_channel,
            jsonb_array_elements(tac_approval_json) AS master
            WHERE (master ->> 'sequence')::int = :targetSequence
            AND tac_id = :approval_id;
          `;
      
      const role_data = await sequelize.query(roleQuery, {
        replacements: (previous_present_next === 'previous' && approverIndex === 1)
          ? { approval_id }
          : { approval_id, targetSequence },
        type: sequelize.QueryTypes.SELECT,
      });
      
      if (!role_data.length) {
        return res.status(200).json({ status: 0, data: [], message: "No roles found for the given approval step." });
      }
      
      const forwardRoleIds = role_data.map(r => `'${r.role_id}'`).join(",");
      
      // Fetch geography details if not provided
      if (!state_id || !district_id) {
          let geo_sql = "";
          if (type === "project") {
            geo_sql = `SELECT tproj_state_id as state_id, tproj_district_id as district_id FROM t_projects WHERE tproj_id = :item_row_id`;
          } else {
            geo_sql = `SELECT tbm_state_id as state_id, tbm_district_id as district_id FROM t_budget_master WHERE tbm_id = :item_row_id`;
          }
          const geo_data = await sequelize.query(geo_sql, {
            replacements: { item_row_id },
            type: sequelize.QueryTypes.SELECT,
          });
          if (geo_data.length > 0) {
            state_id = geo_data[0].state_id;
            district_id = geo_data[0].district_id;
          }
      }
      
      const usersList = await sequelize.query(
        `
        SELECT DISTINCT users.id, users.name
        FROM public.t_user_state_district
        JOIN users ON users.id = t_user_state_district.tus_user_id
        WHERE role_id IN (${forwardRoleIds})
          AND tus_state_id = :state_id
          AND tus_district_id = :district_id;
        `,
        {
          replacements: { state_id, district_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
    
      let approval_details_sql = `SELECT master 
          FROM t_approval_channel,
          jsonb_array_elements(tac_approval_json) AS master
          WHERE (master ->> 'sequence')::int = :targetSequence
          AND tac_id = :approval_id;`;
                
      const approval_details = await sequelize.query(approval_details_sql, {
        replacements: { approval_id, targetSequence },
        type: sequelize.QueryTypes.SELECT,
      });

      return res.status(200).json({
        status: 1,
        data: usersList,
        approval_details: approval_details?.[0]?.master || null,
        message: "Users fetched successfully.",
      });
    }
  } catch (error) {
    next(CustomErrorHandler.databaseError(error.message));
  }
};



