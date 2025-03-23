# Car Game

This is a simple car game built using React and the HTML5 Canvas API. The goal of the game is to avoid obstacles and reach a score of 100 points to win.

## Features
- Move the car left or right using arrow keys or A/D keys.
- Avoid randomly spawned obstacles.
- Mobile-friendly touch controls.
- Game over screen when hitting an obstacle.
- Win condition upon reaching 100 points.
- Tracks high score.

## Installation & Setup

To run the game locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Iftiazur/car-game.git
   cd car-game
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Controls
- **Keyboard Controls:**
  - Move Left: Arrow Left or "A"
  - Move Right: Arrow Right or "D"
- **Touch Controls (Mobile):**
  - Left button to move left
  - Right button to move right

## Game Logic
- The car is placed at the bottom of the screen.
- Obstacles spawn from the top and move downward.
- The player must dodge the obstacles.
- Each avoided obstacle increases the score by 10.
- The game ends if the car collides with an obstacle.
- The player wins upon reaching 100 points.

## Technologies Used
- **React**: Frontend framework
- **Canvas API**: Rendering the game objects
- **Tailwind CSS**: Styling
- **Lucide-react**: Icons


## Future Improvements
- Add sound effects and background music.
- Implement difficulty levels.
- Improve mobile responsiveness.
- Add power-ups or collectibles.

## Author
Developed by [Your Name](https://github.com/Iftiazur). Feel free to contribute!

