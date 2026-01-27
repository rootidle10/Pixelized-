<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{

    protected $fillable = ['slug', 'name', 'description', 'thumbnail'];
    // Relation vers les scores de ce jeu
    public function scores()
    {
        return $this->hasMany(UserGameScore::class);
    }
}
