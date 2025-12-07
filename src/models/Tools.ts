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
  HasMany,
} from "sequelize-typescript";
import { User } from "./User";
import { ToolImage } from "./ToolsImages";
import { GeoPoint } from "../types/geo";

@Table({
  tableName: "tools",
  timestamps: true,
})
export class Tool extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  listing_id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  owner_id!: string;

  @AllowNull(false)
  @Column(DataType.ENUM("Tool", "Skill"))
  listing_type!: "Tool" | "Skill";

  @AllowNull(false)
  @Column(DataType.STRING(100))
  title!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(true)
  @Default(0.0)
  @Column(DataType.DECIMAL(10, 2))
  hourly_price?: number;

  @AllowNull(true)
  @Default(0.0)
  @Column(DataType.DECIMAL(10, 2))
  daily_price?: number;

  @AllowNull(true)
  @Default(0.0)
  @Comment("Amount held in escrow for tool rentals only.")
  @Column(DataType.DECIMAL(10, 2))
  security_deposit?: number;

  @AllowNull(false)
  @Default(true)
  @Comment("Quick check for active listings.")
  @Column(DataType.BOOLEAN)
  is_available!: boolean;

  @AllowNull(true)
  @Default(0)
  @Comment("Number of times this tool has been rented.")
  @Column(DataType.INTEGER)
  rental_count!: number;

  @AllowNull(false)
  @Default(false)
  @Comment("approval status by admin")
  @Column(DataType.BOOLEAN)
  is_approved!: boolean;

  @ForeignKey(() => User) // 1. Add the Foreign Key Decorator
  @AllowNull(true)
  @Default(null)
  @Comment("approved by whom (User ID)")
  @Column(DataType.UUID) // 2. Change the DataType to UUID
  approved_by?: string | null; // 3. Update the type to allow null

  @AllowNull(true)
  @Default({
    type: "Point",
    coordinates: [90.4125, 23.8103], // Dhaka default (lon, lat)
  })
  @Comment(
    "Stores the precise latitude/longitude for proximity searching. Defaults to Dhaka."
  )
  @Column(DataType.GEOGRAPHY("POINT", 4326))
  geo_location!: GeoPoint;

  @BelongsTo(() => User, { foreignKey: "owner_id", as: "owner" })
  owner!: User;

  @BelongsTo(() => User, {
    foreignKey: "approved_by",
    as: "approver",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  approver!: User;

  @HasMany(() => ToolImage, { foreignKey: "tool_id", as: "images" })
  images!: ToolImage[];
}
