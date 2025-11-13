<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    // Relation vers les scores de ce jeu
    public function scores()
    {
        return $this->hasMany(UserGameScore::class);
    }
}
