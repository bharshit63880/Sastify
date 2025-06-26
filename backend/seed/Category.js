const Category = require("../models/Category");

const categories = [
  { _id: "65a7e24602e12c44f599442c", name: "smartphones" },
  { _id: "65a7e24602e12c44f599442d", name: "laptops" },
  { _id: "65a7e24602e12c44f599442e", name: "fragrances" },
  { _id: "65a7e24602e12c44f599442f", name: "skincare" },
  { _id: "65a7e24602e12c44f5994430", name: "groceries" },
  { _id: "65a7e24602e12c44f5994431", name: "home-decoration" },
  { _id: "65a7e24602e12c44f5994432", name: "furniture" },
  { _id: "65a7e24602e12c44f5994433", name: "dresses" },
];

exports.seedCategory = async () => {
  try {
    await Category.insertMany(categories);
    console.log("Category seeded successfully");
  } catch (error) {
    console.log(error);
  }
};
