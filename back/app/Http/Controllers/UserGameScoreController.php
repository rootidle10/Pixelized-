<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserGameScore;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;

class UserGameScoreController extends Controller
{
    public function saveScore(Request $request)
{
    $request->validate([
        'game_slug' => 'required|string',
        'score' => 'required|integer',
        'time_left' => 'required|integer',
        'difficulty' => 'required|string',
        'result' => 'required|string',
    ]);

    // Cherche ou crée le jeu
    $game = Game::firstOrCreate(
        ['slug' => $request->game_slug],
        [
            'name' => ucfirst(str_replace('-', ' ', $request->game_slug)),
            'description' => 'Jeu créé automatiquement',
            'thumbnail' => null
        ]
    );

    // Si user connecté, on sauvegarde, sinon on ignore
    $userId = auth()->id() ?? null;

    if ($userId) {
        $score = UserGameScore::create([
            'user_id' => $userId,
            'game_id' => $game->id,
            'score' => $request->score,
            'achieved_at' => now(),
            'is_highscore' => false,
        ]);

        return response()->json(['ok' => true, 'score_id' => $score->id]);
    }

    // Guest : ne rien faire côté base
    return response()->json(['ok' => true, 'score_id' => null, 'guest' => true]);
}
}
