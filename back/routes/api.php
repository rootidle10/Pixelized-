<?php
use App\Http\Controllers\Sudoku\SudokuController;
use Illuminate\Support\Facades\Route;


Route::prefix('sudoku')->group(function() {
    Route::post('/new', [SudokuController::class, 'new']);
    Route::post('/validate', [SudokuController::class, 'validateGrid']);
    Route::get('/solve/{id}', [SudokuController::class, 'solve']);
    
});
