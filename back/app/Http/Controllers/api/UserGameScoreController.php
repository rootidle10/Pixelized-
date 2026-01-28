<?php

namespace App\Http\Controllers\api;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\UserGameScore;
use Illuminate\Support\Facades\Log;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;

class UserGameScoreController extends Controller
{
    public function saveScore(Request $request)
    {

        // Valide les données reçues
        $request->validate([
            'game_slug' => 'required|string',
            'score' => 'required|integer',
            'time_left' => 'required|integer',
            'difficulty' => 'required|string',
            'result' => 'required|string',
            'user_id' => 'nullable|integer|exists:users,id',
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

        // Récupère l'user_id du front ou null
        $userId = $request->user_id;

        if ($userId) {
            $score = UserGameScore::create([
                'user_id' => $userId,
                'game_id' => $game->id,
                'score' => $request->score,
                'achieved_at' => now(),
                'difficulty' => $request->difficulty,
                'is_highscore' => false,
            ]);

            return response()->json(['ok' => true, 'score_id' => $score->id]);
        }

        // Guest : ne rien faire côté base
        return response()->json(['ok' => true, 'score_id' => null, 'guest' => true]);
    }
}
