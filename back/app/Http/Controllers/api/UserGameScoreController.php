<?php

namespace App\Http\Controllers\api;
use App\Http\Controllers\Controller;
use App\Models\UserGameScore;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserGameScoreController extends Controller
{
    // Enregistrer un score
    public function store(Request $request, $gameId)
    {
        $request->validate([
            'score' => 'required|integer|min:0',
        ]);

        UserGameScore::create([
            'user_id' => Auth::id(),
            'game_id' => $gameId,
            'score' => $request->score,
            'achieved_at' => now(),
        ]);

        return response()->json(['message' => 'Score enregistré !']);
    }

    // Leaderboard pour un jeu
    public function leaderboard($gameId)
    {
        $leaderboard = DB::table('user_game_scores')
            ->join('users', 'users.id', '=', 'user_game_scores.user_id')
            ->where('game_id', $gameId)
            ->select('users.name', DB::raw('MAX(score) as highscore'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('highscore')
            ->get();

        return view('leaderboard.game', compact('leaderboard'));
    }

    // Leaderboard global (tous les jeux)
    public function globalLeaderboard()
    {
        $leaderboard = DB::table('user_game_scores')
            ->join('users', 'users.id', '=', 'user_game_scores.user_id')
            ->select('users.name', DB::raw('MAX(score) as highscore'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('highscore')
            ->get();

        return view('leaderboard.global', compact('leaderboard'));
    }
}
