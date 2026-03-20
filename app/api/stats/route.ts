import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  const totalSales = (await redis.get<number>("totalSales")) ?? 0;
  const totalEarned = (await redis.get<number>("totalEarned")) ?? 0;
  return Response.json({
    totalSales,
    totalEarned: Number(totalEarned).toFixed(2),
  });
}

export async function POST() {
  const totalSales = await redis.incr("totalSales");
  const totalEarned = await redis.incrbyfloat("totalEarned", 0.01);
  return Response.json({
    totalSales,
    totalEarned: Number(totalEarned).toFixed(2),
  });
}