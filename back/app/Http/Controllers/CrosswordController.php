<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CrosswordController extends Controller
{
    // Générer une nouvelle grille
    public function new(Request $request)
    {
        $id = Str::random(16);
        $grid = $this->generateGrid();
        $clues = $this->generateClues($grid);

        Storage::disk('local')->put("crossword/{$id}.json", json_encode([
            'id' => $id,
            'grid' => $grid,
            'clues' => $clues,
            'created' => time()
        ]));

        return response()->json([
            'ok' => true,
            'id' => $id,
            'grid' => $grid,
            'clues' => $clues
        ]);
    }

    // Valider la grille soumise
    public function validateGrid(Request $request)
    {
        $id = $request->input('id');
        $grid = $request->input('grid');

        $data = json_decode(Storage::disk('local')->get("crossword/{$id}.json"), true);
        if (!$data) return response()->json(['ok' => false, 'error' => 'not found']);

        $correct = $this->checkGrid($grid, $data['grid']);
        return response()->json(['ok' => true, 'correct' => $correct]);
    }

    private function generateGrid()
    {
        // Exemple simple : grille vide 5x5
        return array_fill(0, 5, array_fill(0, 5, ""));
    }

    private function generateClues($grid)
    {
        // Retourne un tableau d'indices vide pour l'instant
        return [];
    }

    private function checkGrid($submitted, $solution)
    {
        for ($r = 0; $r < count($solution); $r++) {
            for ($c = 0; $c < count($solution[$r]); $c++) {
                if (($submitted[$r][$c] ?? "") !== $solution[$r][$c]) return false;
            }
        }
        return true;
    }
}
