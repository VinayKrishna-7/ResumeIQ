require('dotenv').config();
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    console.log('--- Testing DB Connection ---');
    await connectDB();

    console.log('--- Testing User Model Creation ---');
    const email = `test_${Date.now()}@example.com`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('secretPassword123', salt);

    const user = await User.create({
      name: 'Test Candidate',
      email,
      passwordHash,
      targetRole: 'Full Stack Engineer',
      experienceLevel: 'Mid Level'
    });

    console.log('✅ User created:', user.name, user.email, 'ID:', user._id.toString());
    const jsonUser = user.toJSON();
    if (jsonUser.passwordHash) {
      throw new Error('passwordHash was leaked in toJSON()');
    }
    console.log('✅ Password hash safely omitted from JSON output');

    const found = await User.findById(user._id);
    const isMatch = await bcrypt.compare('secretPassword123', found.passwordHash);
    console.log('✅ Bcrypt verification match:', isMatch);

    await User.deleteOne({ _id: user._id });
    console.log('✅ User cleaned up successfully');

    await disconnectDB();
    console.log('🎉 DB & User Model Test Passed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

test();
