const { admin, firestore } = require("../../db/db");
const bookModel = require("../models/books");
const nodemailer = require("nodemailer");
const { nanoid } = require("nanoid");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");
const userModel = require("../models/users");
const transactionModel = require("../models/transactions");
const GMAIL = process.env.GMAIL_EMAIL;
const PASSWORD = process.env.GMAIL_PASSWORD;
exports.getAll = async (req, res, next) => {
  try {
    let books = [];
    let bookImages = [];
    const snapshop = await bookModel.getBookAll();
    snapshop.forEach((doc) => {
      let data = doc.data();
      books.push({ ...data, id: doc.id });
    });
    for (let i = 0; i < books.length; i++) {
      bookImages.push(await minioService.getCoverBook(books[i].bookImage));
    }
    for (let i = 0; i < books.length; i++) {
      const buffer = books[i];
      buffer.bookImage = bookImages[i];
    }
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
exports.getCoverBookImages = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    const coverBook = await minioService.getCoverBook(book.bookImage);
    res.status(200).json({ status: 200, coverBook });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, error: errors.array() });
  }
  try {
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    if (!book) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (book.release === false) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      const coverBook = await minioService.getCoverBook(book.bookImage);
      book.bookImage = coverBook;
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

    const checkBook = await userModel.getBookById(userId, bookId);
    console.log(checkBook);
    console.log(book.bookId);
    if (checkBook == undefined || checkBook == null) {
      console.log("2124");
      await userModel.addBook(userId, bookId, book);
      const data = {};
      data.userId = userId;
      data.bookId = bookId;
      data.amount = book.price;
      data.date = firestore.FieldValue.serverTimestamp();
      data.type = "purchase";
      data.status = "successful";
      const transactions = await transactionModel.create(data);
    } else if (checkBook.bookId == book.bookId) {
      return res
        .status(200)
        .json({ status: 200, msg: "This book you have already bought." });
    } else {
      const addBook = await userModel.addBook(userId, bookId, book);
      const data = {};
      data.userId = userId;
      data.bookId = bookId;
      data.amount = book.price;
      data.date = firestore.FieldValue.serverTimestamp();
      data.type = "purchase";
      data.status = "successful";
      const transactions = await transactionModel.create(data);
    }
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
      if (err) {
        res
          .status(500)
          .json({ status: 500, message: "Send Payment Comfirm is failed. " });
      } else {
        res
          .status(200)
          .json({ status: 200, message: "Send Payment Comfirm Complete. " });
      }
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
