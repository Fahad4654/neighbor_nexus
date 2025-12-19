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
  @AllowNull(false)
  @Column(DataType.UUID)
  review_id!: string;

  @ForeignKey(() => Transaction)
  @AllowNull(false)
  @Column(DataType.UUID)
  transaction_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  lender_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  borrower_id!: string;

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

  // Relations;
  @BelongsTo(() => Transaction, {
    foreignKey: "transaction_id",
    as: "transaction",
  })
  transaction!: Transaction;

  @BelongsTo(() => User, { foreignKey: "lender_id", as: "lender" })
  lender!: User;

  @BelongsTo(() => User, { foreignKey: "borrower_id", as: "borrower" })
  borrower!: User;

  @BelongsTo(() => User, { foreignKey: "approvedBy", as: "approver" })
  approver!: User;
}
