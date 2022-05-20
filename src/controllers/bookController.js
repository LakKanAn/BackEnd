const { admin, firestore } = require("../../db/db");
const bookModel = require("../models/books");
const nodemailer = require("nodemailer");
const { nanoid } = require("nanoid");
const userModel = require("../models/users");
const GMAIL = process.env.GMAIL_EMAIL;
const PASSWORD = process.env.GMAIL_PASSWORD;
exports.getAll = async (req, res, next) => {
  try {
    const getAll = await bookModel.getBookAll();
    const books = getAll.docs.map((doc) => doc.data());
    res.status(201).json({
      status: 200,
      books: books,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    if (!book) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (book.release === false) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      res.status(201).json({
        status: 200,
        BookDetails: book,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.payment = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const invoiceId = nanoid();
    const orderId = nanoid();
    const createAt = new Date();
    const user = await userModel.getById(userId);
    const book = await bookModel.getBookById(bookId);

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
      subject: "Hello from sender", // Mail subject
      html: receipt,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) console.log(err);
      else console.log(info);
    });
    res.status(200);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
