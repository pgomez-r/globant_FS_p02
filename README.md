# GLOBANTx42 FullStack - Project 02 - TripRecommendator

## Under construction...

TripRecommendator is the first draft of an under-construction project which aims to be an AI-based trip recommendator that shows you the best places to stay and to eat in a certain city, using Gemini AI language model and Google Maps and Places APIs. 

<div style="text-align: center;">
    <img src="https://github.com/user-attachments/assets/03cc090d-9c51-44a8-96ac-285a60d65d6f" alt="Project Screenshot" style="width: 100%; max-width: 1600px;">
</div>

## Technologies Used

- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Docker**: A platform for developing, shipping, and running applications.
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: A minimal and flexible Node.js web application framework.
- **dotenv**: A zero-dependency module that loads environment variables from a `.env` file.
- **@google/generative-ai**: A library to interact with Google's generative AI models.
- **Google Maps and Places API**: APIs to integrate maps and place search functionalities.

## Usage Guide

1. **Clone the repository**:
    ```sh
    git clone https://github.com/pgomez-r/globant_FS_p02
    ```

2. **Navigate to the project directory**:
    ```sh
    cd globant_FS_p02/ex00
    ```

3. **Modify the `.env` file** with your actual API keys:
    ```env
    GEMINI_API_KEY=INSERT_HERE_YOUR_GEMINI_API_KEY
    MAPS_API_KEY=INSERT_HERE_YOUR_GOOGLEMAPS_API_KEY
    ```

4. **Deploy using Docker**:
	A Makefile with some useful rules to get Docker ready and running for you, you can take a look at it or just type:
    ```sh
    make
    ```

5. **Access the website**:
    Open your browser and go to `http://localhost:5500`.

## Future Improvements

- Better Docker setup for both deployment and development.
- More optimized API consumption.
- Add geolocation in the browser so when first entering the web, the user is asked to share their location and using that, the first search and recommendation is automatically done.
- Dark mode.
- Text input improvement
- Show more functionality for place results.
- Better styling in general.
- Accessibility focus
