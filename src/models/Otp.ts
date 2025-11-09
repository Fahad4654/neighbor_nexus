import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default,
  AllowNull,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "otp",
  timestamps: true,
})
export class Otp extends Model {
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

  @AllowNull(false)
  @Column(DataType.STRING)
  otp!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiresAt!: Date;

  @AllowNull(false)
  @Column(DataType.STRING)
  type!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  verified!: boolean;
}
