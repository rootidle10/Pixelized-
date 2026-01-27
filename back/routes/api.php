<?php
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CrosswordController;
use App\Http\Controllers\api\SudokuController;
use App\Http\Controllers\api\UserGameScoreController;
use App\Http\Controllers\Api\ProfileController;


// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [ProfileController::class, 'show']);
});

Route::post('/SaveScore', [UserGameScoreController::class, 'saveScore']);


Route::prefix('sudoku')->group(function () {
    Route::post('/new', [SudokuController::class, 'new']);
    Route::post('/validate', [SudokuController::class, 'validateGrid']);
    Route::get('/solve/{id}', [SudokuController::class, 'solve']);
});

Route::prefix('crossword')->group(function () {
    Route::post('/new', [CrosswordController::class, 'new']);
    Route::post('/validate', [CrosswordController::class, 'validateGrid']);
    Route::get('/solve/{id}', [CrosswordController::class, 'solve']);
});



