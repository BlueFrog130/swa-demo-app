import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { cosmosInput, cosmosOutput } from '../db';

export type SystemProperties = {
	message_id?: string;
	iothub_connection_device_id?: string;
	iothub_connection_auth_method?: string;
	iothub_connection_auth_generation_id?: string;
	iothub_content_type?: string;
	iothub_content_encoding?: string;
	iothub_enqueuedtime?: string;
	iothub_message_source?: string;
};

export type Body = {
	air_temp?: string;
	water_pH?: number;
	water_temp?: string;
	air_humidity?: string;
	water_tubidity?: string;
};

export type Message = {
	id?: string;
	SystemProperties?: SystemProperties;
	iothub_name?: string;
	Body?: Body;
	_rid?: string;
	_self?: string;
	_etag?: string;
	_attachments?: string;
	_ts?: number;
};

export async function messages(
	request: HttpRequest,
	context: InvocationContext
): Promise<HttpResponseInit> {
	context.log(`Http function processed request for url "${request.url}"`);

	const messages = <Message[]>context.extraInputs.get(cosmosInput);

	return {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(
			messages.map((m) => ({
				id: m.id,
				air_temp: m.Body?.air_temp,
				water_pH: m.Body?.water_pH,
				water_temp: m.Body?.water_temp,
				air_humidity: m.Body?.air_humidity,
				water_tubidity: m.Body?.water_tubidity,
				ts: m._ts * 1000 // Convert to milliseconds
			}))
		)
	};
}

app.http('messages', {
	methods: ['GET', 'POST'],
	authLevel: 'anonymous',
	handler: messages,
	extraInputs: [cosmosInput]
});
