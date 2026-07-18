const User = require('./models/userModel');
const Tool = require('./models/toolModel');
const Request = require('./models/requestModel');
const Favorite = require('./models/favoriteModel');
const Review = require('./models/reviewModel');
const Message = require('./models/messageModel');
const Notification = require('./models/notificationModel');

async function resetSampleData() {
  await Promise.all([
    User.deleteMany({}),
    Tool.deleteMany({}),
    Request.deleteMany({}),
    Favorite.deleteMany({}),
    Review.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({})
  ]);
}

module.exports = {
  resetSampleData
};