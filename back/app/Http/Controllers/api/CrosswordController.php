<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class CrosswordController extends Controller
{
    /**
     * Create a new crossword game (mots fléchés)
     * Grids file is stored here (your case):
     *  - storage/app/public/grilles.json  => Storage::disk('public')->get('grilles.json')
     */
    public function new(Request $request)
    {
        $level = $request->input('level') ?: 'simple';

        // ✅ Your grids are in: storage/app/public/grilles.json
        // We also add a fallback to: storage/app/public/crossword/grilles.json
        $gridsPath = $this->resolveGridsPath();

        if (!$gridsPath) {
            return response()->json(['ok' => false, 'error' => 'grilles.json not found'], 404);
        }

        $json = json_decode(Storage::disk('public')->get($gridsPath), true);

        if (!is_array($json)) {
            return response()->json(['ok' => false, 'error' => 'invalid json'], 500);
        }

        // Filter grids by level (your JSON uses "Level")
        $gridsByLevel = array_values(array_filter($json, function ($grid) use ($level) {
            return isset($grid['Level']) && $grid['Level'] === $level;
        }));

        if (empty($gridsByLevel)) {
            return response()->json([
                'ok' => false,
                'error' => "no grid found for level {$level}"
            ], 404);
        }

        // Random grid
        $gridData = $gridsByLevel[array_rand($gridsByLevel)];

        if (!isset($gridData['grid']) || !isset($gridData['solution'])) {
            return response()->json(['ok' => false, 'error' => 'grid data missing'], 500);
        }

        // Unique game id
        $gameId = Str::random(16);

        // Empty grid sent to player (keeps $ and #)
        $emptyGrid = $this->emptyGrid($gridData['grid']);

        // Store game server-side (local disk = storage/app)
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

        return response()->json([
            'ok' => true,
            'id' => $gameId,
            'grid' => $emptyGrid,
            'clueMapByIndex' => $gridData['clueMapByIndex'] ?? [],
            'solution' => $gridData['solution'],
            'level' => $level
        ]);
    }

    /**
     * Validate player's grid against the stored solution
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

        $correct = $this->equalGrids($grid, $data['solution']);

        return response()->json([
            'ok' => true,
            'correct' => $correct
        ]);
    }

    /**
     * Return full solution for a given game id
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
     * Find the grids file in the public disk.
     * - storage/app/public/grilles.json
     * - storage/app/public/crossword/grilles.json
     */
    private function resolveGridsPath(): ?string
    {
        if (Storage::disk('public')->exists('grilles.json')) {
            return 'grilles.json';
        }
        if (Storage::disk('public')->exists('crossword/grilles.json')) {
            return 'crossword/grilles.json';
        }
        return null;
    }

    /**
     * Build an empty grid from the template grid:
     * - keeps "$" (black cell) and "#" (clue index)
     * - clears letters -> ""
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
     * Compare user grid with solution:
     * - "$" and "#" must match
     * - letters compared in uppercase
     */
    private function equalGrids(array $userGrid, array $solution): bool
    {
        for ($r = 0; $r < count($solution); $r++) {
            for ($c = 0; $c < count($solution[$r]); $c++) {

                $sol = $solution[$r][$c];
                $usr = $userGrid[$r][$c] ?? '';

                // Fixed cells
                if ($sol === '$' || $sol === '#') {
                    if ($usr !== $sol) return false;
                    continue;
                }

                // Letters
                if (strtoupper($usr ?? '') !== $sol) {
                    return false;
                }
            }
        }
        return true;
    }
}
