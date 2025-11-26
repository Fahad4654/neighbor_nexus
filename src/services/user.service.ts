import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Profile } from "../models/Profile";
import { createProfile } from "./profile.service";
import { Op } from "sequelize";
import {
  ADMIN_MAIL,
  ADMIN_USERNAME,
  CLIENT_URL,
  COMPANY_NAME,
} from "../config";
import { MailService } from "./mail/mail.service";
import { findByDynamicId } from "./find.service";

const mailService = new MailService();

export const generateToken = (id: string): string => {
  return id.slice(-9).toUpperCase(); // Take last 9 chars and uppercase
};

export async function findAllUsers(
  order = "id",
  asc: "ASC" | "DESC" = "ASC",
  page = 1,
  pageSize = 10,
  userId: string
) {
  const offset = (page - 1) * pageSize;
  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User | null;
  console.log(user);
  if (!user) throw new Error("User not found");

  const whereClause: any = {};

  const { count, rows } = await User.findAndCountAll({
    where: whereClause, // ✅ Apply condition
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Profile,
        attributes: {
          exclude: [
            "userId",
            "createdBy",
            "updatedBy",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    ],
    nest: true,
    raw: false, // remove raw so nested JSON works correctly
    limit: pageSize,
    distinct: true,
    offset,
    order: [[order, asc]],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

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

  console.log("Created by:", creator);
  //  Convert Google Maps lat/lng to PostGIS

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

  console.log("user created", newUser);

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

export async function updateUser(data: Partial<User> & { id: string }) {
  const user = await User.findOne({ where: { id: data.id } });
  if (!user) {
    console.log("User not found for update");
    throw new Error("User not found");
  }

  const allowedFields: Array<keyof User> = [
    "firstname",
    "lastname",
    // "email",
    "isAdmin",
    "phoneNumber",
    "updatedBy",
    "geo_location",
  ];
  const updates: Partial<User> = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (Object.keys(updates).length === 0) return null;

  await user.update(updates);
  return User.findByPk(user.id, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
}

export async function deleteUser(identifier: {
  email?: string;
  username?: string;
  id?: string;
  phoneNumber?: string;
}) {
  if (
    !identifier.email &&
    !identifier.username &&
    !identifier.id &&
    !identifier.phoneNumber
  ) {
    throw new Error(
      "At least one identifier (username, email, id, or phoneNumber) is required"
    );
  }

  return User.destroy({
    where: {
      [Op.or]: [
        identifier.email ? { email: identifier.email } : undefined,
        identifier.username ? { username: identifier.username } : undefined,
        identifier.id ? { id: identifier.id } : undefined,
        identifier.phoneNumber
          ? { phoneNumber: identifier.phoneNumber }
          : undefined,
      ].filter(Boolean) as any,
    },
  });
}
