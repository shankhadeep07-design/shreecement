// // const { sequelize, DataTypes } = require('../../config/db');

// // const ProjectsModel = sequelize.define('t_projects', {

// //     tproj_id: {
// //         type: DataTypes.STRING(255),
// //         primaryKey: true,
// //         defaultValue: sequelize.literal(`('tproj'::text || lpad(((nextval('t_projects_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
// //     },

// //     tproj_proposal_id: {
// //         type: DataTypes.STRING(255),
// //         allowNull: true
// //     },

// //     tproj_financial_year_id: {
// //         type: DataTypes.STRING(100),
// //         allowNull: true
// //     },

// //     tproj_state_id: {
// //         type: DataTypes.STRING(100),
// //         allowNull: true
// //     },

// //     tproj_district_id: {
// //         type: DataTypes.STRING(100),
// //         allowNull: true
// //     },

// //     tproj_block_id: {
// //         type: DataTypes.STRING(100),
// //         allowNull: true
// //     },

// //     tproj_location_id: {
// //         type: DataTypes.STRING(100),
// //         allowNull: true
// //     },

// //     tproj_latitude: {
// //         type: DataTypes.DOUBLE,
// //         allowNull: true
// //     },

// //     tproj_longitude: {
// //         type: DataTypes.DOUBLE,
// //         allowNull: true
// //     },

// //     tproj_theme_id: {
// //         type: DataTypes.STRING(100),
// //         allowNull: true
// //     },

// //     tproj_proposal_name: {
// //         type: DataTypes.STRING(255),
// //         allowNull: true
// //     },

// //     tproj_project_type_id: {
// //         type: DataTypes.STRING(255),
// //         allowNull: true
// //     },

// //     tproj_sub_project_id: {
// //         type: DataTypes.STRING(255),
// //         allowNull: true
// //     },

// //     tproj_sdg_id: {
// //         type: DataTypes.STRING(255),
// //         allowNull: true
// //     },

// //     tproj_schedule_seven_id: {
// //         type: DataTypes.STRING(255),
// //         allowNull: true
// //     },

// //     tproj_allocate_budget_amount: {
// //         type: DataTypes.DOUBLE,
// //         allowNull: true
// //     },

// //     utilized_till_today: {
// //         type: DataTypes.DOUBLE,
// //         allowNull: true
// //     },

// //     tproj_fl_archive: {
// //         type: DataTypes.STRING(1),
// //         defaultValue: 'N'
// //     },

// //     tproj_created_by: {
// //         type: DataTypes.BIGINT,
// //         defaultValue: 0
// //     },

// //     tproj_updated_by: {
// //         type: DataTypes.BIGINT,
// //         defaultValue: 0
// //     },

// //     tproj_created_at: {
// //         type: DataTypes.DATE,
// //         allowNull: false,
// //         defaultValue: sequelize.literal('now()')
// //     },

// //     tproj_updated_at: {
// //         type: DataTypes.DATE,
// //         allowNull: false,
// //         defaultValue: sequelize.literal('now()')
// //     },

// //     tproj_deleted_at: {
// //         type: DataTypes.DATE,
// //         allowNull: true
// //     }

// // }, {
// //     tableName: 't_projects',
// //     timestamps: false,
// //     freezeTableName: true
// // });

// // module.exports = ProjectsModel;
// const { sequelize, DataTypes } = require("../../config/db");

// const ProjectModel = sequelize.define(
//   "t_projects",
//   {
//     tproj_id: {
//       type: DataTypes.STRING(255),
//       primaryKey: true,
//       defaultValue: sequelize.literal(
//         `('tproj'::text || lpad(((nextval('t_projects_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
//       ),
//     },

//     tproj_budgets_id: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_budget_master_id: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_sdg_id: {
//       type: DataTypes.JSON,
//       allowNull: true,
//     },

//     tproj_project_title: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_project_desc: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_project_start_date: {
//       type: DataTypes.DATEONLY,
//       allowNull: true,
//     },

//     tproj_project_end_date: {
//       type: DataTypes.DATEONLY,
//       allowNull: true,
//     },

//     tproj_project_started_necessarily: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_budget_amount: {
//       type: DataTypes.DOUBLE,
//       allowNull: true,
//     },

//     tproj_baseline_info: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_implement_partner_id: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_monitoring_method: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_target_beneficiary_group: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_remarks: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },

//     tproj_fl_archive: {
//       type: DataTypes.STRING(1),
//       defaultValue: "N",
//     },

//     tproj_created_by: {
//       type: DataTypes.BIGINT,
//       defaultValue: 0,
//     },

//     tproj_updated_by: {
//       type: DataTypes.BIGINT,
//       defaultValue: 0,
//     },

//     tproj_created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: sequelize.literal("now()"),
//     },

//     tproj_updated_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: sequelize.literal("now()"),
//     },

//     tproj_deleted_at: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//   },
//   {
//     tableName: "t_projects",
//     timestamps: false,
//     freezeTableName: true,
//   },
// );

// module.exports = ProjectModel;
const { sequelize, DataTypes } = require("../../config/db");

const ProjectModel = sequelize.define(
  "t_projects",
  {
    tproj_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tproj'::text || lpad(((nextval('t_projects_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
      ),
    },

    tproj_budgets_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_budget_master_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_fy_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_unit_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_state_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_district_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_block_id: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },

    tproj_gram_panchayat_id: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },

    tproj_revenue_village_id: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },

    tproj_village_id: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },

    tproj_theme_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_schedule_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_sub_schedule_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_sdg_id: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    tproj_project_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_project_desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_project_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    tproj_project_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    tproj_budget_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    tproj_project_started_necessarily: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_baseline_info: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_implement_partner_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_monitoring_method: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_target_beneficiary_group: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tproj_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },

    tproj_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tproj_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tproj_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tproj_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tproj_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tproj_status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "draft",
    },

    tproj_approval_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    tproj_approval_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tproj_approver_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    tproj_user_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tproj_user_role_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tproj_not_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tproj_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tproj_approved_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "t_projects",
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ProjectModel;
