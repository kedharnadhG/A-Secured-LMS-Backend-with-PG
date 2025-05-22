import {body, param, query, validationResult} from 'express-validator';

export const validate = (validations) => {
    return async (req, res, next) => {
        //run all the validations
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        
        const extractedError = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }))

        throw new Error(extractedError || "Validation Error", 400);
    }
}


export const commonValidations = {
    pagination: [
        query("page")
            .optional()
            .isInt({min: 1})
            .withMessage("Page must be a positive number"),
        query("limit")
            .optional()
            .isInt({min: 1, max: 100})
            .withMessage("Limit must be between 1 and 100")
    ],

    email: body("email")
        .trim()
        .isEmail()
        .normalizeEmail() // convert email to lowercase
        .withMessage("Please provide a valid email"),
    name: body("name")
        .trim()
        .isLength({min: 3, max: 50})
        .withMessage("Name must be at least 3 characters long"),
    password: body("password")
        .trim()
        .isLength({min: 8})
        .withMessage("Password must be at least 8 characters long"),
    id: param("id")
        .trim()
        .isMongoId()
        .withMessage("Invalid ID")
}

export const validateSignUp = validate([
    commonValidations.name,
    commonValidations.email,
    commonValidations.password
])