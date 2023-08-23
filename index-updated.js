const express = require("express");
const app = express();
const createKafkaProducer = require("./config/kafkaConfig");
const producer = createKafkaProducer(["localhost:9092"], "my-app");

app.use(express.json());

let initialWebhook = 0;
let webhooksRegistered = [];

app.get("/", async (req, res) => {
  const { jobname, jobends, jobcancel } = req.query;

  console.log(
    "'/' | triggered at @ " +
      new Date() +
      " | ends at @ " +
      new Date(Date.now() + parseInt(jobends) * 1000) +
      " | jobname: " +
      jobname
  );

  try {
    // webhook
    webhooksRegistered.push({
      jobname: jobname,
      jobends: parseInt(jobends),
    });

    await producer.send("one", JSON.stringify({ jobname, jobends }));

    res.send(webhooksRegistered);
  } catch (error) {
    res.send("Error connecting webhook");
  }
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

app.listen(3000, async () => {
  await producer.connect();
  console.log("Example app listening on port 3000!");
});
