import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure id field is present for frontend compatibility
categorySchema.methods.toJSON = function () {
  const category = this.toObject();
  category.id = category._id;
  return category;
};

export default mongoose.model("Category", categorySchema);
