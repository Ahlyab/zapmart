import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Password is optional for guest users
      validate: {
        validator: function (value) {
          // If password is provided, it must be at least 6 characters
          if (value && value.length > 0) {
            return value.length >= 6;
          }
          // If password is not provided (empty or undefined), it's valid (for guest users)
          return true;
        },
        message: "Password must be at least 6 characters long",
      },
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "customer" || this.role === "admin";
      },
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if password is provided)
userSchema.pre("save", async function (next) {
  // Skip password hashing if password is not provided (guest users)
  if (!this.password || this.password === "") {
    return next();
  }

  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Guest users don't have passwords
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output and ensure id field
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  // Ensure id field is present for frontend compatibility
  user.id = user._id;
  return user;
};

export default mongoose.model("User", userSchema);
