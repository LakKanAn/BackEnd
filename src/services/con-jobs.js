const cron = require("node-cron");
const swapController = require("../controllers/swapController");
cron.schedule(" */5 * * * *", async () => {
  await swapController.During();
});
