import { Otp } from "../models/Otp";
import { User } from "../models/User";
import { MailService } from "./mail/mail.service";
import { ADMIN_MAIL, CLIENT_URL, COMPANY_NAME } from "../config";

const mailService = new MailService();

/**
 * Step 1: Send OTP
 */

export async function sendOtp(identifier: string, type: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.destroy({ where: { userId: user.id } });
  await Otp.create({
    userId: user.id,
    otp,
    type,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    verified: false,
  });

  if (type == "register") {
    await mailService.sendMail(
      user.email,
      "User Verification OTP",
      "User Verification OTP.",
      undefined, // HTML will come from template
      "otp-user", // Handlebars template
      {
        name: user.name,
        expiry: "10",
        otp,
        year: new Date().getFullYear(),
        supportEmail: ADMIN_MAIL,
        companyName: `${COMPANY_NAME}`,
      }
    );
    return { message: "OTP sent successfully" };
  }

  await mailService.sendMail(
    user.email,
    "Password Reset OTP",
    "Password Reset OTP.",
    undefined, // HTML will come from template
    "otp-password", // Handlebars template
    {
      name: user.name,
      expiry: "10",
      otp,
      year: new Date().getFullYear(),
      supportEmail: ADMIN_MAIL,
      companyName: `${COMPANY_NAME}`,
    }
  );

  console.log("OTP is:", otp);

  return { message: "OTP sent successfully" };
}

/**
 * Step 2: Verify OTP
 */
export async function verifyOtp(identifier: string, otp: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const token = await Otp.findOne({
    where: { userId: user.id, otp },
  });
  if (!token) throw new Error("Invalid OTP");
  if (token.expiresAt.getTime() < Date.now()) {
    await token.destroy();
    throw new Error("OTP expired");
  }

  token.verified = true;
  await token.save();
  if (token.type == "register") {
    user.isVerified = true;
    user.save();
    await mailService.sendMail(
      user.email,
      "User Created",
      "User Creation is completed.",
      undefined, // HTML will come from template
      "user-created", // Handlebars template
      {
        companyName: `${COMPANY_NAME}`,
        user: user.get({ plain: true }),
        loginUrl: `${CLIENT_URL}/login`,
        year: new Date().getFullYear(),
        supportEmail: ADMIN_MAIL,
      }
    );
    return {
      status: "success",
      message: "OTP verified successfully & User verified successfully!",
    };
  }

  return { message: "OTP verified successfully" };
}
