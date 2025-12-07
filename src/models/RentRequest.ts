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
import { Tool } from "./Tools";

@Table({
  tableName: "rent_requests",
  timestamps: true,
})
export class RentRequest extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  transaction_id!: number;

  @ForeignKey(() => Tool)
  @AllowNull(false)
  @Column(DataType.UUID)
  listing_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  borrower_id!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  start_time!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  end_time!: Date;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.DECIMAL(10, 2))
  total_fee!: number;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.DECIMAL(10, 2))
  platform_commission!: number;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.DECIMAL(10, 2))
  deposit_amount!: number;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  stripe_charge_id?: string;

  @AllowNull(false)
  @Default("Requested")
  @Column(DataType.ENUM("Requested", "Approved", "Cancelled", "Completed", "Disputed"))
  status!: "Requested" | "Approved" | "Cancelled" | "Completed" | "Disputed";

  // Relations
  @BelongsTo(() => Tool, { foreignKey: "listing_id", as: "listing" })
  listing!: Tool;

  @BelongsTo(() => User, { foreignKey: "borrower_id", as: "borrower" })
  borrower!: User;
}
