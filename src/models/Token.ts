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
  tableName: "tokens",
  timestamps: true, // handles createdAt and updatedAt automatically
})
export class Token extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  token!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isRefreshToken!: boolean;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiresAt!: Date;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;
}
