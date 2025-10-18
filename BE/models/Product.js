import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
    affiliatedLink: {
      type: String,
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for review stats
productSchema.virtual("reviewStats", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

// Ensure virtual fields are serialized and id field is present
productSchema.methods.toJSON = function () {
  const product = this.toObject();
  product.id = product._id;
  return product;
};

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
