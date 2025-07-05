const express = require("express");
const {
  login,
  profileupdate,
  search_product,
  add_cart,
  deleteCollection,
  verifyotp,
  logout,
  getUserDetails,
  single_product,
  remove_cart,
  create_order,
  user_order,
  payment_gateway,
  update_profile,
  find_shop,
  autosuggest_google,
  cancel_order,
} = require("../controller/userController");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

// AUTH
router.get("/logout", logout);
router.post("/login", login);
router.post("/otp", verifyotp);

// PRODUCTS
router.get("/singleproduct/:id", single_product);
router.get("/product/:name", search_product);

// ORDERS
router.get("/user_order", isAuthenticated, user_order);
router.get("/cancel_order/:id", isAuthenticated, cancel_order);
router.post("/create_order", isAuthenticated, create_order);

// USERS
router.get("/me", isAuthenticated, getUserDetails);
router.put("/profileupdate", isAuthenticated, profileupdate);
router.post("/add_cart/:id", isAuthenticated, add_cart);
router.post("/remove_cart/:id", isAuthenticated, remove_cart);
router.post("/update_profile", isAuthenticated, update_profile);

// SHOPS
router.post("/find_shop", find_shop);

// OTHERS
router.get("/payment_gateway", isAuthenticated, payment_gateway);
router.get("/autosuggest_google", autosuggest_google);

module.exports = router;
