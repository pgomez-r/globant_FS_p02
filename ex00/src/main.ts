
import * as dotenv from 'dotenv';

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

dotenv.config();

//Web usable elements stored in variables
const	searchForm = document.getElementById('search-form') as HTMLFormElement;
const	searchText = document.getElementById('search-box') as HTMLInputElement;
//const	loginButton = document.getElementById('login-button') as HTMLElement;
const	mapView = document.getElementById('map');
const	textArea = document.getElementById('ai-text');
const	restaurantsDiv = document.getElementById('restaurants');
const	accommodationsDiv = document.getElementById('accommodations');

//APIs Credentials - Need to mock to be parsed from .json or .env ALSO IN INDEX.HTML!!
const	apiKey: string = process.env.GEMINI_API_KEY || '';
const	mapKey:	string = process.env.MAPS_API_KEY || '';
const	apiEndPoint: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

document.addEventListener('DOMContentLoaded', () => {
	
	showMap("36.699109", "-4.438972", "Málaga");
})

if (searchForm) {
	searchForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		await searchBar();
	});
}

function showMap(latitude: string, longitude: string, placeName: string | null)
{
	const mapIframe = mapView?.querySelector('iframe');
	if (mapIframe)
	{	
		if (placeName === null)
		{
			const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${mapKey}&center=${latitude},${longitude}&zoom=14`;
			mapIframe.src = mapUrl;
		}
		else
		{
			let	search: string = "acommodations+in+" + placeName;
			const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${mapKey}&q=${search}&center=${latitude},${longitude}&zoom=14`;
			mapIframe.src = mapUrl;
		}
	}
}

async function searchBar()
{
	if (searchForm)
	{
		let 	query: string = searchText.value;
		const	cityResult: CityData | null = await checkQuery(query)
		console.log("cityResult from checkQuery", cityResult);
		if (!cityResult && textArea)
		{
			textArea.innerText = 'Input for search is not a city or could not be found.'
			alert("Input for search is not a city or could not be found");
			return ;
		}
		console.log("CityData: ", cityResult);
		query = "I'm visiting " + cityResult?.name + ", " + cityResult?.country
			+ ". Please tell me a brief recommendation of the better rated restaurants and acommodations in the city center and some things to visit. Thank you!";
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
				if (cityResult)
				{
					showMap(cityResult.latitude, cityResult.longitude, cityResult.name);
					await displayGooglePlaces(cityResult.name);
				}
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
		const	response = await fetch('/citydata');
		const	cityDictionary: CityData[] = await response.json();
		const normalizedQuery = query
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
		for (const city of cityDictionary)
		{
			if (city.name === normalizedQuery){
				console.log("Match found:", city);
				return (city);
			}
		}
	}
	catch (error) {
		console.error("Error loading or parsing dictionary:", error);
	}
	return (null);
}

async function displayGooglePlaces(cityName: string)
{
	const	places = await fetchGooglePlaces(cityName);
	if (restaurantsDiv)
	{
		restaurantsDiv.innerHTML = '';
		places.restaurants.forEach(place => {
			const card = createCard(place);
			restaurantsDiv.appendChild(card);
		});
	}
	if (accommodationsDiv) {
		accommodationsDiv.innerHTML = '';
		places.accommodations.forEach(place => {
			const card = createCard(place);
			accommodationsDiv.appendChild(card);
	  });
	}
  }

// async function fetchGooglePlaces(query: string): Promise<{ restaurants: PlaceResult[], accommodations: PlaceResult[] }>
// {
// 	const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
// 		method: 'POST',
// 		headers: {
// 		'Content-Type': 'application/json',
// 		'X-Goog-Api-Key': mapKey,
// 		'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
// 		},
// 		body: JSON.stringify({
// 		textQuery: `restaurants in ${query}`
// 		})
// 	});
// 	const data = await response.json();
// 	const restaurants = data.places.slice(0, 4).map((place: any) => ({
// 		displayName: place.displayName,
// 		formattedAddress: place.formattedAddress,
// 		priceLevel: place.priceLevel
// 	}));

