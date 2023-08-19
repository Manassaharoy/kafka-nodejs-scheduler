const express = require("express");
const app = express();
// const schedule = require("node-schedule");
const axios = require("axios");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"], // Change to your Kafka broker addresses
});

const producer = kafka.producer();

app.use(express.json());

let initialWebhook = 0;
let webhooksRegistered = [];

app.get("/", async (req, res) => {
  const { jobname, jobends } = req.query;

  console.log(
    "'/' | triggered at @ " +
      new Date() +
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

  await producer.connect();
  await producer.send({
    topic: "one",
    messages: [
      {
        value: JSON.stringify({ jobname, jobends }),
      },
    ],
  });
  await producer.disconnect();

  res.send(webhooksRegistered);
});

app.post("/webhook", (req, res) => {
  console.log(
    "'/webhook' | triggered at @ " +
      new Date() +
      " | jobname: " +
      req.query.jobname
  );
  res.json({
    data: `${req.query.jobname} is called through webhook @ ${new Date()}`,
  });
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
