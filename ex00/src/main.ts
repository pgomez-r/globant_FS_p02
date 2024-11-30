
//Define APIs results interfaces with fields needed so TS won't complain
interface	ApiResponse {
	candidates: { content: { parts: { text: string }[]}}[];
}

interface	CityData
{
	name: string;
	latitude: string;
	longitude: string;
	country: string;
}

interface	PlaceResult
{
	name: string;
	address: string;
	rating: number;
}

//Web usable elements stored in variables
const	searchForm = document.getElementById('search-form') as HTMLFormElement;
const	searchText = document.getElementById('search-box') as HTMLInputElement;
const	mapView = document.getElementsByClassName('map');
const	mapFrame = document.getElementById('responsive-iframe') as HTMLIFrameElement;
const	textArea = document.getElementById('ai-text');
const	bottomBlock = document.getElementById('bottom-block');
const	tripHeader = document.getElementById('trip-reccommendation');

//APIs Credentials - Need to mock to be parsed from .json or .env ALSO IN INDEX.HTML!!
let		apiKey: string = '';
let		mapKey:	string = '';
let		apiEndPoint: string = '';

document.addEventListener('DOMContentLoaded', async () => {
	try
	{
		const response = await fetch('/env');
		const env = await response.json();
		apiKey = env.GEMINI_API_KEY;
		mapKey = env.MAPS_API_KEY;
		apiEndPoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
		if (!sessionStorage.getItem('logged'))
		{
			showMap("36.699109", "-4.438972", "Málaga");
			sessionStorage.setItem('logged', 'true');
			searchText.value = "Málaga";
			await	searchBar();
			searchText.value = "";
		}
	}
	catch (error){
		alert('Error fetching environment variables, check console log');
		console.error('Error fetching environment variables:', error);
	}
})

if (searchForm) {
	searchForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		await searchBar();
		searchText.value = "";
	});
}

function showMap(latitude: string, longitude: string, placeName: string | null)
{
	if (mapFrame)
	{
		if (bottomBlock && tripHeader)
		{
			bottomBlock.style.display = "flex";
			tripHeader.style.display = "flex";
		}
		let	search: string = "acommodations+in+" + placeName;
		const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${mapKey}&q=${search}&center=${latitude},${longitude}&zoom=14`;
		mapFrame.src = mapUrl;
	}
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
		query = "I'm visiting " + cityResult?.name + ", " + cityResult?.country
			+ ". Please tell me a brief recommendation of the better rated restaurants and acommodations in the city center and some things to visit. Thank you!";
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
			const data : ApiResponse = await response.json();
			if (!response.ok)
				alert("An error occurred while AI was generating text.");
			else
			{
				if (textArea)
					textArea.innerText = data.candidates[0].content.parts[0].text;
				if (cityResult)
				{
					showMap(cityResult.latitude, cityResult.longitude, cityResult.name);
					await displayGooglePlaces(cityResult.name, cityResult.latitude, cityResult.longitude);
				}
			}
		}
		catch (error)
		{
			alert("Error fetching AI generated text, check console log");
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
		const	response = await fetch('/citydata');
		const	cityDictionary: CityData[] = await response.json();
		const normalizedQuery = query
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
		for (const city of cityDictionary)
		{
			if (city.name === normalizedQuery)
				return (city);
		}
	}
	catch (error) {
		console.error("Error loading or parsing dictionary:", error);
	}
	return (null);
}
