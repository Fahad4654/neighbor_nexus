import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  Default,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";
import { Transaction } from "./Transaction";

@Table({
  tableName: "reviews",
  timestamps: true, // automatically adds createdAt/updatedAt
})
export class Review extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  review_id!: number;

  @ForeignKey(() => Transaction)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  transaction_id!: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  reviewer_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  reviewed_user_id!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  rating!: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  comment?: string;

  @AllowNull(true)
  @Default(false)
  @Column(DataType.BOOLEAN)
  approved!: boolean;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  approvedBy!: string;

  // Relations
  @BelongsTo(() => Transaction, {
    foreignKey: "transaction_id",
    as: "transaction",
  })
  transaction!: Transaction;

  @BelongsTo(() => User, { foreignKey: "reviewer_id", as: "reviewer" })
  reviewer!: User;

  @BelongsTo(() => User, { foreignKey: "reviewed_user_id", as: "reviewedUser" })
  reviewedUser!: User;

  @BelongsTo(() => User, { foreignKey: "approvedBy", as: "approver" })
  approver!: User;
}
