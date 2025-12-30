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
  reviewee_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  reviewer_id!: string;

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

  @Default(true)
  @Column(DataType.BOOLEAN)
  show_to_reviewee!: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  show_to_reviewer!: boolean;

  // Relations;
  @BelongsTo(() => Transaction, {
    foreignKey: "transaction_id",
    as: "transaction",
  })
  transaction!: Transaction;

  @BelongsTo(() => User, { foreignKey: "reviewee_id", as: "reviewee" })
  reviewee!: User;

  @BelongsTo(() => User, { foreignKey: "reviewer_id", as: "reviewer" })
  reviewer!: User;

  @BelongsTo(() => User, { foreignKey: "approvedBy", as: "approver" })
  approver!: User;
}
