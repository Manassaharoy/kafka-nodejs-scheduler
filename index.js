const express = require("express");
const app = express();
const axios = require("axios");

app.use(express.json());

let initialWebhook = 0;
let webhooksRegistered = [];

app.get("/", (req, res) => {
  console.log("'/' | trigger at @ " + new Date());
  // webhook
  webhooksRegistered.push(initialWebhook++);
  setTimeout(async () => {
    await axios.post("http://localhost:3000/webhook?data=manas");
  }, 5000);

  res.send(webhooksRegistered);
});

app.post("/webhook", (req, res) => {
  console.log("'/webhook' | trigger at @ " + new Date());
  res.json({ data: req.query.data });
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
