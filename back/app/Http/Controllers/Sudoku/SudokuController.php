<?php

namespace App\Http\Controllers\Sudoku;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class SudokuController extends Controller
{
    // Generate a new Sudoku puzzle
    public function new(Request $request)
    {
        $level = $request->input('level', 'easy');
        $id = Str::random(16);

        $solution = $this->solvedBoard();
        $puzzle = $this->removeCells($solution, match($level) {
            'easy' => 35,
            'medium' => 45,
            'hard' => 55,
            default => 45,
        });

        // Store the puzzle and solution
        Storage::disk('local')->put("sudoku/{$id}.json", json_encode([
            'id' => $id,
            'puzzle' => $puzzle,
            'solution' => $solution,
            'created' => time()
        ]));

        return response()->json(['ok' => true, 'id' => $id, 'puzzle' => $puzzle]);
        // return a json response with the puzzle and its ID
    }

    // Validate the submitted Sudoku grid against the stored solution
    public function validateGrid(Request $request)
    {
        $id = $request->input('id');
        $grid = $request->input('grid');

        $data = json_decode(Storage::disk('local')->get("sudoku/{$id}.json"), true);
        $solution = $data['solution'] ?? null;

        if (!$solution) return response()->json(['ok' => false, 'error' => 'not found']);

        $correct = $this->equalGrids($grid, $solution);
        return response()->json(['ok' => true, 'correct' => $correct]);
    }

    public function solve($id)
    {
        $data = json_decode(Storage::disk('local')->get("sudoku/{$id}.json"), true);
        if (!$data) return response()->json(['ok' => false, 'error' => 'not found']);
        return response()->json(['ok' => true, 'solution' => $data['solution']]);
    }

    // Generate a solved Sudoku board 
    private function solvedBoard()
    {
        $base = [
            [1,2,3,4,5,6,7,8,9],
            [4,5,6,7,8,9,1,2,3],
            [7,8,9,1,2,3,4,5,6],
            [2,3,4,5,6,7,8,9,1],
            [5,6,7,8,9,1,2,3,4],
            [8,9,1,2,3,4,5,6,7],
            [3,4,5,6,7,8,9,1,2],
            [6,7,8,9,1,2,3,4,5],
            [9,1,2,3,4,5,6,7,8],
        ];
        shuffle($base);
        return $base;
    }

    // Remove cells from the solved board to create a puzzle
    private function removeCells($board, $count)
    {
        $cells = range(0, 80); 
        shuffle($cells); 
        for ($i = 0; $i < $count; $i++) {
            $pos = $cells[$i];
            $r = intdiv($pos, 9);
            $c = $pos % 9;
            $board[$r][$c] = 0;
        }
        return $board;
        // Return the board with a random selection of cells set to 0
    }

    // Compare two grids for equality ( the initial and the solve one)
    private function equalGrids($a, $b)
    {
        for ($r = 0; $r < 9; $r++)
            for ($c = 0; $c < 9; $c++)
                if ((int)($a[$r][$c] ?? 0) !== (int)$b[$r][$c]) return false;
        return true;
    }
}
