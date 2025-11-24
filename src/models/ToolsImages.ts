import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Tool } from "./Tools";

@Table({
  tableName: "tool_images",
  timestamps: true,
})
export class ToolImage extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Tool)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  tool_id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  image_url!: string;   // store S3 URL, Cloudinary URL, or local path

  @BelongsTo(() => Tool, { foreignKey: "tool_id" })
  tool!: Tool;
}
