<script lang="ts">
	type ApiData = {
		id: string;
		Properties: {
			'iothub-creation-time-utc': string;
		};
		SystemProperties: {
			'message-id': string;
			'iothub-connection-device-id': string;
			'iothub-connection-auth-method': string;
			'iothub-connection-auth-generation-id': string;
			'iothub-content-type': string;
			'iothub-content-encoding': string;
			'iothub-enqueuedtime': string;
			'iothub-message-source': string;
		};
		'iothub-name': string;
		Body: {
			air_temp: string;
			water_pH: number;
			water_temp: string;
			air_humidity: string;
			water_turbidity: string;
		};
		_rid: string;
		_self: string;
		_etag: string;
		_attachments: string;
		_ts: number;
	}[];

	let data: Promise<ApiData> | undefined = $state();

	const dateFormatter = Intl.DateTimeFormat('en-US', {
		dateStyle: 'short',
		timeStyle: 'medium'
	});

	const formatDate = (ts: string) => {
		if (!ts) {
			return '';
		}
		return dateFormatter.format(new Date(ts));
	};

	const fetchApi = () => {
		data = fetch('/api/messages').then((response) => response.json());
	};
</script>

<div class="container mx-auto py-11 px-2">
	<div class="flex gap-2 mb-4">
		<button onclick={fetchApi}>Fetch Data</button>
	</div>
	{#if data === undefined}
		<p>Click a button to fetch data.</p>
	{:else}
		{#await data}
			<p>Loading...</p>
		{:then messages}
			<table>
				<thead>
					<tr>
						<th>Id</th>
						<th>Air Temperature</th>
						<th>Water pH</th>
						<th>Water Temperature</th>
						<th>Air Humidity</th>
						<th>Water Turbidity</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
					{#each messages as message}
						<tr>
							<td>{message.id}</td>
							<td>{message.Body.air_temp}</td>
							<td>{message.Body.water_pH}</td>
							<td>{message.Body.water_temp}</td>
							<td>{message.Body.air_humidity}</td>
							<td>{message.Body.water_turbidity}</td>
							<td>{formatDate(message.Properties['iothub-creation-time-utc'])}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/await}
	{/if}
</div>
