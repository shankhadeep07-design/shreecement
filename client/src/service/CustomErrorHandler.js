module.exports = class CustomErrorHandler extends Error{
    constructor(status, msg)
    {
        super();
        this.status = status;
        this.msg = msg;
    }

    static validationError(message)
    {
        return new CustomErrorHandler(403,message)
    }

    static databaseError(message)
    {
        message = (process.env.DEBUG_MODE == 'false') ? "ERROR_DATABASE" : message;
        return new CustomErrorHandler(500,message)
    }

    static unAuthorizedError(message)
    {
        return new CustomErrorHandler(401,message)
    }

    static fileuploadError(message)
    {
        message = (process.env.DEBUG_MODE == 'false') ? "ERROR_FILE_UPLOAD" : message;
        return new CustomErrorHandler(409,message)
    }

    static internalServerError(message)
    {
        message = (process.env.DEBUG_MODE == 'false') ? "ERROR_INTERNAL_SERVER" : message;
        return new CustomErrorHandler(500,message)
    }

    static inValidRequestBodyError(message)
    {
        message = (process.env.DEBUG_MODE == 'false') ? "ERROR_INTERNAL_SERVER" : message;
        return new CustomErrorHandler(200,message)
    }
}