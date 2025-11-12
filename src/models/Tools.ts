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

@Table({
  tableName: "tools",
  timestamps: true,
})
export class Tool extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  listing_id!: number;

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

  @BelongsTo(() => User, { foreignKey: "owner_id", as: "owner" })
  owner!: User;
}
