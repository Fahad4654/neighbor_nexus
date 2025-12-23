import { Op } from "sequelize";
import { ADMIN_MAIL, COMPANY_NAME, CLIENT_URL } from "../../config";
import { Otp } from "../../models/Otp";
import { User } from "../../models/User";
import { MailService } from "../mail/mail.service";

const mailService = new MailService();

export async function sendOtp(identifier: string, type: string) {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier },
      ],
    },
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
        name: user.lastname,
        expiry: "10",
        otp,
        year: new Date().getFullYear(),
        supportEmail: ADMIN_MAIL,
        companyName: `${COMPANY_NAME}`,
      }
    );
    return "OTP sent successfully";
  }

  await mailService.sendMail(
    user.email,
    "Password Reset OTP",
    "Password Reset OTP.",
    undefined, // HTML will come from template
    "otp-password", // Handlebars template
    {
      name: user.lastname,
      expiry: "10",
      otp,
      year: new Date().getFullYear(),
      supportEmail: ADMIN_MAIL,
      companyName: `${COMPANY_NAME}`,
    }
  );

  return "OTP sent successfully";
}
