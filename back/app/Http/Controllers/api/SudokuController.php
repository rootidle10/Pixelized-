<?php

namespace App\Http\Controllers\api;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class SudokuController extends Controller
{
    // Genere un nouveau Sudoku 
    public function new(Request $request)
    {
        $level = $request->input('level', 'easy');
        $id = Str::random(16);

        $solution = $this->solvedBoard();
        $puzzle = $this->removeCells($solution, match ($level) {
            'easy' => 35,
            'medium' => 45,
            'hard' => 55,
            default => 45,
        });

        // Garde le puzzle et la solution
        Storage::disk('local')->put("sudoku/{$id}.json", json_encode([
            'id' => $id,
            'puzzle' => $puzzle,
            'solution' => $solution,
            'created' => time()
        ]));

        return response()->json(['ok' => true, 'id' => $id, 'puzzle' => $puzzle]);
        // retourne l'identifiant et le puzzle sous forme JSON
    }

    // Valide une grille soumise par l'utilisateur
    public function validateGrid(Request $request)
    {
        $id = $request->input('id');
        $grid = $request->input('grid');

        $data = json_decode(Storage::disk('local')->get("sudoku/{$id}.json"), true);
        $solution = $data['solution'] ?? null;

        if (!$solution)
            return response()->json(['ok' => false, 'error' => 'not found']);

        $correct = $this->equalGrids($grid, $solution);
        return response()->json(['ok' => true, 'correct' => $correct]);
    }

    public function solve($id)
    {
        $data = json_decode(Storage::disk('local')->get("sudoku/{$id}.json"), true);
        if (!$data)
            return response()->json(['ok' => false, 'error' => 'not found']);
        return response()->json(['ok' => true, 'solution' => $data['solution']]);
    }

    // Genere une grille de Sudoku résolue
    private function solvedBoard()
    {
        $base = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8],
        ];

        // Mélange les lignes dans chaque bande de 3 lignes
        for ($band = 0; $band < 3; $band++) {
            $lines = [$band * 3, $band * 3 + 1, $band * 3 + 2];
            shuffle($lines);
            $temp = [$base[$lines[0]], $base[$lines[1]], $base[$lines[2]]];
            for ($i = 0; $i < 3; $i++)
                $base[$band * 3 + $i] = $temp[$i];
        }

        // Mélange les colonnes dans chaque bloc de 3 colonnes
        for ($block = 0; $block < 3; $block++) {
            $cols = [$block * 3, $block * 3 + 1, $block * 3 + 2];
            shuffle($cols);
            foreach ($base as &$row) {
                $temp = [$row[$cols[0]], $row[$cols[1]], $row[$cols[2]]];
                for ($i = 0; $i < 3; $i++)
                    $row[$block * 3 + $i] = $temp[$i];
            }
        }

        // Optionnel : permuter les chiffres 1 à 9
        $numbers = range(1, 9);
        shuffle($numbers);
        foreach ($base as &$row) {
            foreach ($row as &$cell) {
                $cell = $numbers[$cell - 1];
            }
        }

        return $base;
    }

    // Enleve des cellules aléatoires pour créer un puzzle
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
        // Retourne la grille avec des cellules supprimées
    }

    // Compare deux grilles de Sudoku 
    private function equalGrids($a, $b)
    {
        for ($r = 0; $r < 9; $r++)
            for ($c = 0; $c < 9; $c++)
                if ((int) ($a[$r][$c] ?? 0) !== (int) $b[$r][$c])
                    return false;
        return true;
    }
}
