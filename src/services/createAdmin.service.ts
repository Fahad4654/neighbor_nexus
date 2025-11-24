import { User } from "../models/User";
import {
  ADMIN_USERNAME,
  ADMIN_FIRSTNAME,
  ADMIN_LASTNAME,
  ADMIN_MAIL,
  ADMIN_PASSWORD,
  ADMIN_PHONENUMBER,
} from "../config";
import { createUser } from "./user.service";
import { createProfile } from "./profile.service";

export async function createAdmin() {
  const adminExists = await User.findOne({
    where: { email: ADMIN_MAIL },
  });

  if (!adminExists) {
    const newUser = await createUser({
      username: ADMIN_USERNAME,
      firstname: ADMIN_FIRSTNAME,
      lastname: ADMIN_LASTNAME,
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
