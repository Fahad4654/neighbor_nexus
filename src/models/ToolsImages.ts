import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Default,
} from "sequelize-typescript";
import { Tool } from "./Tools";

@Table({
  tableName: "tool_images",
  timestamps: true,
})
export class ToolImage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Tool)
  @AllowNull(false)
  @Column(DataType.UUID)
  tool_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  image_url!: string; // store S3 URL, Cloudinary URL, or local path

  @AllowNull(false)
  @Column(DataType.STRING)
  filepath!: string; // store the file path or key in the storage service

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  is_primary!: boolean; // indicates if this image is the primary image for the tool

  @BelongsTo(() => Tool, { foreignKey: "tool_id" })
  tool!: Tool;
}
