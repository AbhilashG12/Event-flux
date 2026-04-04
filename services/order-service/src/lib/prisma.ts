import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../../generated/prisma/index"

const connectionString = `${process.env.ORDER_DATABASE_URL}`;


const pool = new pg.Pool({ connectionString });

pool.on('connect', (client) => {
  client.query('SET search_path TO "orders", public');
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };