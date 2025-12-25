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
  Comment,
} from "sequelize-typescript";
import { User } from "./User";
import { Tool } from "./Tools";

@Table({
  tableName: "rent_requests",
  timestamps: true,
})
export class RentRequest extends Model {
  // --- IDENTIFIERS ---

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  // --- FOREIGN KEYS & ASSOCIATIONS ---

  @ForeignKey(() => Tool)
  @AllowNull(false)
  @Column(DataType.UUID)
  listing_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  borrower_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  lender_id!: string;

  // --- STATUS & LIFE CYCLE ---

  @AllowNull(false)
  @Default("Requested")
  @Column(
    DataType.ENUM(
      "Requested",
      "Approved",
      "Denied",
      "Cancelled",
      "Completed",
      "Disputed"
    )
  )
  rent_status!:
    | "Requested"
    | "Approved"
    | "Denied"
    | "Cancelled"
    | "Completed"
    | "Disputed";

  // --- DURATION & SCHEDULING ---

  @AllowNull(false)
  @Default("Hour")
  @Column(DataType.ENUM("Hour", "Day", "Week"))
  duration_unit!: "Hour" | "Day" | "Week";

  @AllowNull(false)
  @Column(DataType.INTEGER)
  duration_value!: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  pickup_time!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  drop_off_time!: Date;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  rental_price!: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  actual_pickup_time!: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  actual_drop_off_time!: Date | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  cancellation_reason?: string | null;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  borrower_rated!: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  show_to_borrower!: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  show_to_lender!: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  lender_rated!: boolean;

  @BelongsTo(() => Tool, { foreignKey: "listing_id", as: "listing" })
  listing!: Tool;

  @BelongsTo(() => User, { foreignKey: "borrower_id", as: "borrower" })
  borrower!: User;

  @BelongsTo(() => User, { foreignKey: "lender_id", as: "lender" })
  lender!: User;
}
