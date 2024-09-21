require("dotenv").config();
const express = require("express");
const path = require("node:path");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

app.post("/order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: "INR",
      receipt: "any unique id for every order",
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    res.status(400).send("Not able to create order. Please try again!");
  }
});

app.post("/paymentCapture", (req, res) => {
  try {
    const data = crypto.createHmac("sha256", process.env.KEY_SECRET);

    data.update(JSON.stringify(req.body));

    const digest = data.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
      console.log("request is legit");

      res.json({
        status: "ok",
      });
    } else {
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use("/", (req, res) => {
  try {
    res.status(200).render("home");
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(port, () => {
  console.log(`https://localhost:${port}`);
});
