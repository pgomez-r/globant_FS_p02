import Papa from 'papaparse';

//Define APIs results interfaces with fields needed so TS won't complain
interface	ApiResponse {
	candidates: { content: { parts: { text: string }[]}}[];
}

interface	CityData {
	name: string;
	latitude: string;
	longitude: string;
}

//Web usable elements stored in variables
const	searchForm = document.getElementById('search-form') as HTMLFormElement;
const	searchText = document.getElementById('search-box') as HTMLInputElement;
//const	loginButton = document.getElementById('login-button') as HTMLElement;
//const	mapView = document.getElementById('map');
//const	mapDiv = document.getElementById('map');
const	textArea = document.getElementById('ai-text');
// const	restaurants = document.getElementById('restaurants');
// const	accommodations = document.getElementById('accommodations');

//APIs Credentials - Need to mock to be parsed from .json or .env
const	apiKey : string = "AIzaSyAJpVjJ8zJAWyMwYttVoBaK54jlCrPIaNE";
const	apiEndPoint : string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

if (searchForm) {
	searchForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		await searchBar();
	});
}

async function searchBar()
{
	if (searchForm)
	{
		let 	query: string = searchText.value;
		const	cityResult: CityData | null = await checkQuery(query)
		if (!cityResult && textArea)
		{
			textArea.innerText = 'Input for search is not a city or could not be found.'
			alert("Input for search is not a city or could not be found");
			return ;
		}
		console.log("CityData: ", cityResult);
		query = "I going to travel to " + cityResult?.name + ". Please recommend me some restaurants and acommodations in the area. Thank you!";
		console.log("Query: ", query);
		try
		{
			
			const	response = await fetch(apiEndPoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					contents: [
						{
							parts: [
								{ text: query }
							]
						}
					]
				})
			});
			console.log("response from POST: ", response);
			const data : ApiResponse = await response.json();
			console.log("data from api response: ", data);
			if (!response.ok)
				alert("An error occurred while AI was generating text.");
			else
			{
				if (textArea)
					textArea.innerText = data.candidates[0].content.parts[0].text;
			}
		}
		catch (error)
		{
			console.error("Error fetching AI generated text:", error);
			if (textArea)
				textArea.innerText = 'An error occurred while generating text.';
		}
		query = "";
	}
}

async function	checkQuery(query: string): Promise<CityData | null>
{
	const	wordCount = query.split(' ');
	if (wordCount.length > 5)
		return (null);
	try
	{
		const response = await fetch('/worldcities.csv');
		const csvText = await response.text();
		console.log(csvText);
		const parsedData = Papa.parse<string[]>(csvText, {
			header: false,
		}).data.flat();
		const normalizedQuery = query
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
		for (const row of parsedData)
		{
			if (row[0] === normalizedQuery)
			{
				return {
					name: row[0],
					latitude: row[2],
					longitude: row[3]
				};
			}
		}
	}
	catch (error) {
		console.error("Error loading or parsing dictionary:", error);
	}
	return (null);
}