// 	const response2 = await fetch('https://places.googleapis.com/v1/places:searchText', {
// 		method: 'POST',
// 		headers: {
// 		'Content-Type': 'application/json',
// 		'X-Goog-Api-Key': mapKey,
// 		'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
// 		},
// 		body: JSON.stringify({
// 		textQuery: `accommodations in ${query}`
// 		})
// 	});
// 	const data2 = await response2.json();
// 	const accommodations = data2.places.slice(0, 4).map((place: any) => ({
// 		displayName: place.displayName,
// 		formattedAddress: place.formattedAddress,
// 		priceLevel: place.priceLevel
// 	}));

// 	return { restaurants, accommodations };
// }

async function fetchGooglePlaces(query: string): Promise<{ restaurants: PlaceResult[], accommodations: PlaceResult[] }> {
	// Log the request details
	console.log('Requesting restaurants with query:', query);
	console.log('Request URL:', 'https://places.googleapis.com/v1/places:searchText');
	console.log('Request Method:', 'POST');
	console.log('Request Headers:', {
	  'Content-Type': 'application/json',
	  'X-Goog-Api-Key': mapKey,
	  'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
	});
	console.log('Request Body:', JSON.stringify({
	  textQuery: `restaurants in ${query}`
	}));
  
	const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'X-Goog-Api-Key': mapKey,
		'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
	  },
	  body: JSON.stringify({
		textQuery: `restaurants in ${query}`
	  })
	});
  
	// Log the response details
	console.log('Response Status:', response.status);
	console.log('Response Status Text:', response.statusText);
	const data = await response.json();
	console.log('Response Body:', data);
  
	if (!response.ok) {
	  console.error("Error fetching restaurants:", response.statusText);
	  return { restaurants: [], accommodations: [] };
	}
  
	const restaurants = data.places ? data.places.slice(0, 4).map((place: any) => ({
	  displayName: place.displayName,
	  formattedAddress: place.formattedAddress,
	  priceLevel: place.priceLevel
	})) : [];
  
	// Log the request details for accommodations
	console.log('Requesting accommodations with query:', query);
	console.log('Request URL:', 'https://places.googleapis.com/v1/places:searchText');
	console.log('Request Method:', 'POST');
	console.log('Request Headers:', {
	  'Content-Type': 'application/json',
	  'X-Goog-Api-Key': mapKey,
	  'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
	});
	console.log('Request Body:', JSON.stringify({
	  textQuery: `accommodations in ${query}`
	}));
  
	const response2 = await fetch('https://places.googleapis.com/v1/places:searchText', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'X-Goog-Api-Key': mapKey,
		'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
	  },
	  body: JSON.stringify({
		textQuery: `accommodations in ${query}`
	  })
	});
  
	// Log the response details for accommodations
	console.log('Response Status:', response2.status);
	console.log('Response Status Text:', response2.statusText);
	const data2 = await response2.json();
	console.log('Response Body:', data2);
  
	if (!response2.ok) {
	  console.error("Error fetching accommodations:", response2.statusText);
	  return { restaurants, accommodations: [] };
	}
  
	const accommodations = data2.places ? data2.places.slice(0, 4).map((place: any) => ({
	  displayName: place.displayName,
	  formattedAddress: place.formattedAddress,
	  priceLevel: place.priceLevel
	})) : [];
  
	return { restaurants, accommodations };
  }

function createCard(place: PlaceResult): HTMLElement
{
	const card = document.createElement('div');
	card.className = 'result-card';
	const title = document.createElement('h3');
	title.textContent = place.name;
	const address = document.createElement('p');
	address.textContent = place.address;
	const rating = document.createElement('p');
	rating.textContent = `Rating: ${place.rating}`;
	card.appendChild(title);
	card.appendChild(address);
	card.appendChild(rating);
	return (card);
}
