const stripe = require("stripe")(
  "sk_test_51L035SAvigZBFU12Ze2gPRfAPvaNKkhYEYQvbWh5JDxXrsC02WCWAGqQPCqhmXOd01IEDwm2k1Ff49pt5PFDVszv00nXM5JGy5"
);
const { admin, firestore } = require("../../db/db");
const userModel = require("../models/users");
const bookModel = require("../models/books");
const transactionModel = require("../models/transactions");

exports.create = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const user = await userModel.getById(userId);
    const book = await bookModel.getBookById(bookId);
    const checkBook = await userModel.getBookById(userId, bookId);
    if (checkBook === undefined || checkBook === null) {
      const customer = await stripe.customers.create({
        name: user.displayName,
        email: user.email,
        description: "customer",
      });
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        amount: book.price + 000,
        currency: "thb",
        payment_method_types: ["card"],
      });
      return res.status(200).json({
        status: 200,
        message: "successful",
        paymentId: paymentIntent.id,
        paymentId: paymentIntent.id,
      });
    }
    if (checkBook.bookId == book.bookId) {
      return res
        .status(200)
        .json({ status: 200, message: "This book you have already bought." });
    }
  } catch (error) {
    // console.log(error);
    res.status(400).json({ status: 400, message: "Bad Request", error: error });
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const paymentIntent = await stripe.paymentIntents.confirm(
      req.body.paymentId,
      { payment_method: "pm_card_visa" }
    );
    const book = await bookModel.getBookById(bookId);
    await userModel.addBook(userId, bookId);
    const data = {};
    data.userId = userId;
    data.bookId = bookId;
    data.amount = book.price;
    data.date = firestore.FieldValue.serverTimestamp();
    data.type = "purchase";
    data.status = "successful";
    await transactionModel.create(data);
    console.log();
    res.status(200).json({ status: 200, message: " Payment successful" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 400, message: "Bad Request", error: error });
  }
};
