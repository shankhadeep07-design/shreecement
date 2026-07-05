import * as Yup from "yup";

const ForwardRoleSchema = Yup.object().shape({
  forward_role_id: Yup.string().required("Forward role ID is required"),
  forward_sequence: Yup.number().required("Forward sequence is required"),
  forward_role_name: Yup.string().required("Forward role name is required"),
});

const DepartmentSchema = Yup.object().shape({
  forward: Yup.string().oneOf(["yes", "no"]).required("Forward is required"),
  department_id: Yup.string().required("Department ID is required"),
  department_name: Yup.string().required("Department name is required"),
  forward_path_id: Yup.number().required("Forward path ID is required"),
  forward_roles: Yup.array()
    .of(ForwardRoleSchema)
    .required("Forward roles are required"),
});

const RoleSchema = Yup.object().shape({
  dop: Yup.string().nullable(),
  dop_max: Yup.number().nullable(),
  dop_min: Yup.number().nullable(),
  forward: Yup.string().oneOf(["yes", "no"]).required("Forward is required"),
  role_id: Yup.string().required("Role ID is required"),
  sequence: Yup.number().required("Sequence is required"),
  dop_total: Yup.number().nullable(),
  master_id: Yup.number().required("Master ID is required"),
  role_name: Yup.string().required("Role name is required"),
  department: Yup.array().of(DepartmentSchema),
});

// Final validation for your whole array
const RolesArraySchema = Yup.array().of(RoleSchema);

export default RolesArraySchema;
