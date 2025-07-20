import dotenv from "dotenv"
dotenv.config()
import Redis from "ioredis"

const redis = new Redis(`${process.env.UPSTASH_REDIS_URL}`);

redis.on("connect", () => {
    console.log("Connected to Redis");
});

export default redis;