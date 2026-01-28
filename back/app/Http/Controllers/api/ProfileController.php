<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserGameScore;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        // Authenticated user
        $user = $request->user();

        // Fetch all scores with related game
        $scores = UserGameScore::with('game')
            ->where('user_id', $user->id)
            ->orderByDesc('achieved_at')
            ->get();

        // Best scores per game and difficulty
        $best = [];
        foreach ($scores as $s) {
            $slug = $s->game->slug ?? 'unknown';
            $diff = $s->difficulty ?? 'unknown';

            if (!isset($best[$slug])) $best[$slug] = [];
            if (!isset($best[$slug][$diff]) || $s->score > $best[$slug][$diff]) {
                $best[$slug][$diff] = $s->score;
            }
        }

        // Recent history (last 30 scores)
        $history = $scores->take(30)->map(function ($s) {
            return [
                'id' => $s->id,
                'game_slug' => $s->game->slug ?? 'unknown',
                'game_name' => $s->game->name ?? 'Unknown',
                'difficulty' => $s->difficulty,
                'score' => $s->score,
                'time_left' => $s->time_left,
                'result' => $s->result,
                'is_highscore' => (bool) $s->is_highscore,
                'achieved_at' => optional($s->achieved_at)->toDateTimeString() ?? $s->created_at?->toDateTimeString(),
            ];
        })->values();

        // Return response
        return response()->json([
            'ok' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'best' => $best,
            'history' => $history,
        ]);
    }
}