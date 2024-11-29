/// <reference types="@types/google.maps" />

fetch('/env')
	.then(response => response.json())
	.then(env => {
	const apiKey = env.MAPS_API_KEY;

	const script = document.createElement('script');
	script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
	script.async = true;
	script.defer = true;

	document.head.appendChild(script);
	})
	.catch(error => {
	console.error('Error loading environment variables:', error);
});

//async function initPlaces() - may need to make a initialization step to match API Doc, not sure yet

async function displayGooglePlaces(cityName: string, latStr: string, lngStr: string)
{
	try
	{
		const	lat: number = parseFloat(latStr);
		const	lng: number = parseFloat(lngStr);
	
		const	restaurants = await findPlaces(cityName, 'restaurants', lat, lng);
		const	accommodations = await findPlaces(cityName, 'lodging', lat, lng);

		const	restaurantsDiv = document.getElementById('restaurants');
		const	accommodationsDiv = document.getElementById('accommodations');
		const	restaurantsHead = document.getElementById('food');
		const	accommodationsHead = document.getElementById('lodge');

		if (restaurantsHead)
			restaurantsHead.innerText = `Where to eat in ${cityName}`;
		if (accommodationsHead)
			accommodationsHead.innerText = `Where to stay in ${cityName}`;
		if (restaurantsDiv) {
			restaurantsDiv.innerHTML = '';
			restaurants.forEach((place: any) => {
				const card = createCard(place);
				restaurantsDiv.appendChild(card);
			});
		}

		if (accommodationsDiv) {
			accommodationsDiv.innerHTML = '';
			accommodations.forEach((place: any) => {
				const card = createCard(place);
				accommodationsDiv.appendChild(card);
			});
		}
	}
	catch (error){
		console.error('Error fetching places:', error);
	}
}

async function	findPlaces(query: string, type: string, lat: number, lng: number): Promise<any[]> {
	const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
	const request = {
		textQuery: `${type} in ${query}`,
		fields: ['*'],
		locationBias: { lat, lng },
		language: 'en-US',
		maxResultCount: 5,
		minRating: 3.5,
		region: 'us',
	};
	console.log('Request parameters:', request);

	//@ts-ignore
	const { places } = await Place.searchByText(request);

	console.log('Places found:', places);

	return places;
}

function	createCard(place: google.maps.places.Place): HTMLElement
{
	const	card = document.createElement('div');
	card.className = 'card';

	if (place.photos && place.photos.length > 0 && place.googleMapsURI)
	{
		const	link = document.createElement('a');
		link.href = place.googleMapsURI;
		link.target = '_blank';
		const	img = document.createElement('img');
		const	photo: google.maps.places.Photo = place.photos[0];
		img.src = photo.getURI();
		img.alt = place.displayName || 'None display name';
		link.appendChild(img);
		card.appendChild(link);
		card.appendChild(img);
	}

	const	name = document.createElement('h3');
	name.textContent = place.displayName || 'Place name not found';
	card.appendChild(name);

	const	address = document.createElement('p');
	address.textContent = place.formattedAddress || 'No address available';
	card.appendChild(address);

	if (place.rating !== undefined)
	{
		const	rating = document.createElement('p');
		rating.textContent = `Rating: ${place.rating}`;
		card.appendChild(rating);
	}

	if (place.priceLevel !== undefined)
	{
		const priceLevel = document.createElement('p');
		priceLevel.textContent = `Price Level: ${place.priceLevel}`;
		card.appendChild(priceLevel);
	}

	return (card);
}

//If init step function has been done, make it globally accesible
//(window as any).initPlaces = initPlaces;
