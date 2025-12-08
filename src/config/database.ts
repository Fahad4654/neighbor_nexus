import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Profile } from "../models/Profile";
import { Token } from "../models/Token";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../config";
import { Otp } from "../models/Otp";
import { Tool } from "../models/Tools";
import { Transaction } from "../models/Transaction";
import { Review } from "../models/Review";
import { ToolImage } from "../models/ToolsImages";
import { RentRequest } from "../models/RentRequest";

const sequelize = new Sequelize({
  database: DB_NAME,
  dialect: "postgres",
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  models: [User, Profile, Token, Otp, Tool, ToolImage,Transaction, Review, RentRequest], // Add all models here
  logging: false,
  dialectOptions: {
    ssl:
      process.env.DB_SSL === "true"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export { sequelize };
