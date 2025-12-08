import { User } from "../../models/User";
import { Op } from "sequelize";

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
