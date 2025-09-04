import redis from "./redis";

export async function addStockToRedis(stock: { _id: string; symbol: string; name: string }) {
  const { _id, symbol, name } = stock;

  await redis.hset("stocks:hash", _id, JSON.stringify(stock));
  await redis.hset("stocks:symbol", symbol.toLowerCase(), JSON.stringify(stock));

  const nameLower = name.toLowerCase();
  for (let i = 1; i <= nameLower.length; i++) {
    const prefix = nameLower.slice(0, i);
    await redis.zadd(`stocks:prefix:${prefix}`, 0, _id); // score is not needed, just store ID
  }
}

export async function getStockByIdOrSymbol(query: string) {
  const stockById = await redis.hget("stocks:hash", query);
  if (stockById) return JSON.parse(stockById);

  const stockBySymbol = await redis.hget("stocks:symbol", query.toLowerCase());
  if (stockBySymbol) return JSON.parse(stockBySymbol);

  return null;
}

export async function searchStocksByNamePrefix(prefix: string) {
  const ids = await redis.zrange(`stocks:prefix:${prefix.toLowerCase()}`, 0, -1);
  if (!ids.length) return [];

  const pipeline = redis.pipeline();
  ids.forEach((id) => pipeline.hget("stocks:hash", id));
  const results = await pipeline.exec();

  return (results ?? []).map(([err, stockJson]) => JSON.parse(stockJson));
}
