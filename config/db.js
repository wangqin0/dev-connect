const mongoose = require('mongoose');
const config = require('config');
const mongoConStr = config.get('mongoConStr');

const connectDb = async () => {
  try {
    await mongoose.set('strictQuery', false).connect(mongoConStr);

    console.log('MongoDB connected.');
  } catch (err) {
    console.log(err.message);
    // exit with failure
    process.exit(-1);
  }
}

module.exports = connectDb;
