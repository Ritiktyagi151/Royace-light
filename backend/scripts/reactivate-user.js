const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run user:reactivate -- user@example.com');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  await mongoose.connect(mongoUri);
  const User = mongoose.model('User', userSchema);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exitCode = 1;
    return;
  }

  if (user.isActive) {
    console.log(`${email} is already active`);
    return;
  }

  user.isActive = true;
  await user.save();
  console.log(`${email} reactivated successfully`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
