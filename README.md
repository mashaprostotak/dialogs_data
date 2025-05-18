# Personality & Dialogue Strategies Viewer

A web application for exploring how personality traits influence dialogue strategies, inspired by the [Biased Tales demo](https://donya-rooein.github.io/files/biased-tales-demo/index.html).

## Features

- Filter dialogues by personality traits (Conscientiousness, Agreeableness, Extraversion, Openness, Neuroticism)
- Filter by specific dialogue strategies used in the conversations (with AND logic)
- Each strategy is displayed individually for precise filtering
- View complete dialogues between teachers and students
- See all strategies used in each dialogue
- Responsive design that works on desktop and mobile devices
- Automatically shows a random dialogue on load

## How to Run

### Option 1: Using a Local Web Server

1. Install a local web server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code or [http-server](https://www.npmjs.com/package/http-server) for Node.js.

2. Start the server in the root directory of this project.

3. Open your browser and navigate to the local server address (typically http://localhost:5500 or http://localhost:8080).

### Option 2: Using Python's Built-in Server

1. Open a terminal/command prompt in the project directory.

2. Run one of the following commands:
   - Python 3: `python -m http.server`
   - Python 2: `python -m SimpleHTTPServer`

3. Open your browser and navigate to http://localhost:8000.

### Option 3: Open Directly in Browser

- Simply open the `index.html` file in your browser by double-clicking on it.
- Note: Some features might not work properly due to browser security restrictions when opening files directly.

## Usage Instructions

1. **Initial View**:
   - When the page loads, a random dialogue will be displayed automatically.
   - The dialogue is shown directly without any metadata header.

2. **Filter by Personality Traits**:
   - Click on "High" or "Low" for any of the five personality traits to filter dialogues.
   - You can select one value per trait.
   - Click again on a selected button to deselect it.

3. **Filter by Dialogue Strategies**:
   - Each strategy is displayed as an individual checkbox item.
   - Original multi-strategy entries are split into separate individual strategies.
   - Check one or more strategies to filter dialogues.
   - The search will show dialogues that use ALL of the selected strategies (AND logic).

4. **Search**:
   - Click the "Search" button to find dialogues matching your selected criteria.
   - If multiple dialogues match, the first one will be displayed.

5. **Random**:
   - Click "Random" to display a randomly selected dialogue from the dataset.

6. **Reset**:
   - Click "Reset" to clear all selections and show a new random dialogue.

## Data Structure

The application uses the `images_L3.json` file, which contains:

- Personality information (High/Low values for the Big Five traits)
- Complete dialogue transcripts between teacher and student
- Records of strategies used during the conversation

## Troubleshooting

- **Data Not Loading**: Make sure the JSON file is in the correct location (in the same directory as the HTML file or adjust the path in the JavaScript code).
- **Filtering Not Working**: Check the console for any JavaScript errors that might be affecting the filtering functionality.
- **No Results**: If your filters are too restrictive (especially with AND logic on strategies), you might not get any results. Try using fewer filters.

## Credits

- Inspired by the [Biased Tales demo](https://donya-rooein.github.io/files/biased-tales-demo/index.html) by Donya Rooein, Vilém Zouhar, Debora Nozza, and Dirk Hovy. 