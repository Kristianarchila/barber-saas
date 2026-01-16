const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ROLES = ["SUPER_ADMIN", "BARBERIA_ADMIN", "BARBERO", "CLIENTE"];

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },

    rol: { type: String, enum: ROLES, required: true },

    // Multi-tenant: null para SUPER_ADMIN
    barberiaId: { type: mongoose.Schema.Types.ObjectId, ref: "Barberia", default: null },
    
    barberiaId:{ type: mongoose.Schema.Types.ObjectId, ref: "Barbero", default: null },

    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash password antes de guardar
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
