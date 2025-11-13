<?php

use App\Http\Controllers\CrosswordController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Sudoku\SudokuController;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('sudoku')->group(function () {
    Route::match(['get', 'post'], '/new', [SudokuController::class, 'new']);
    Route::post('/validate', [SudokuController::class, 'validateGrid']);
    Route::get('/solve/{id}', [SudokuController::class, 'solve']);
});

Route::prefix('crossword')->group(function () {
    Route::get('/new', [CrosswordController::class, 'new']);
    Route::post('/crossword/validate', [CrosswordController::class, 'validateGrid']);
    Route::get('/solve/{id}', [CrosswordController::class, 'solve']);
});

