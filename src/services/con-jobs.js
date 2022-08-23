const cron = require("node-cron");
const swapController = require("../controllers/swapController");
cron.schedule(" */1 * * * *", async () => {
  const during = await swapController.During();
});
