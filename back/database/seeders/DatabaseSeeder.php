<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Game;
use App\Models\UserGameScore;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Création de 5 utilisateurs test
        User::factory()->count(5)->create();

        // Création de 2 jeux
        Game::create(['name' => 'Cerebro Memory', 'slug' => 'cerebro-memory']);
        Game::create(['name' => 'Cerebro Quiz', 'slug' => 'cerebro-quiz']);

        $users = User::all();
        $games = Game::all();

        // Génération de scores aléatoires
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

        // Création d'un utilisateur spécifique
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
