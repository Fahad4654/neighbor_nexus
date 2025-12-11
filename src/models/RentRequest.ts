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
  @Comment("The ID of the tool being requested.")
  @Column(DataType.UUID)
  listing_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Comment("The ID of the user submitting the request (The Borrower).")
  @Column(DataType.UUID)
  borrower_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Comment(
    "The ID of the user who owns the tool and is lending it (The Lender). Added for simplified queries."
  )
  @Column(DataType.UUID)
  lender_id!: string;

  // --- STATUS & LIFE CYCLE ---

  @AllowNull(false)
  @Default("Requested")
  @Comment("The current status of the rental request.")
  @Column(DataType.STRING)
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
  @Comment(
    "The unit of duration used for calculating pricing (e.g., Hour, Day, Week)."
  )
  @Column(DataType.STRING)
  duration_unit!: "Hour" | "Day" | "Week";

  @AllowNull(false)
  @Comment("The count of the duration unit (e.g., 3 days, 8 hours).")
  @Column(DataType.INTEGER)
  duration_value!: number;

  @AllowNull(false)
  @Comment("The exact date and time the borrower INTENDS to pick up the item.")
  @Column(DataType.DATE)
  pickup_time!: Date;

  @AllowNull(false)
  @Comment(
    "The exact date and time the borrower COMMITS to dropping off/returning the item."
  )
  @Column(DataType.DATE)
  drop_off_time!: Date;

  @AllowNull(false)
  @Comment(
    "The total agreed-upon rental price for the specified duration (excluding taxes/fees)."
  )
  @Column(DataType.DECIMAL(10, 2))
  rental_price!: number;

  @AllowNull(true)
  @Comment("The actual date and time the item was handed over to the borrower.")
  @Column(DataType.DATE)
  actual_pickup_time!: Date | null;

  @AllowNull(true)
  @Comment("The actual date and time the item was returned to the lender.")
  @Column(DataType.DATE)
  actual_drop_off_time!: Date | null;

  @AllowNull(false)
  @Default(false)
  @Comment(
    "Flag indicating if the Borrower has left a review/rating for the Lender."
  )
  @Column(DataType.BOOLEAN)
  borrower_rated!: boolean;

  @AllowNull(false)
  @Default(false)
  @Comment(
    "Flag indicating if the Lender has left a review/rating for the Borrower."
  )
  @Column(DataType.BOOLEAN)
  lender_rated!: boolean;

  @BelongsTo(() => Tool, { foreignKey: "listing_id", as: "listing" })
  listing!: Tool;

  @BelongsTo(() => User, { foreignKey: "borrower_id", as: "borrower" })
  borrower!: User;

  @BelongsTo(() => User, { foreignKey: "lender_id", as: "lender" })
  lender!: User;
}
