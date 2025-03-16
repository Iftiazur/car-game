"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MoveRight, MoveLeft } from "lucide-react"

// Game constants
const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 500
const CAR_WIDTH = 50
const CAR_HEIGHT = 80
const OBSTACLE_WIDTH = 60
const OBSTACLE_HEIGHT = 60
const OBSTACLE_SPEED = 4
const OBSTACLE_SPAWN_RATE = 60 // Frames between obstacle spawns
const HIGH_SCORE_TO_WIN = 100

interface GameObject {
  x: number
  y: number
  width: number
  height: number
}

export default function CarGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  // Game state refs (to avoid closure issues in animation loop)
  const gameStateRef = useRef({
    car: {
      x: CANVAS_WIDTH / 2 - CAR_WIDTH / 2,
      y: CANVAS_HEIGHT - CAR_HEIGHT - 20,
      width: CAR_WIDTH,
      height: CAR_HEIGHT,
      speed: 5,
    },
    obstacles: [] as GameObject[],
    keys: {
      left: false,
      right: false,
    },
    frameCount: 0,
    score: 0,
    gameActive: false,
    gameOver: false,
    win: false,
  })

  // Initialize game
  const startGame = () => {
    if (canvasRef.current) {
      gameStateRef.current = {
        car: {
          x: CANVAS_WIDTH / 2 - CAR_WIDTH / 2,
          y: CANVAS_HEIGHT - CAR_HEIGHT - 20,
          width: CAR_WIDTH,
          height: CAR_HEIGHT,
          speed: 5,
        },
        obstacles: [],
        keys: {
          left: false,
          right: false,
        },
        frameCount: 0,
        score: 0,
        gameActive: true,
        gameOver: false,
        win: false,
      }

      setScore(0)
      setGameActive(true)
      setGameOver(false)
      setWin(false)
    }
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "ArrowLeft" || e.key.toLowerCase() === "a") && gameStateRef.current.gameActive) {
        gameStateRef.current.keys.left = true
      }
      if ((e.key === "ArrowRight" || e.key.toLowerCase() === "d") && gameStateRef.current.gameActive) {
        gameStateRef.current.keys.right = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        gameStateRef.current.keys.left = false
      }
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        gameStateRef.current.keys.right = false
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (!gameActive) return

    let animationFrameId: number
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    // Load car image
    const carImg = new Image()
    carImg.crossOrigin = "anonymous"
    carImg.src =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(`
<svg width="50" height="80" viewBox="0 0 50 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Car Body -->
  <rect x="5" y="20" width="50" height="60" rx="10" fill="#6a0dad" stroke="#000" stroke-width="2"/>
  
  <!-- Hood & Roof -->
  <rect x="10" y="10" width="40" height="25" rx="5" fill="#6a0dad" stroke="#000" stroke-width="2"/>
  
  <!-- Racing Stripes -->
  <rect x="22" y="10" width="6" height="70" fill="white"/>
  <rect x="32" y="10" width="6" height="70" fill="white"/>
  
  <!-- Windows -->
  <rect x="12" y="15" width="36" height="15" rx="3" fill="#a8dadc" stroke="#000" stroke-width="1"/>
  
  <!-- Headlights -->
  <circle cx="12" cy="32" r="5" fill="#f1faee" stroke="#000" stroke-width="1"/>
  <circle cx="48" cy="32" r="5" fill="#f1faee" stroke="#000" stroke-width="1"/>
  
  <!-- Front Grille -->
  <rect x="20" y="30" width="20" height="4" fill="black"/>
  
  <!-- Taillights -->
  <rect x="10" y="75" width="8" height="5" rx="2" fill="#e63946"/>
  <rect x="42" y="75" width="8" height="5" rx="2" fill="#e63946"/>
  
  <!-- Wheels -->
  <circle cx="15" cy="80" r="7" fill="black" stroke="#000" stroke-width="2"/>
  <circle cx="15" cy="80" r="3" fill="gray"/>
  <circle cx="45" cy="80" r="7" fill="black" stroke="#000" stroke-width="2"/>
  <circle cx="45" cy="80" r="3" fill="gray"/>
</svg>
`)

    // Load obstacle image
    const obstacleImg = new Image()
    obstacleImg.crossOrigin = "anonymous"
    obstacleImg.src =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(`
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Rock/obstacle -->
  <path d="M10 40L5 25L15 15L30 5L45 15L55 30L50 45L35 55L20 50L10 40Z" fill="#6d6875" />
  <path d="M15 40L10 30L20 20L30 15L40 20L45 30L40 40L30 45L20 40L15 40Z" fill="#b5838d" />
  <path d="M20 35L18 30L22 25L30 22L35 25L38 30L35 35L30 38L25 35L20 35Z" fill="#e5989b" />
</svg>
`)

    const gameLoop = () => {
      if (!gameStateRef.current.gameActive) return

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw road background
      ctx.fillStyle = "#333"
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw road markings
      ctx.strokeStyle = "#FFF"
      ctx.setLineDash([20, 20])
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH / 2, 0)
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
      ctx.stroke()
      ctx.setLineDash([])

      // Update car position
      if (gameStateRef.current.keys.left) {
        gameStateRef.current.car.x -= gameStateRef.current.car.speed
      }
      if (gameStateRef.current.keys.right) {
        gameStateRef.current.car.x += gameStateRef.current.car.speed
      }

      // Keep car within bounds
      if (gameStateRef.current.car.x < 0) {
        gameStateRef.current.car.x = 0
      }
      if (gameStateRef.current.car.x > CANVAS_WIDTH - CAR_WIDTH) {
        gameStateRef.current.car.x = CANVAS_WIDTH - CAR_WIDTH
      }

      // Draw car
      ctx.drawImage(carImg, gameStateRef.current.car.x, gameStateRef.current.car.y, CAR_WIDTH, CAR_HEIGHT)

      // Spawn obstacles
      gameStateRef.current.frameCount++
      if (gameStateRef.current.frameCount % OBSTACLE_SPAWN_RATE === 0) {
        const x = Math.random() * (CANVAS_WIDTH - OBSTACLE_WIDTH)
        gameStateRef.current.obstacles.push({
          x,
          y: -OBSTACLE_HEIGHT,
          width: OBSTACLE_WIDTH,
          height: OBSTACLE_HEIGHT,
        })
      }

      // Update and draw obstacles
      for (let i = 0; i < gameStateRef.current.obstacles.length; i++) {
        const obstacle = gameStateRef.current.obstacles[i]
        obstacle.y += OBSTACLE_SPEED

        // Draw obstacle
        ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT)

        // Check collision
        if (
          obstacle.x < gameStateRef.current.car.x + gameStateRef.current.car.width &&
          obstacle.x + obstacle.width > gameStateRef.current.car.x &&
          obstacle.y < gameStateRef.current.car.y + gameStateRef.current.car.height &&
          obstacle.y + obstacle.height > gameStateRef.current.car.y
        ) {
          // Collision detected
          gameStateRef.current.gameActive = false
          gameStateRef.current.gameOver = true
          setGameActive(false)
          setGameOver(true)

          // Update high score
          if (gameStateRef.current.score > highScore) {
            setHighScore(gameStateRef.current.score)
          }
        }

        // Remove obstacles that are off-screen
        if (obstacle.y > CANVAS_HEIGHT) {
          gameStateRef.current.obstacles.splice(i, 1)
          i--

          // Increase score when obstacle is avoided
          gameStateRef.current.score += 10
          setScore(gameStateRef.current.score)

          // Check for win condition
          if (gameStateRef.current.score >= HIGH_SCORE_TO_WIN) {
            gameStateRef.current.gameActive = false
            gameStateRef.current.win = true
            setGameActive(false)
            setWin(true)

            // Update high score
            if (gameStateRef.current.score > highScore) {
              setHighScore(gameStateRef.current.score)
            }
          }
        }
      }

      // Continue the game loop
      if (gameStateRef.current.gameActive) {
        animationFrameId = requestAnimationFrame(gameLoop)
      }
    }

    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameActive, highScore])

  // Touch controls for mobile
  const handleTouchLeft = () => {
    gameStateRef.current.keys.left = true
    setTimeout(() => {
      gameStateRef.current.keys.left = false
    }, 100)
  }

  const handleTouchRight = () => {
    gameStateRef.current.keys.right = true
    setTimeout(() => {
      gameStateRef.current.keys.right = false
    }, 100)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full max-w-[400px]">
        <div className="text-white">Score: {score}</div>
        <div className="text-white">High Score: {highScore}</div>
        <div className="text-white">Goal: {HIGH_SCORE_TO_WIN}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-gray-700 rounded-lg"
        />

        {!gameActive && !gameOver && !win && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Car Game</h2>
            <p className="text-white mb-2">Avoid obstacles and reach {HIGH_SCORE_TO_WIN} points to win!</p>
            <p className="text-white mb-4">Use Arrow Keys or A/D to move</p>
            <Button onClick={startGame}>Start Game</Button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Game Over!</h2>
            <p className="text-white mb-2">Your score: {score}</p>
            <p className="text-white mb-4">High score: {highScore}</p>
            <Button onClick={startGame}>Play Again</Button>
          </div>
        )}

        {win && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <h2 className="text-2xl font-bold text-green-500 mb-4">You Win!</h2>
            <p className="text-white mb-2">Happy Birthday!!</p>
            <p className="text-white mb-4">High score: {highScore}</p>
            <Button onClick={startGame}>Play Again</Button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 flex justify-between w-full max-w-[400px] md:hidden">
        <Button variant="outline" className="p-6" onTouchStart={handleTouchLeft} onMouseDown={handleTouchLeft}>
          <MoveLeft className="h-6 w-6" />
        </Button>
        <Button variant="outline" className="p-6" onTouchStart={handleTouchRight} onMouseDown={handleTouchRight}>
          <MoveRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="mt-4 text-white text-sm">
        <p>Controls: Arrow Keys or A/D to move left and right</p>
      </div>
    </div>
  )
}

