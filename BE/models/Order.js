import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "preparing",
        "handed to delivery partner",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    trackingNumber: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
    },
    deliveryPartner: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure id field is present for frontend compatibility
orderSchema.methods.toJSON = function () {
  const order = this.toObject();
  order.id = order._id;
  return order;
};

export default mongoose.model("Order", orderSchema);
