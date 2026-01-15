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

        $path = "/crossword/grilles.json";

        // Vérifie que le fichier existe
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['ok' => false, 'error' => 'not found'], 404);
        }

        $json = json_decode(Storage::disk('local')->get($path), true);

        if (!is_array($json)) {
            return response()->json(['ok' => false, 'error' => 'invalid json'], 500);
        }

        // Filtre les grilles par niveau
        $gridsByLevel = array_values(array_filter($json, function ($grid) use ($level) {
            return isset($grid['Level']) && $grid['Level'] === $level;
        }));

        if (empty($gridsByLevel)) {
            return response()->json([
                'ok' => false,
                'error' => "no grid found for level {$level}"
            ], 404);
        }

        // Choix aléatoire d’une grille
        $gridData = $gridsByLevel[array_rand($gridsByLevel)];

        if (!isset($gridData['grid']) || !isset($gridData['solution'])) {
            return response()->json(['ok' => false, 'error' => 'grid data missing'], 500);
        }

        // ID unique de la partie
        $gameId = Str::random(16);

        // Grille vide envoyée au joueur (garde $ et #)
        $emptyGrid = $this->emptyGrid($gridData['grid']);

        // Stocke la partie côté serveur
        Storage::disk('local')->put(
            "crossword/game_{$gameId}.json",
            json_encode([
                'id' => $gameId,
                'grid' => $emptyGrid,
                'solution' => $gridData['solution'],
                'clueMapByIndex' => $gridData['clueMapByIndex'] ?? [],
                'level' => $level,
                'created' => time()
            ], JSON_UNESCAPED_UNICODE)
        );

        // Réponse au front
        return response()->json([
            'ok' => true,
            'id' => $gameId,
            'grid' => $emptyGrid,
            'clueMapByIndex' => $gridData['clueMapByIndex'] ?? [],
            'solution' => $gridData['solution'], // ✅ important pour vérifier les mots côté front
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
            return response()->json(['ok' => false, 'error' => 'invalid request'], 400);
        }

        $path = "crossword/game_{$gameId}.json";

        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['ok' => false, 'error' => 'game not found'], 404);
        }

        $data = json_decode(Storage::disk('local')->get($path), true);

        if (!$data || !isset($data['solution'])) {
            return response()->json(['ok' => false, 'error' => 'invalid game data'], 500);
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
            return response()->json(['ok' => false, 'error' => 'not found'], 404);
        }

        $data = json_decode(Storage::disk('local')->get($path), true);

        return response()->json([
            'ok' => true,
            'solution' => $data['solution']
        ]);
    }

    /**
     * Génère une grille vide à partir de la grille modèle
     * - garde "$" (mur) et "#" (indice)
     * - vide les lettres -> ""
     */
    private function emptyGrid(array $grid): array
    {
        return array_map(function ($row) {
            return array_map(function ($cell) {
                if ($cell === '$') return '$';
                if ($cell === '#') return '#';
                return '';
            }, $row);
        }, $grid);
    }

    /**
     * Compare la grille utilisateur avec la solution
     * - "$" et "#" doivent être identiques
     * - lettres comparées en uppercase
     */
    private function equalGrids(array $userGrid, array $solution): bool
    {
        for ($r = 0; $r < count($solution); $r++) {
            for ($c = 0; $c < count($solution[$r]); $c++) {

                $sol = $solution[$r][$c];
                $usr = $userGrid[$r][$c] ?? '';

                // Cases fixes
                if ($sol === '$' || $sol === '#') {
                    if ($usr !== $sol) return false;
                    continue;
                }

                // Lettres
                if (strtoupper($usr ?? '') !== $sol) {
                    return false;
                }
            }
        }
        return true;
    }
}