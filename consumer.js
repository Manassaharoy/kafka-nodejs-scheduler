const { Kafka } = require("kafkajs");
const axios = require("axios");
const schedule = require("node-schedule");

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
