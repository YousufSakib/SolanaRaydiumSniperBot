// models/example.js
const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: "__v",
    // Enable optimistic concurrency control
    optimisticConcurrency: true,
    // Add any additional options here
  }
);

// Add indexes
exampleSchema.index({ email: 1 });

// Add middleware example
exampleSchema.pre("save", async function (next) {
  // Add any pre-save logic here
  next();
});

// Add instance method example
exampleSchema.methods.customMethod = function () {
  // Add custom instance methods here
};

// Add static method example
exampleSchema.statics.customStaticMethod = function () {
  // Add custom static methods here
};

const Example = mongoose.model("Example", exampleSchema);

module.exports = Example;
