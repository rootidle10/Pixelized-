<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    // Champs que l'on peut remplir via create() ou firstOrCreate()
    protected $fillable = ['name', 'slug', 'description', 'thumbnail'];

    // Relation vers les scores de ce jeu
    public function scores()
    {
        return $this->hasMany(UserGameScore::class);
    }
}
