const Joi = require("joi");

module.exports.eventReviewSchema = Joi.object({
  terf_id: Joi.string().optional().allow(null, ""),

  terf_event_id: Joi.string().required().messages({
    "any.required": "Event ID is required",
  }),

  terf_name: Joi.string().trim().min(2).max(100).required(),

  terf_event_join_date: Joi.date().required(),
  terf_event_join_time: Joi.string().required(),

  terf_event_end_date: Joi.date()
    .min(Joi.ref("terf_event_join_date"))
    .required()
    .messages({
      "date.min": "End date cannot be before join date",
    }),

  terf_event_end_time: Joi.string().required(),

  terf_remarks: Joi.string().allow(null, "").max(500),

  terf_emp_user_name: Joi.string().trim().required(),

  terf_phone_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),

  terf_email: Joi.string().email().required(),

  terf_attending_event: Joi.string()
    .valid("yes", "no")
    .required(),

  terf_duration: Joi.string().required(),

  terf_family_vol_presence_no: Joi.number()
    .integer()
    .min(0)
    .required(),
});
