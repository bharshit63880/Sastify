const Cart = require("../models/Cart");

const cartItems = [
 
];

exports.seedCart = async () => {
  try {
    await Cart.insertMany(cartItems);
    console.log("Cart seeded successfully");
  } catch (error) {
    console.log(error);
  }
};
