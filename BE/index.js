import app from "./app.js";
import Order from "./models/Order.js";
import cron from "node-cron";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// add a cron job to check for orders that are handed to delivery partner and it's been 3 days since then and the status is still "handed to delivery partner" and change the status to "completed"

cron.schedule("0 0 * * *", async () => {
  console.log(
    'Checking for orders that are handed to delivery partner and it\'s been 3 days since then and the status is still "handed to delivery partner" and change the status to "completed"'
  );
  const orders = await Order.find({
    status: "handed to delivery partner",
    updatedAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  });
  for (const order of orders) {
    await Order.findByIdAndUpdate(order._id, { status: "completed" });
  }
});
