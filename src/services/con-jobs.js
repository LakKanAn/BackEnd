const cron = require("node-cron");
const swapController = require("../controllers/swapController");
cron.schedule(" */1 * * * *", async () => {
  // cron.schedule("01-59 * * * * *", async () => {
  // const during = await swapController.During();
});
