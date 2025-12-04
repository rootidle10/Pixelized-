<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Game::create([
        'name' => 'Cerebro Memory',
        'slug' => 'cerebro-memory',
        'description' => 'Jeu de mémoire cérébrale',
    ]);

    Game::create([
        'name' => 'Cerebro Quiz',
        'slug' => 'cerebro-quiz',
        'description' => 'Quiz sur le cerveau',
    ]);
    }
}
