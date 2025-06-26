const Review = require("../models/Review");

const reviews = [
];

exports.seedReview = async () => {
  try {
    await Review.insertMany(reviews);
    console.log("Review seeded successfully");
  } catch (error) {
    console.log(error);
  }
};
