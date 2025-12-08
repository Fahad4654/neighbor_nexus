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
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Tool)
  @AllowNull(false)
  @Comment("The ID of the tool being requested.")
  @Column(DataType.UUID)
  listing_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Comment("The ID of the user submitting the request.")
  @Column(DataType.UUID)
  borrower_id!: string;

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

  @AllowNull(false)
  @Default("Hour")
  @Comment(
    "The unit of duration used for calculating pricing (e.g., Hour, Day)."
  )
  @Column(DataType.STRING)
  duration_unit!: "Hour" | "Day" | "Week";

  @AllowNull(false)
  @Comment("The exact date and time the borrower intends to pick up the item.")
  @Column(DataType.DATE)
  pickup_time!: Date;

  @AllowNull(false)
  @Comment(
    "The exact date and time the borrower commits to dropping off/returning the item."
  )
  @Column(DataType.DATE)
  drop_off_time!: Date;

  @BelongsTo(() => Tool, { foreignKey: "listing_id", as: "listing" })
  listing!: Tool;

  @BelongsTo(() => User, { foreignKey: "borrower_id", as: "borrower" })
  borrower!: User;
}
