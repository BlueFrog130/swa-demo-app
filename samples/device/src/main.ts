import 'dotenv/config';
import { Mqtt } from 'azure-iot-device-mqtt';
import { Client, Message } from 'azure-iot-device';

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
	throw new Error('CONNECTION_STRING is not set in the environment variables.');
}

const messagesArg = process.argv.findIndex((arg) => arg.startsWith('--messages'));
const messagesCount = messagesArg !== -1 ? parseInt(process.argv[messagesArg + 1], 10) : 10;

const delay = 5000;

const client = Client.fromConnectionString(connectionString, Mqtt);

let queued: NodeJS.Timeout | null = null;

let messageCount = 0;

const sendMessage = () =>
	new Promise<void>((resolve, reject) => {
		if (messageCount >= messagesCount) {
			clearTimeout(queued!);
			console.log(`Sent ${messagesCount} messages. Exiting...`);
			return resolve();
		}

		const message = new Message(
			JSON.stringify({
				air_temp: `${Math.floor(Math.random() * 30) + 20} °C`,
				water_pH: Number((Math.random() * 2 + 6).toFixed(2)),
				water_temp: `${Math.floor(Math.random() * 10) + 20} °C`,
				air_humidity: `${Math.floor(Math.random() * 50) + 30} %`,
				water_turbidity: `${Math.floor(Math.random() * 100) + 1} NTU`
			})
		);

		message.contentType = 'application/json';
		message.contentEncoding = 'utf-8';
		message.messageId = Date.now().toString();

		message.properties.add('iothub-creation-time-utc', new Date().toISOString());

		console.log(`Sending message ${messageCount}:`, message);

		client.sendEvent(message, (err) => {
			messageCount++;
			if (err) {
				console.error('Error sending message:', err.toString());
				reject(err);
			} else {
				console.log('Message sent successfully');
				resolve();
				const time = Math.random() * 1000 + delay;
				queued = setTimeout(() => {
					sendMessage();
				}, time);
				console.log(`Next message will be sent in ${(time / 1000).toFixed(2)} seconds`);
			}
		});
	});

client.on('connect', () => {
	console.log('Connected to IoT Hub');
	if (queued) return;

	sendMessage();
});

client.on('error', (err) => {
	console.error('Error:', err.message);
	if (queued) {
		clearTimeout(queued);
		queued = null;
	}
});

client.on('disconnect', () => {
	console.log('Disconnected from IoT Hub');
	if (queued) {
		clearInterval(queued);
		queued = null;
	}
});

client.open((err) => {
	if (err) {
		console.error('Could not connect to IoT Hub:', err.message);
	} else {
		console.log('IoT Hub connection established');
	}
});

process.on('SIGINT', () => {
	console.log('Shutting down...');
	if (queued) {
		clearInterval(queued);
	}
	client.close(() => {
		console.log('Client closed');
		process.exit(0);
	});
});
