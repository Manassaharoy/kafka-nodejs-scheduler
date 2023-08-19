const express = require("express");
const app = express();
const schedule = require("node-schedule");
const axios = require("axios");

app.use(express.json());

let initialWebhook = 0;
let webhooksRegistered = [];

app.get("/", (req, res) => {
  const { jobname, jobends } = req.query;

  console.log(
    "'/' | triggered at @ " +
      " | ends at @ " +
      new Date(Date.now() + parseInt(jobends) * 1000) +
      " | jobname: " +
      jobname
  );
  // webhook
  webhooksRegistered.push({
    jobname: jobname,
    jobends: parseInt(jobends),
  });
  //   setTimeout(async () => {
  //     await axios.post("http://localhost:3000/webhook?data=manas");
  //   }, 5000);

  const jobStartTime = new Date(Date.now() + parseInt(jobends) * 1000); // 10 seconds from now

  //   console.log(new Date() + " ----  " + jobStartTime);

  const job = schedule.scheduleJob(jobStartTime, async function () {
    await axios.post(`http://localhost:3000/webhook?jobname=${jobname}`);
  });

  res.send(webhooksRegistered);
});

app.post("/webhook", (req, res) => {
  console.log(
    "'/webhook' | triggered at @ " +
      new Date() +
      " | jobname: " +
      req.query.jobname
  );
  res.json({ data: req.query.jobname });
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
