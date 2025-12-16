"use client";

import { useEffect, useRef, useState } from "react";

interface SnakeGameProps {
    onClose: () => void;
}

export default function SnakeGame({ onClose }: SnakeGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Game Config
    const GRID_SIZE = 20;
    const TILE_COUNT = 20; // 400x400 canvas
    const SPEED = 100;

    // Game State
    const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<{ x: number; y: number }>({ x: 15, y: 15 });
    const [velocity, setVelocity] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const velocityRef = useRef({ x: 0, y: 0 }); // Ref for immediate input handling

    // Initialize Game
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    if (velocityRef.current.y !== 1) velocityRef.current = { x: 0, y: -1 };
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    if (velocityRef.current.y !== -1) velocityRef.current = { x: 0, y: 1 };
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    if (velocityRef.current.x !== 1) velocityRef.current = { x: -1, y: 0 };
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    if (velocityRef.current.x !== -1) velocityRef.current = { x: 1, y: 0 };
                    break;
                case "Escape":
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Game Loop
    useEffect(() => {
        if (gameOver || isPaused) return;

        const moveSnake = () => {
            if (velocityRef.current.x === 0 && velocityRef.current.y === 0) return;

            setVelocity(velocityRef.current);

            const newHead = {
                x: snake[0].x + velocityRef.current.x,
                y: snake[0].y + velocityRef.current.y,
            };

            // Wall Collision
            if (newHead.x < 0 || newHead.x >= TILE_COUNT || newHead.y < 0 || newHead.y >= TILE_COUNT) {
                setGameOver(true);
                return;
            }

            // Self Collision
            if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameOver(true);
                return;
            }

            const newSnake = [newHead, ...snake];

            // Food Collision
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore((s) => s + 10);
                setFood({
                    x: Math.floor(Math.random() * TILE_COUNT),
                    y: Math.floor(Math.random() * TILE_COUNT),
                });
            } else {
                newSnake.pop();
            }

            setSnake(newSnake);
        };

        const gameInterval = setInterval(moveSnake, SPEED);
        return () => clearInterval(gameInterval);
    }, [snake, food, gameOver, isPaused]);

    // Render Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear Screen
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Snake
        ctx.fillStyle = "#0f0";
        snake.forEach((segment, index) => {
            // Head is slightly brighter
            if (index === 0) ctx.fillStyle = "#4ade80";
            else ctx.fillStyle = "#22c55e";

            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
        });

        // Draw Food
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

    }, [snake, food]);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 15, y: 15 });
        velocityRef.current = { x: 0, y: 0 };
        setVelocity({ x: 0, y: 0 });
        setScore(0);
        setGameOver(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-green-500/30 p-6 rounded-xl shadow-2xl w-full max-w-md flex flex-col items-center relative animate-in zoom-in-50 duration-300">

                {/* Header */}
                <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-green-500 font-mono text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">terminal</span>
                        SNAKE_OS v1.0
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-white font-mono">
                            SCORE: <span className="text-green-400 font-bold">{score}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Game Container */}
                <div className="relative border-4 border-[#333] rounded-sm bg-black shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        className="block"
                    />

                    {/* Start / Game Over Overlay */}
                    {(gameOver || (velocity.x === 0 && velocity.y === 0)) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                            {gameOver ? (
                                <div className="text-center animate-in zoom-in duration-300">
                                    <h3 className="text-red-500 font-black text-4xl mb-2 tracking-widest uppercase">Game Over</h3>
                                    <p className="text-gray-300 mb-6 font-mono">Final Score: {score}</p>
                                    <button
                                        onClick={resetGame}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded font-mono transition-all transform hover:scale-105"
                                    >
                                        TRY AGAIN
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center animate-pulse">
                                    <p className="text-green-400 font-mono text-sm tracking-wider">PRESS ARROW KEYS / WASD TO START</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="mt-6 flex justify-between w-full text-xs font-mono text-gray-500">
                    <div className="flex gap-2">
                        <span className="px-2 py-1 border border-white/10 rounded">WASD</span>
                        <span className="px-2 py-1 border border-white/10 rounded">ARROWS</span>
                    </div>
                    <div>
                        <span className="px-2 py-1 border border-white/10 rounded">ESC to quit</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
