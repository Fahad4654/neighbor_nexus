import bcrypt from "bcryptjs";
import { User } from "../../models/User";
import {
  ADMIN_MAIL,
  ADMIN_USERNAME,
  CLIENT_URL,
  COMPANY_NAME,
} from "../../config";
import { MailService } from "../mail/mail.service";
import { findByDynamicId } from "../global/find.service";
import { createProfile } from "../profile/create.profile.service";

const mailService = new MailService();

export const generateToken = (id: string): string => {
  return id.slice(-9).toUpperCase(); // Take last 9 chars and uppercase
};

export async function createUser(data: {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  createdBy?: string;
  updatedBy?: string;

  // 👇 Add Google Maps location
  location?: {
    lat: number;
    lng: number;
  };
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const admin = await User.findOne({
    where: { username: `${ADMIN_USERNAME}` },
  });

  let creator: User | null = null;
  if (data.createdBy) {
    const typedCreator = await findByDynamicId(
      User,
      { id: data.createdBy },
      false
    );
    creator = typedCreator as User | null;
  }
  let geoLocationValue = undefined;

  if (data.location) {
    geoLocationValue = {
      type: "Point",
      coordinates: [data.location.lng, data.location.lat], // IMPORTANT: [lng, lat]
    };
  }
  // ⭐ Create the User

  const newUser = await User.create({
    username: data.username,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    password: hashedPassword,
    phoneNumber: data.phoneNumber,
    isAdmin: data.isAdmin ?? false,
    isVerified: true,
    createdBy: data.createdBy ?? (admin ? admin.id : null),
    updatedBy: data.updatedBy ?? (admin ? admin.id : null),

    // 👇 Save geo location (will use default if not provided)
    ...(geoLocationValue && { geo_location: geoLocationValue }),
  });

  console.log("User created successfully");

  await createProfile({
    userId: newUser.id,
    bio: newUser.isAdmin ? "Administrator account" : "Please update your bio",
    address: newUser.isAdmin ? "Headquarters" : "Please update your address",
  });

  // Send email
  await mailService.sendMail(
    newUser.email,
    "User Created",
    "User Creation is completed.",
    undefined,
    "user-created",
    {
      companyName: `${COMPANY_NAME}`,
      user: newUser.get({ plain: true }),
      loginUrl: `${CLIENT_URL}/login`,
      year: new Date().getFullYear(),
      supportEmail: ADMIN_MAIL,
      password: data.password,
    }
  );

  return newUser;
}
