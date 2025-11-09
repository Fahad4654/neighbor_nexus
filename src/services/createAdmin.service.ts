import { User } from "../models/User";
import {
  ADMIN_NAME,
  ADMIN_MAIL,
  ADMIN_PASSWORD,
  ADMIN_PHONENUMBER,
} from "../config";
import { createUser } from "./user.service";

export async function createAdmin() {
  const adminExists = await User.findOne({
    where: { email: ADMIN_MAIL },
  });

  if (!adminExists) {
    const newUser = await createUser({
      name: ADMIN_NAME,
      email: ADMIN_MAIL,
      password: ADMIN_PASSWORD,
      isAdmin: true,
      phoneNumber: ADMIN_PHONENUMBER,
    });
    console.log("✅ Admin user created:", newUser);
  } else {
    console.log("ℹ️ Admin user already exists");
  }
}
