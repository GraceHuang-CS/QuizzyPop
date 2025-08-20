import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Password only required for email/password registration
        return this.authProvider === "local" || !this.authProvider;
      },
    },
    picture: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Index for Google ID to ensure uniqueness and faster lookups
userSchema.index({ googleId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);
export default User;
// import mongoose from "mongoose";
// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//   },
//   {
//     timestamps: true,
//   }
// );

// const User = mongoose.model("User", userSchema);
// export default User;
