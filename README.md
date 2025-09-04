# Stock Trading Backend System

## Problem Statement

The goal of this project is to implement a simplified **stock trading system** where users can place BUY and SELL orders for stocks. The system should:

- Match orders based on **price priority**:
  - Highest price first for BUY orders.
  - Lowest price first for SELL orders.
- Use **timestamp priority** when multiple orders have the same price (earlier orders are matched first).
- Support **partial order matching**, allowing unmatched portions of an order to remain pending.
- Provide efficient **stock search** over a large dataset (~1 million stocks).

This project also integrates **user authentication** using Next-Auth.

---

## Approach

1. **Backend**: Next.js API routes handle order placement, matching, and trade recording.
2. **Database**:
   - **MongoDB** stores users, stocks, orders, and trade history.
   - **Redis** is used as an in-memory order book for fast order matching and retrieval.
3. **Authentication**: Next-Auth with credentials provider manages user sessions.
4. **Order Matching**:
   - BUY orders: sorted by descending price, then ascending timestamp.
   - SELL orders: sorted by ascending price, then ascending timestamp.
   - Orders are partially matched if needed, updating the remaining quantity in Redis and MongoDB.

---

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- MongoDB instance (local or cloud)
- Redis instance (local or cloud)
- `.env.local` file with the following environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd <project-folder>
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables** in `.env.local`:

- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_SECRET`: Secret key for Next-Auth sessions

4. **Ensure MongoDB and Redis are running**.

---

## Steps to Run the Project

1. **Run Next.js development server**:

```bash
npm run dev
# or
yarn dev
```

2. **Frontend** is accessible at: `http://localhost:3000`
3. **API Endpoints**:

| Endpoint       | Method | Description                        |
|----------------|--------|------------------------------------|
| `/api/auth`    | POST   | User login/logout/register (Next-Auth) |
| `/api/orders`  | POST   | Place BUY/SELL orders and match automatically |
| `/api/stocks`  | GET    | Fetch stock list                    |
| `/api/trades`  | GET    | Retrieve executed trades            |

---

## Complex Logic / Algorithms

### Order Matching

1. **Order Sorting**:

- BUY: `sorted by descending price, then ascending timestamp`
- SELL: `sorted by ascending price, then ascending timestamp`

2. **Matching Algorithm**:

- Continuously check top BUY and SELL orders from Redis.
- If `topBuy.price >= topSell.price`, execute a trade.
- Determine `tradeQty = min(topBuy.quantity, topSell.quantity)`.
- Store trade in MongoDB.
- Update quantities:
  - If order fully matched → mark `COMPLETED` and remove from Redis.
  - If partially matched → update remaining quantity in both MongoDB and Redis.
- Repeat until no further matches possible.

3. **Redis Scoring**:

- BUY: `score = price * 1e6 - timestamp` → higher price, earlier timestamp first.
- SELL: `score = price * 1e6 + timestamp` → lower price, earlier timestamp first.

This ensures **real-time matching** with priority logic.

---

## Special Considerations

- **Session Handling**: API routes require valid Next-Auth sessions for order placement.
- **Redis Expiry**: Consider clearing stale data periodically if needed.
- **Partial Matching**: Orders can remain in pending state if not fully matched.
- **Decimal Prices**: Ensure floating point prices are handled correctly in Redis scoring.
- **Concurrent Orders**: The Redis sorted set allows fast concurrency-safe access, but extreme high-frequency scenarios may require additional locking mechanisms.

---

## Project Structure

```
/app
  /api
    /auth/[...nextauth]/route.ts   # Authentication
    /orders/route.ts                # Place and match orders
    /stocks/route.ts                # Stock data
    /trades/route.ts                # Trade history
/lib
  mongodb.ts                        # MongoDB connection
  redis.ts                          # Redis connection
/models
  Order.ts                          # Order schema
  Trade.ts                          # Trade schema
  Stock.ts                          # Stock schema
/components
  PlaceOrder.tsx                    # Frontend order form
  StockList.tsx                     # Display stock list
```

---

## Author

- **Amay** – Backend Intern Project

# BE-Assign
