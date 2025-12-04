<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Game;
use App\Models\UserGameScore;

class UserGameScoreSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $games = Game::all();

        foreach ($users as $user) {
            foreach ($games as $game) {

                UserGameScore::create([
                    'user_id' => $user->id,
                    'game_id' => $game->id,
                    'score' => rand(0, 100),
                    'achieved_at' => now(),
                    'is_highscore' => true, 
                ]);
            }
        }
    }
}
