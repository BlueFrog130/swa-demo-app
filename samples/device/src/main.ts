import 'dotenv/config';
import { Mqtt } from 'azure-iot-device-mqtt';
import { Client, Message } from 'azure-iot-device';

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
	throw new Error('CONNECTION_STRING is not set in the environment variables.');
}

const delay = process.argv.includes('--delay')
	? parseInt(process.argv[process.argv.indexOf('--delay') + 1], 10)
	: 1000;

const client = Client.fromConnectionString(connectionString, Mqtt);

let interval: NodeJS.Timeout | null = null;

client.on('connect', () => {
	console.log('Connected to IoT Hub');
	if (interval) return;

	interval = setInterval(() => {
		const message = new Message(
			JSON.stringify({
				air_temp: `${Math.floor(Math.random() * 30) + 20} °C`,
				water_pH: Number((Math.random() * 2 + 6).toFixed(2)),
				water_temp: `${Math.floor(Math.random() * 10) + 20} °C`,
				air_humidity: `${Math.floor(Math.random() * 50) + 30} %`,
				water_tubidity: `${Math.floor(Math.random() * 100) + 1} NTU`
			})
		);

		message.contentType = 'application/json';
		message.contentEncoding = 'utf-8';
		message.messageId = Date.now().toString();

		console.log('Sending message:', message.getData());

		client.sendEvent(message, (err) => {
			if (err) {
				console.error('Error sending message:', err.toString());
			} else {
				console.log('Message sent successfully');
			}
		});
	}, delay);
});

client.on('error', (err) => {
	console.error('Error:', err.message);
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
});

client.on('disconnect', () => {
	console.log('Disconnected from IoT Hub');
	if (interval) {
		clearInterval(interval);
		interval = null;
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
	if (interval) {
		clearInterval(interval);
	}
	client.close(() => {
		console.log('Client closed');
		process.exit(0);
	});
});
