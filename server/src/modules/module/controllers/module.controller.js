var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
var {validationResult} = require('express-validator');
const ModuleModel = require("../../../models/module/module.model");
const {convertToSlug, isEmpty} =require("../../../helpers/common.helper");


module.exports.getModule=async(req,res,next)=>{
    try {
        const query = `SELECT t_modules.*, JSON_AGG(t_actions.*) as actions_data FROM t_modules LEFT JOIN t_actions ON t_actions.tac_name_slug = ANY(string_to_array(tmd_actions,','))
        WHERE tmd_fl_archive = 'N' AND tac_deleted_at is null
        GROUP BY tmd_id order by MAX(tmd_name);`;
      
        const menuList = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
          });
        res.status(200).json({
            status:1,
            message:"menu fetched succesfully",
            data:menuList
        })
    } catch (error) {
        next(CustomErrorHandler.databaseError(error.message));
    }
}

module.exports.updatemenu=async(req,res,next)=>{
    const { tmd_id, tmd_name } = req.body;
    const validation_errors = validationResult(req);
    if(!validation_errors.isEmpty()){
        next(CustomErrorHandler.validationError(validation_errors.array()[0]['msg']));
    }else{

        if(tmd_id && tmd_name){
            try {
                const updatedVillage=await ModuleModel.update(
                    {tmd_name:tmd_name},
                    {where:{tmd_id:tmd_id}})
                    if (updatedVillage[0] === 1) {
                        res.status(200).json({
                            status: 1,
                            message: 'menu  updated successfully'
                        });
                    } else {
                        res.status(404).json({
                            status: 0,
                            message: 'menu not found'
                        });
                    }
            } catch (error) {
                next(CustomErrorHandler.databaseError(error.message));
            }
        }else{

            res.status(400).json({
                status: 0,
                message: 'New menu name is required'
            });
        }
    }
}

module.exports.createmenu=async(req,res,next)=>{
    const {tmd_name,tmd_created_by, tmd_actions, tmd_id}=req.body
    const validation_errors=validationResult(req)
    if(!validation_errors.isEmpty()){
        next(CustomErrorHandler.validationError(validationResult.array()[0]['msg']));
    }else{
        const where = {
            tmd_name: tmd_name,
            ...(!isEmpty(tmd_id) && { tmd_id: {[Op.ne]: tmd_id} })
        };
        
        const alreadymenuName = await ModuleModel.count({where: where});
        
         try {
            if(alreadymenuName > 0){
                res.status(400).json({
                    status:0,
                    message:"Module is already exists"
                })
            }else{

            if(isEmpty(tmd_id))
            {
                await ModuleModel.create({
                    tmd_name: tmd_name,
                    tmd_actions: tmd_actions,
                    tmd_created_at: new Date(),
                    tmd_updated_at: new Date(),
                    tmd_slug_name:convertToSlug(tmd_name),
                })
            }
            else
            {
                await ModuleModel.update({
                    tmd_name: tmd_name,
                    tmd_actions: tmd_actions,
                    tmd_created_at: new Date(),
                    tmd_updated_at: new Date(),
                    tmd_slug_name:convertToSlug(tmd_name),
                },{where : {tmd_id : tmd_id}})
            }

              res.status(200).json({
                    status:1,
                    message:"Menu submited sucessfully"
              })
            }
        } catch (error) {
            next(CustomErrorHandler.databaseError(error.message));
        }
    }
}

module.exports.deletemenu=async(req,res,next)=>{
    const {id}= req.params;
    
    const validation_errors = validationResult(req);
    if(!validation_errors.isEmpty()){
        next(CustomErrorHandler.validationError(validation_errors.array()[0]['msg']));
    }else{

        if(id){
            try {
                const deleteVillage=await ModuleModel.destroy(
                    {where:{tmd_id:id}})
                    res.status(200).json({
                        status: 1,
                        message: 'menu  deleted successfully',
                        data:deleteVillage
                    });
            } catch (error) {
                next(CustomErrorHandler.databaseError(error.message));
            }
        }else{

            res.status(400).json({
                status: 0,
                message: 'Something went wrong'
            });
        }
    }
}


