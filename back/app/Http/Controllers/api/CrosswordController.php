<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class CrosswordController extends Controller
{
    /**
     * Crée une nouvelle partie de mots fléchés
     */
    public function new(Request $request)
    {
        $level = $request->input('level') ?: 'simple';
        if($level == null){
            $level == 'level';
        }

        $path = "crossword/grilles.json";

        // Vérifie que le fichier existe
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['ok' => false, 'error' => 'not found']);
        }

        $json = json_decode(Storage::disk('local')->get($path), true);

        if (!is_array($json)) {
            return response()->json(['ok' => false, 'error' => 'invalid json']);
        }

        // Filtre les grilles par niveau
        $gridsByLevel = array_values(array_filter($json, function ($grid) use ($level) {
            return isset($grid['Level']) && $grid['Level'] === $level;
        }));

        if (empty($gridsByLevel)) {
            return response()->json([
                'ok' => false,
                'error' => "no grid found for level {$level}"
            ]);
        }

        // Choix aléatoire d’une grille
        $gridData = $gridsByLevel[array_rand($gridsByLevel)];

        // ID unique de la partie
        $gameId = Str::random(16);

        // Grille vide envoyée au joueur
        $emptyGrid = $this->emptyGrid($gridData['grid']);

        // Stocke la partie côté serveur
        Storage::disk('local')->put(
            "crossword/game_{$gameId}.json",
            json_encode([
                'id' => $gameId,
                'grid' => $emptyGrid,
                'solution' => $gridData['solution'],
                'definitions' => $gridData['definitions'],
                'level' => $level,
                'created' => time()
            ])
        );

        // Réponse au front
        return response()->json([
            'ok' => true,
            'id' => $gameId,
            'grid' => $emptyGrid,
            'definitions' => $gridData['definitions'],
            'level' => $level
        ]);
    }

    /**
     * Valide la grille envoyée par le joueur
     */
    public function validateGrid(Request $request)
    {
        $gameId = $request->input('id');
        $grid   = $request->input('grid');

        if (!$gameId || !$grid) {
            return response()->json(['ok' => false, 'error' => 'invalid request']);
        }

        $path = "crossword/game_{$gameId}.json";

        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['ok' => false, 'error' => 'game not found']);
        }

        $data = json_decode(Storage::disk('local')->get($path), true);

        if (!$data || !isset($data['solution'])) {
            return response()->json(['ok' => false, 'error' => 'invalid game data']);
        }

        // Vérifie la grille
        $correct = $this->equalGrids($grid, $data['solution']);

        return response()->json([
            'ok' => true,
            'correct' => $correct
        ]);
    }

    /**
     * Retourne la solution complète
     */
    public function solve($id)
    {
        $path = "crossword/game_{$id}.json";

        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['ok' => false, 'error' => 'not found']);
        }

        $data = json_decode(Storage::disk('local')->get($path), true);

        return response()->json([
            'ok' => true,
            'solution' => $data['solution']
        ]);
    }

    /**
     * Génère une grille vide à partir de la grille modèle
     */
    private function emptyGrid(array $grid): array
    {
        return array_map(function ($row) {
            return array_map(function ($cell) {
                return $cell === '#' ? '#' : '';
            }, $row);
        }, $grid);
    }

    /**
     * Compare la grille utilisateur avec la solution
     */
    private function equalGrids(array $userGrid, array $solution): bool
    {
        for ($r = 0; $r < count($solution); $r++) {
            for ($c = 0; $c < count($solution[$r]); $c++) {

                // Les murs sont ignorés
                if ($solution[$r][$c] === '#') {
                    if (($userGrid[$r][$c] ?? '#') !== '#') {
                        return false;
                    }
                    continue;
                }

                // Comparaison insensible à la casse
                if (strtoupper($userGrid[$r][$c] ?? '') !== $solution[$r][$c]) {
                    return false;
                }
            }
        }
        return true;
    }
}
