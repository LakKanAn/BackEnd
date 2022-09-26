const KEY = process.env.STRIPE_KEY;
const stripe = require("stripe")(KEY);
const { firestore } = require("../../db/db");
const userModel = require("../models/users");
const bookModel = require("../models/books");
const transactionModel = require("../models/transactions");
const nodemailer = require("nodemailer");
const { nanoid } = require("nanoid");
const GMAIL = process.env.GMAIL_EMAIL;
const PASSWORD = process.env.GMAIL_PASSWORD;

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
        amount: book.price * 100,
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
    const invoiceId = nanoid();
    const orderId = nanoid();
    const createAt = new Date();
    const user = await userModel.getById(userId);
    const paymentIntent = await stripe.paymentIntents.confirm(
      req.body.paymentId,
      { payment_method: "pm_card_visa" }
    );
    const book = await bookModel.getBookById(bookId);
    const data = {};
    data.userId = userId;
    data.bookId = bookId;
    data.amount = book.price;
    data.date = firestore.FieldValue.serverTimestamp();
    data.type = "purchase";
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL,
        pass: PASSWORD,
      },
    });

    const receipt = `<html>
      <body>
        <div class="invoice-box" style="max-width: 800px;margin: auto;padding: 30px;border: 1px solid #eee;box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);font-size: 16px;line-height: 24px;font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;color: #555;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;line-height: inherit;text-align: left;">
            <tr class="top">
              <td colspan="2" style="padding: 5px;vertical-align: top;">
                <table style="width: 100%;line-height: inherit;text-align: left;">
                  <tr>
                    <td class="title" style="padding: 5px;vertical-align: top;padding-bottom: 20px;font-size: 45px;line-height: 45px;color: #333;">
                     <p>LakKanAn</p>
                    </td>

                    <td style="padding: 5px;vertical-align: top;text-align: right;padding-bottom: 20px;">
                      InvoiceId #:${invoiceId}<br>
                      Created:${createAt}<br>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr class="information">
              <td colspan="2" style="padding: 5px;vertical-align: top;">
                <table style="width: 100%;line-height: inherit;text-align: left;">
                  <tr>
                    <td style="padding: 5px;vertical-align: top;padding-bottom: 40px;">
                    Thanks for your purchase from LakKanAn.<br>
                                    ( Please keep a copy of this receipt for your records. )
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr class="heading">
              <td style="padding: 5px;vertical-align: top;background: #eee;border-bottom: 1px solid #ddd;font-weight: bold;">YOUR ORDER INFORMATION:</td>
              <td style="padding: 5px;vertical-align: top;text-align: right;background: #eee;border-bottom: 1px solid #ddd;font-weight: bold;">Bill To</td>
            </tr>
            <tr class="details">
              <td style="padding: 5px;vertical-align: top;padding-bottom: 20px;">OrderID: ${orderId}</td>
              <td style="padding: 5px;vertical-align: top;text-align: right;padding-bottom: 20px;">${user.email}</td>
            </tr>
            <tr class="heading">
              <td style="padding: 5px;vertical-align: top;background: #eee;border-bottom: 1px solid #ddd;font-weight: bold;">Item</td>
              <td style="padding: 5px;vertical-align: top;text-align: right;background: #eee;border-bottom: 1px solid #ddd;font-weight: bold;">Price</td>
            </tr>
            <tr class="item">
              <td style="padding: 5px;vertical-align: top;border-bottom: 1px solid #eee;">${book.bookTitle}</td>
              <td style="padding: 5px;vertical-align: top;text-align: right;border-bottom: 1px solid #eee;">${book.price}</td>
            </tr>
            <tr class="total">
              <td style="padding: 5px;vertical-align: top;"></td>

              <td style="padding: 5px;vertical-align: top;text-align: right;border-top: 2px solid #eee;font-weight: bold;">Total: ${book.price}.00</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
    `;

    const mailOptions = {
      from: GMAIL, // sender
      to: user.email, // list of receivers
      subject: "Hello from LAKKANAN", // Mail subject
      html: receipt,
    };
    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        data.status = "failed";
        await transactionModel.create(data);
        res.status(500).json({
          status: 500,
          message: "Payment and Send Payment Comfirm is failed. ",
        });
      } else {
        await userModel.addBook(userId, bookId);
        data.status = "successful";
        await transactionModel.create(data);
        res.status(201).json({
          status: 201,
          message: "Payment andSend Payment Comfirm Complete. ",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 400, message: "Bad Request", error: error });
  }
};
