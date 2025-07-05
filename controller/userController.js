const productModel = require("../models/productModel");
const { sendtoken } = require("../utils/sendToken");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { default: mongoose } = require("mongoose");
const Razorpay = require("razorpay");
const axios = require("axios");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");

exports.deleteCollection = async (req, res) => {
  await userModel.deleteMany();
  const user = await userModel.find();
  res.json(user);
};

exports.login = async (req, res) => {
  try {
    const { contact, hack } = req.body;
    const user = await userModel.findOne({ contact: contact });
    const otp = generateOTP();
    if (!hack) {
      // https://2factor.in/API/V1/5cebf5c5-83d5-11ef-8b17-0200cd936042/SMS/+917869748239/1010/OTP1
      await axios.get(
        `https://2factor.in/API/V1/${
          process.env.OPT_API_KEY || "5cebf5c5-83d5-11ef-8b17-0200cd936042"
        }/SMS/+91${contact}/${otp}/OTP1`
      );
    }
    if (!user) {
      const newuser = await userModel.create({
        contact: contact,
        otp: otp,
        password: contact,
      });
      return res
        .status(200)
        .json({ message: "user created succesfully", newuser });
    }
    user.otp = otp;
    await user.save();

    return res.status(200).json({ message: "OTP send succesfully", user });
  } catch (err) {
    return res.json({ message: "Invalid Phone Number - Check Number Format" });
  }
};

exports.verifyotp = catchAsyncErrors(async (req, res) => {
  const { contact, otp } = req.body;
  const user = await userModel
    .findOne({ contact: contact })
    .select("+password")
    .exec();

  if (!user) {
    return res.json({ success: false, message: "User not register" });
  }
  if (user.otp == otp) {
    sendtoken({ message: "User Logged In" }, user, 201, res);
  } else {
    return res.json({ success: false, message: "Wrong Otp" });
  }
});

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // Only send cookie over HTTPS
    sameSite: "None", // Adjust based on your deployment
  });

  res.json({ message: "Successfully signout!", success: true });
};

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await userModel.findById(req.id).populate("cart.product");
  res.status(200).json({
    success: true,
    user,
  });
});

exports.profileupdate = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate({ _id: req.id }, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.single_product = async (req, res) => {
  try {
    const product = await productModel.findOne({ _id: req.params.id });
    if (!product) return res.json({ message: "product not found" });
    res.json({ message: "Single Product Found", data: product });
  } catch (error) {
    console.log("error", error);
    res.status(404).json({ message: "Product Not Found" });
  }
};
exports.search_product = async (req, res) => {
  try {
    const { name } = req.params;
    const products = await productModel.find({
      $or: [
        { product_name: { $regex: name, $options: "i" } },
        { category: { $regex: name, $options: "i" } },
      ],
    });
    res.json(products);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.add_cart = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.id });
    let { cart } = user;
    const productId = new mongoose.Types.ObjectId(req.params.id);

    const productInCart = cart.find((e) => e.product.equals(productId));
    if (productInCart) {
      productInCart.count++;
    } else {
      cart.push({ product: req.params.id, count: 1 });
    }
    await user.save();
    const founduser = await userModel
      .findOne({ _id: req.id })
      .populate("cart.product");

    return res
      .status(201)
      .json({ message: "Product added to cart", cart: founduser.cart });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.remove_cart = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.id });
    let { cart } = user;
    const productId = new mongoose.Types.ObjectId(req.params.id);

    // Find the product in the cart
    const productInCart = cart.find((e) => e.product.equals(productId));

    if (productInCart) {
      if (productInCart.count > 1) {
        // If count is more than 1, decrement the count
        productInCart.count--;
      } else {
        // If count is 1, remove the product from the cart
        cart = cart.filter((e) => !e.product.equals(productId));
        user.cart = cart; // Assign the filtered cart back to the user
      }

      await user.save(); // Save changes to the user

      const founduser = await userModel
        .findOne({ _id: req.id })
        .populate("cart.product");
      return res
        .status(200)
        .json({ message: "Product removed from cart", cart: founduser.cart });
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.find_shop = async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    var allShops = await userModel.find({ role: "shop" });

    var shops = allShops.filter((shop) => {
      const distance = haversineDistance(
        shop?.lat,
        shop?.lon,
        latitude,
        longitude
      );
      if (distance < 10) {
        return shop;
      }
    });

    return res.status(200).json({ shops });
  } catch (error) {
    console.error("Error finding shops:", error);
    return res.status(500).json({ message: "Error finding shops" });
  }
};

exports.autosuggest_google = async (req, res) => {
  const { data } = await axios.post(
    "https://places.googleapis.com/v1/places:searchText",
    { textQuery: req.query.q },
    {
      headers: {
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask":
          "places.formattedAddress,places.location,places.shortFormattedAddress",

        "Content-Type": "application/json",
      },
    }
  );

  res.json(data.places);
};

// create order
exports.create_order = async (req, res) => {
  const { paymentMethod, city, area, house_no, landmark, pincode } = req.body;
  try {
    const user = await userModel
      .findOne({ _id: req.id })
      .populate("cart.product");
    const cart = user.cart;
    user.cart = [];
    cart.forEach(async (item) => {
      const order = await orderModel.create({
        customer: req.id,
        owner: item.product.shop_id,
        product: item.product,
        count: item.count,
        totalAmount: item.count * item.product.price,
        city: city,
        area: area,
        house_no: house_no,
        landmark: landmark,
        pincode: pincode,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod == "COD" ? "Pending" : "Completed",
      });
      user.orders.push(order._id);
      await user.save();
      const shop = await userModel.findOne({ _id: item.product.shop_id });
      shop.shoporders.push(order._id);
      await shop.save();
    });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.user_order = async (req, res) => {
  const user = await userModel.findOne({ _id: req.id }).populate({
    path: "orders",
    populate: {
      path: "product",
    },
  });
  res.status(200).json({ orders: user.orders });
};
exports.cancel_order = async (req, res) => {
  try {
    const order = await orderModel.findOne({ _id: req.params.id });
    order.orderStatus = "cancelled";
    await order.save();
    res.status(200).json({ message: "Order Cancelled Succesfully" });
  } catch (err) {
    console.log(err);
  }
};
exports.update_profile = async (req, res) => {
  const user = await userModel.findOne({ _id: req.id });
  user.profilepic = req.body.url;
  await user.save();
  res.status(200).json({ user });
};

exports.payment_gateway = async (req, res) => {
  const user = await userModel
    .findOne({ _id: req.id })
    .populate("cart.product");
  var tot = 0;
  user.cart.map((e) => {
    tot += e.count * e.product.price;
  });

  const razorpay = new Razorpay({
    key_id: "rzp_test_LQzqvbK2cWMGRg", // rzp_test_GuqZTaK14cKpuo
    key_secret: "PwCxDvLmPtKVKxZP5BM7eFFx", // 2PGLEdDfYbSGA9oDmIWtj
  });

  const options = {
    amount: tot * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  const order = await razorpay.orders.create(options); // i am getting error in this line
  res.status(200).json(order);
};

function generateOTP() {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  if (otp.length == 4) return otp;
  generateOTP();
}

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
