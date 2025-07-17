import { input, output } from '@azure/functions';

const databaseName = 'messages';
const containerName = 'Message';

export const cosmosInput = input.cosmosDB({
	databaseName,
	containerName,
	sqlQuery: 'SELECT * FROM c ORDER BY c.Properties["iothub-creation-time-utc"] DESC',
	connection: 'CosmosDBConnection'
});

export const cosmosOutput = output.cosmosDB({
	databaseName,
	containerName,
	createIfNotExists: false,
	connection: 'CosmosDBConnection'
});
