<?php
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Sudoku\SudokuController;
use App\Http\Controllers\Api\ScoreController;
use Illuminate\Container\Attributes\Auth;
use Laravel\Sanctum\Sanctum;
use App\Http\Controllers\UserGameScoreController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/SaveScore', [UserGameScoreController::class, 'saveScore']);

Route::prefix('sudoku')->group(function () {
    Route::post('/new', [SudokuController::class, 'new']);
    Route::post('/validate', [SudokuController::class, 'validateGrid']);
    Route::get('/solve/{id}', [SudokuController::class, 'solve']);
});

