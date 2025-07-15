<script lang="ts">
	type ApiData = {
		id: string;
		air_temp: string;
		water_pH: number;
		water_temp: string;
		air_humidity: string;
		water_tubidity: string;
		ts: number;
	}[];

	type GraphQLData = {
		data: {
			messages: {
				endCursor: string;
				hasNextPage: boolean;
				items: {
					id: string;
					Body: {
						air_temp: string;
						water_pH: number;
						water_temp: string;
						air_humidity: string;
						water_tubidity: string;
					};
					_ts: number;
				}[];
			};
		};
	};

	let data: Promise<ApiData> | undefined = $state();

	const dateFormatter = Intl.DateTimeFormat('en-US', {
		dateStyle: 'short',
		timeStyle: 'medium'
	});

	const formatDate = (ts: number) => dateFormatter.format(new Date(ts));

	const fetchApi = () => {
		data = fetch('/api/messages').then((response) => response.json());
	};

	const fetchGraphQL = () => {
		data = fetch('/data-api/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: `
query GetMessages {
  messages {
    endCursor
    hasNextPage
    items {
      id
      Body {
        air_humidity
        air_temp
        water_pH
        water_temp
        water_tubidity
      }
      _ts
    }
  }
}`
			})
		})
			.then((response) => response.json())
			.then(
				({ data }: GraphQLData) =>
					data.messages.items.map((item) => ({
						id: item.id,
						air_temp: item.Body.air_temp,
						water_pH: item.Body.water_pH,
						water_temp: item.Body.water_temp,
						air_humidity: item.Body.air_humidity,
						water_tubidity: item.Body.water_tubidity,
						ts: item._ts
					})) as ApiData
			);
	};
</script>

<div class="container mx-auto py-11 px-2">
	<div class="flex gap-2 mb-4">
		<button onclick={fetchApi}>Fetch Api</button>
		<button onclick={fetchGraphQL}>Fetch GraphQL</button>
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
							<td>{message.air_temp}</td>
							<td>{message.water_pH}</td>
							<td>{message.water_temp}</td>
							<td>{message.air_humidity}</td>
							<td>{message.water_tubidity}</td>
							<td>{formatDate(message.ts)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/await}
	{/if}
</div>
