
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
//const	loginButton = document.getElementById('login-button') as HTMLElement;
const	mapView = document.getElementById('map');
const	textArea = document.getElementById('ai-text');
const	restaurantsDiv = document.getElementById('restaurants');
const	accommodationsDiv = document.getElementById('accommodations');

//APIs Credentials - Need to mock to be parsed from .json or .env ALSO IN INDEX.HTML!!
const	apiKey: string = "AIzaSyAJpVjJ8zJAWyMwYttVoBaK54jlCrPIaNE";
const	apiEndPoint: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
const	mapKey:	string = "AIzaSyC92vMGMqQMVtmyXkNFtdEFpBQ__IrZL_E"

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
					await displayGooglePlaces(cityResult.latitude, cityResult.longitude);
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

async function displayGooglePlaces(latitude: string, longitude: string)
{
	const	restaurants = await fetchGooglePlaces(latitude, longitude, 'restaurant');
	const	accommodations = await fetchGooglePlaces(latitude, longitude, 'lodging');
  
	if (restaurantsDiv)
	{
		restaurantsDiv.innerHTML = '';
		restaurants.forEach(place => {
			const card = createCard(place);
			restaurantsDiv.appendChild(card);
		});
	}
	if (accommodationsDiv) {
		accommodationsDiv.innerHTML = '';
		accommodations.forEach(place => {
			const card = createCard(place);
			accommodationsDiv.appendChild(card);
	  });
	}
  }

async function fetchGooglePlaces(latitude: string, longitude: string, type: string): Promise<PlaceResult[]>
{
	const	response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=${type}&key=${mapKey}`);
	const	data = await response.json();
	return data.results.slice(0, 4).map((place: any) => ({
		name: place.name,
		address: place.vicinity,
		rating: place.rating
	}));
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
