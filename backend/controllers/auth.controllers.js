import User from "../models/user.model.js";
import bcrypt, { hash } from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";
import { logActivity } from "../utils/activityLogger.js";
import jwt from "jsonwebtoken";
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Already exist." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters." });
    }
    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "mobile no must be at least 10 digits." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      fullName,
      email,
      role,
      mobile,
      password: hashedPassword,
    });

    const token = await genToken(user._id);
    // res.cookie("token", token, {
    //   secure: false,
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    // });
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseUser = user.toObject();
    if (email && process.env.SUPER_ADMIN_EMAIL && email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
      responseUser.role = "superAdmin";
    }

    logActivity({ userId: user._id }, {
      activityType: "Authentication",
      action: "User Registered",
      userId: user._id,
      targetEntity: "User",
      entityId: user._id,
      description: `Successfully registered account for ${fullName} (${email})`,
      status: "success"
    });

    return res.status(201).json(responseUser);
  } catch (error) {
    return res.status(500).json(`sign up error ${error}`);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "incorrect Password" });
    }

    const token = await genToken(user._id);
    // res.cookie("token", token, {
    //   secure: false,
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    // });

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseUser = user.toObject();
    if (email && process.env.SUPER_ADMIN_EMAIL && email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
      responseUser.role = "superAdmin";
    }

    logActivity({ userId: user._id }, {
      activityType: "Authentication",
      action: "User Logged In",
      userId: user._id,
      targetEntity: "User",
      entityId: user._id,
      description: `User ${user.fullName} logged in successfully`,
      status: "success"
    });

    return res.status(200).json(responseUser);
  } catch (error) {
    return res.status(500).json(`sign In error ${error}`);
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies.token;
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded?.userId;
      } catch (err) {}
    }

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
    });

    if (userId) {
      logActivity({ userId }, {
        activityType: "Authentication",
        action: "User Logged Out",
        userId,
        targetEntity: "User",
        entityId: userId,
        description: "User logged out successfully",
        status: "success"
      });
    }

    return res.status(200).json({ message: "log out successfully" });
  } catch (error) {
    return res.status(500).json(`sign out error ${error}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    
    console.log(`[sendOtp] Reset Password OTP for ${email}: ${otp}`);

    try {
      await sendOtpMail(email, otp);
    } catch (mailError) {
      console.warn("[sendOtp] Nodemailer failed to send email:", mailError.message || mailError);
      const responsePayload = {
        success: true,
        message: "otp generated (Nodemailer fallback).",
      };
      if (process.env.NODE_ENV !== "production") {
        responsePayload.otp = otp;
        responsePayload.message += ` OTP is ${otp}`;
      } else {
        return res.status(400).json({
          success: false,
          message: "Unable to deliver OTP via email. Please check configuration.",
          error: mailError.message || mailError,
        });
      }
      return res.status(200).json(responsePayload);
    }

    return res.status(200).json({ message: "otp sent successfully" });
  } catch (error) {
    console.error("[sendOtp] Critical exception caught:", error);
    return res.status(400).json({
      success: false,
      message: "Unable to send OTP",
      error: error.message || error,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "invalid/expired otp" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    logActivity({ userId: user._id }, {
      activityType: "Authentication",
      action: "OTP Verified",
      userId: user._id,
      targetEntity: "User",
      entityId: user._id,
      description: `OTP verification successful for ${email}`,
      status: "success"
    });

    return res.status(200).json({ message: "otp verify successfully" });
  } catch (error) {
    return res.status(500).json(`verify otp error ${error}`);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "otp verification required" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();

    logActivity({ userId: user._id }, {
      activityType: "Authentication",
      action: "Password Changed",
      userId: user._id,
      targetEntity: "User",
      entityId: user._id,
      description: `Password reset/changed successfully for ${email}`,
      status: "success"
    });

    return res.status(200).json({ message: "password reset successfully" });
  } catch (error) {
    return res.status(500).json(`reset password error ${error}`);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      if (!fullName || !mobile || !role) {
        return res.status(400).json({ message: "User does not exist. Please sign up first." });
      }
      user = await User.create({
        fullName,
        email,
        mobile,
        role,
      });
    }

    const token = await genToken(user._id);
    // res.cookie("token", token, {
    //   secure: false,
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    // });
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseUser = user.toObject();
    if (email && process.env.SUPER_ADMIN_EMAIL && email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
      responseUser.role = "superAdmin";
    }

    logActivity({ userId: user._id }, {
      activityType: "Authentication",
      action: "Google Login",
      userId: user._id,
      targetEntity: "User",
      entityId: user._id,
      description: `Google Sign In/Login successful for ${user.fullName}`,
      status: "success"
    });

    return res.status(200).json(responseUser);
  } catch (error) {
    return res.status(500).json(`googleAuth error ${error}`);
  }
};
