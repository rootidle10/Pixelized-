<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserGameScore;
use App\Models\Game;

class UserGameScoreController extends Controller
{
    /**
     * Save a score (used by Sudoku + Mots-fléchés)
     * POST /api/scores (auth:sanctum)
     */
    public function saveScore(Request $request)
    {
        $request->validate([
            'game_slug'   => 'required|string',
            'score'       => 'required|integer|min:0',
            'time_left'   => 'nullable|integer|min:0',
            'difficulty'  => 'nullable|string',
            'result'      => 'nullable|string',
        ]);

        $user = $request->user(); // sanctum
        if (!$user) {
            // Guest => do nothing
            return response()->json(['ok' => true, 'guest' => true, 'score_id' => null]);
        }

        $gameSlug = (string) $request->game_slug;
        $difficulty = $request->difficulty ?? 'unknown';
        $scoreValue = (int) $request->score;

        // Ensure game exists
        $game = Game::firstOrCreate(
            ['slug' => $gameSlug],
            [
                'name' => ucfirst(str_replace('-', ' ', $gameSlug)),
                'description' => 'Jeu créé automatiquement',
                'thumbnail' => null
            ]
        );

        // Best score for THIS user + game + difficulty
        $bestScore = UserGameScore::where('user_id', $user->id)
            ->where('game_id', $game->id)
            ->where('difficulty', $difficulty)
            ->max('score');

        $isNewHighscore = is_null($bestScore) || $scoreValue > (int) $bestScore;

        // Create score entry
        $score = UserGameScore::create([
            'user_id'      => $user->id,
            'game_id'      => $game->id,
            'score'        => $scoreValue,
            'difficulty'   => $difficulty,
            'time_left'    => $request->time_left,
            'result'       => $request->result,
            'achieved_at'  => now(),
            'is_highscore' => $isNewHighscore,
        ]);

        // If it is a new highscore, unmark previous highscores for same bucket (same user/game/difficulty)
        if ($isNewHighscore) {
            UserGameScore::where('user_id', $user->id)
                ->where('game_id', $game->id)
                ->where('difficulty', $difficulty)
                ->where('id', '!=', $score->id)
                ->update(['is_highscore' => false]);
        }

        return response()->json([
            'ok' => true,
            'score_id' => $score->id,
            'is_highscore' => $isNewHighscore,
            'best_before' => $bestScore,
        ]);
    }

    /**
     * Public leaderboard: Top N highscores for a game + difficulty
     * GET /api/scores/leaderboard?game_slug=...&difficulty=...&limit=5
     */
    public function leaderboard(Request $request)
    {
        $gameSlug = $request->query('game_slug');
        $difficulty = $request->query('difficulty');
        $limit = (int) $request->query('limit', 5);

        if (!$gameSlug || !$difficulty) {
            return response()->json([
                'error' => 'Missing parameters: game_slug and difficulty are required.'
            ], 422);
        }

        $game = Game::where('slug', $gameSlug)->first();
        if (!$game) {
            return response()->json([
                'game_slug' => $gameSlug,
                'difficulty' => $difficulty,
                'top' => [],
            ]);
        }

        $top = UserGameScore::with(['user:id,name'])
            ->where('game_id', $game->id)
            ->where('difficulty', $difficulty)
            ->where('is_highscore', true)
            ->orderByDesc('score')
            ->orderBy('achieved_at') // tie-breaker: earlier wins
            ->limit(max(1, min($limit, 50)))
            ->get()
            ->values()
            ->map(function ($row, $i) {
                return [
                    'rank' => $i + 1,
                    'user_id' => $row->user_id,
                    'user_name' => $row->user?->name ?? ('User #' . $row->user_id),
                    'score' => (int) $row->score,
                    'achieved_at' => optional($row->achieved_at)->toIso8601String(),
                ];
            });

        return response()->json([
            'game_slug' => $gameSlug,
            'difficulty' => $difficulty,
            'top' => $top,
        ]);
    }

    /**
     * Protected: logged user's rank for game + difficulty
     * GET /api/scores/leaderboard/me?game_slug=...&difficulty=...
     */
    public function myRank(Request $request)
    {
        $user = $request->user();
        $gameSlug = $request->query('game_slug');
        $difficulty = $request->query('difficulty');

        if (!$gameSlug || !$difficulty) {
            return response()->json([
                'error' => 'Missing parameters: game_slug and difficulty are required.'
            ], 422);
        }

        $game = Game::where('slug', $gameSlug)->first();
        if (!$game) {
            return response()->json([
                'game_slug' => $gameSlug,
                'difficulty' => $difficulty,
                'me' => null,
            ]);
        }

        $myBest = UserGameScore::where('game_id', $game->id)
            ->where('difficulty', $difficulty)
            ->where('user_id', $user->id)
            ->where('is_highscore', true)
            ->orderByDesc('score')
            ->orderBy('achieved_at')
            ->first();

        if (!$myBest) {
            return response()->json([
                'game_slug' => $gameSlug,
                'difficulty' => $difficulty,
                'me' => null,
            ]);
        }

        $betterCount = UserGameScore::where('game_id', $game->id)
            ->where('difficulty', $difficulty)
            ->where('is_highscore', true)
            ->where(function ($q) use ($myBest) {
                $q->where('score', '>', $myBest->score)
                  ->orWhere(function ($q2) use ($myBest) {
                      $q2->where('score', '=', $myBest->score)
                         ->where('achieved_at', '<', $myBest->achieved_at);
                  });
            })
            ->count();

        $rank = $betterCount + 1;

        return response()->json([
            'game_slug' => $gameSlug,
            'difficulty' => $difficulty,
            'me' => [
                'rank' => $rank,
                'user_id' => $user->id,
                'user_name' => $user->name ?? ('User #' . $user->id),
                'score' => (int) $myBest->score,
                'achieved_at' => optional($myBest->achieved_at)->toIso8601String(),
            ],
        ]);
    }
}
