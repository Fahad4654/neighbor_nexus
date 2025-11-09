import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  PrimaryKey,
  Default,
  Index,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "profiles",
  timestamps: true,
  indexes: [
    { unique: true, fields: ["userId"] },
    { unique: true, fields: ["playerId"] },
  ],
})
export class Profile extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  bio?: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  avatarUrl?: string;

  @AllowNull(true)
  @Column(DataType.STRING(256))
  address?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  playerId!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  referredId?: string;
}
