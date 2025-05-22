import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});

    // send token as cookie as a response
    return res
        .status(200)
        .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })
        .json({
            success: true,
            message,
            user,
            token
        });
}