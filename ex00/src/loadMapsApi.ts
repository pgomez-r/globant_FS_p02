
fetch('/env')
	.then(response => response.json())
	.then(env => {
	const apiKey = env.GOOGLE_MAPS_API_KEY;

	const script = document.createElement('script');
	script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
	script.async = true;
	script.defer = true;

	document.head.appendChild(script);
	})
	.catch(error => {
	console.error('Error loading environment variables:', error);
});
