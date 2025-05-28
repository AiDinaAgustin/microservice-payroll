import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

export const db = new Sequelize({
   dialect: 'postgres',
   host: process.env.DB_HOST || 'localhost',
   port: Number(process.env.DB_PORT) || 5432,
   username: process.env.DB_USER || 'postgres',
   password: process.env.DB_PASSWORD || '',
   database: process.env.DB_NAME || 'hrpayroll360_local',
   define: {
      timestamps: false
   }
})
