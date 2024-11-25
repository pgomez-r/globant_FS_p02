//Define API result json fields needed as a variable type so TS won't complain

const	searchForm = document.getElementById('search-form') as HTMLFormElement;
const	searchText= document.getElementById('search-box') as HTMLInputElement;
const	loginButton = document.getElementById('login-button') as HTMLElement;
const	mapView = document.getElementById('map');
const	textArea = document.getElementById('ai-text');
const	restaurants = document.getElementById('restaurants');
const	accommodations = document.getElementById('accommodations');

const	apiKey : string = "AIzaSyAJpVjJ8zJAWyMwYttVoBaK54jlCrPIaNE";
const	apiEndPoint : string = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText?key=${apiKey}`;

if (searchForm) {
	searchForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		await searchBar();
	});
}

// TODO: IMPORTANTE antes de seguir - comprobar docker-server-rutas-display...
// Protect fetching with try-catch or .then-.catch (understan difference first!)
async function searchBar()
{
	if (searchForm)
	{
		const 	query = searchText.value;
		const	response = await fetch(apiEndPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ prompt: query })
		});
		const data = await response.json();
		if (!response.ok)
			alert("An error occurred while AI was generating text.");
		else
		{
			if (textArea)
				textArea.innerText = data.candidates[0].output;
		}
	}
}
