<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CrosswordController;
use App\Http\Controllers\Api\SudokuController;
use App\Http\Controllers\Api\UserGameScoreController;
use App\Http\Controllers\Api\ProfileController;

// Public auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Games public (SUDOKU)
Route::prefix('sudoku')->group(function () {
    Route::post('/new', [SudokuController::class, 'new']);
    Route::post('/validate', [SudokuController::class, 'validateGrid']);
    Route::get('/solve/{id}', [SudokuController::class, 'solve']);
});

// Games public (CROSSWORD)
Route::prefix('crossword')->group(function () {
    Route::post('/new', [CrosswordController::class, 'new']);
    Route::post('/validate', [CrosswordController::class, 'validateGrid']);
    Route::get('/solve/{id}', [CrosswordController::class, 'solve']);
});

// ✅ Leaderboard (public top 5)
Route::get('/scores/leaderboard', [UserGameScoreController::class, 'leaderboard']);

// Protected (token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/scores', [UserGameScoreController::class, 'saveScore']);
    Route::get('/profile', [ProfileController::class, 'show']);

    // ✅ Leaderboard (my rank)
    Route::get('/scores/leaderboard/me', [UserGameScoreController::class, 'myRank']);
});
