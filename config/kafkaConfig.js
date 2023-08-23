const { Kafka } = require("kafkajs");

const createKafkaProducer = (brokers, clientId) => {
  const kafka = new Kafka({
    clientId: clientId,
    brokers: brokers,
  });

  const producer = kafka.producer();

  async function connect() {
    await producer.connect();
  }

  async function send(topic, value) {
    await producer.send({
      topic: topic,
      messages: [{ value: value }],
    });
  }

  async function disconnect() {
    await producer.disconnect();
  }

  return {
    connect,
    send,
    disconnect,
  };
};

module.exports = createKafkaProducer;
