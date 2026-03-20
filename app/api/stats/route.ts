// Simple in-memory store — persists as long as server is running
let totalSales = 0;
let totalEarned = 0;

export async function GET() {
  return Response.json({
    totalSales,
    totalEarned: totalEarned.toFixed(2),
  });
}

export async function POST() {
  totalSales += 1;
  totalEarned += 0.01;
  return Response.json({
    totalSales,
    totalEarned: totalEarned.toFixed(2),
  });
}