import { input, output } from '@azure/functions';

const databaseName = 'messages';
const containerName = 'Message';

export const cosmosInput = input.cosmosDB({
	databaseName,
	containerName,
	sqlQuery: 'SELECT * FROM c',
	connection: 'CosmosDBConnection'
});

export const cosmosOutput = output.cosmosDB({
	databaseName,
	containerName,
	createIfNotExists: false,
	connection: 'CosmosDBConnection'
});
