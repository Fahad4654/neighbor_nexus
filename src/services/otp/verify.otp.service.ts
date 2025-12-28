import { Op } from "sequelize";
import { ADMIN_MAIL, COMPANY_NAME, CLIENT_URL } from "../../config";
import { Otp } from "../../models/Otp";
import { User } from "../../models/User";
import { MailService } from "../mail/mail.service";

const mailService = new MailService();

export async function verifyOtp(identifier: string, otp: string) {
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

  const token = await Otp.findOne({
    where: { userId: user.id, otp },
  });
  if (!token) throw new Error("Invalid OTP");
  if (token.expiresAt.getTime() < Date.now()) {
    await token.destroy();
    throw new Error("OTP expired");
  }
  if (token.verified) {
    throw new Error("OTP already verified");
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
    return "User verified successfully";
  }

  return "OTP verified successfully";
}
