const { Kafka } = require("kafkajs");
const axios = require("axios");
const schedule = require("node-schedule");
const express = require("express");
const app = express();

app.use(express.json());

let scheduledJobs = {}; // To store the scheduled jobs

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"], // Change to your Kafka broker addresses
});

const consumer = kafka.consumer({ groupId: "room-creation-consumer" });

const processRoomExpiry = async (message) => {
  const { jobname, jobends } = JSON.parse(message.value.toString());

  const jobStartTime = new Date(Date.now() + parseInt(jobends) * 1000); // 10 seconds from now

  console.log(new Date() + " ----  " + jobStartTime);

  const job = schedule.scheduleJob(jobStartTime, async function () {
    await axios
      .post(`http://localhost:3000/webhook?jobname=${jobname}`)
      .then((data) => {
        console.log(data.data);
      });
  });

  const jobId = `job_${jobname}`;
  scheduledJobs[jobId] = { job: job, running: true };
};

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "one",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      await processRoomExpiry(message);
    },
  });
};

run().catch(console.error);

app.get("/", (req, res) => {
  res.send("Consumer is running!");
});

app.get("/jobs", (req, res) => {
  // Return a list of job IDs
  res.json(Object.keys(scheduledJobs));
});

app.get("/checkjob", (req, res) => {
  const jobId = req.query.jobname;
  if (scheduledJobs[jobId]) {
    // Check if the job is still running
    const jobStatus = scheduledJobs[jobId].running > 0 ? "running" : "idle";
    res.json({ status: jobStatus });
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

app.delete("/stopjob", (req, res) => {
  const jobId = req.query.jobname;
  if (scheduledJobs[jobId]) {
    // Cancel the job
    scheduledJobs[jobId].job.cancel();
    scheduledJobs[jobId].running = false; // Update the status to idle
    res.json({ message: "Job canceled" });
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

app.listen(3001, () => {
  console.log("consumer service running on port 3001");
});
