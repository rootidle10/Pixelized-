<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    /**
     * Allow mass assignment for firstOrCreate/create
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'thumbnail',
    ];

    // Relation vers les scores de ce jeu
    public function scores()
    {
        return $this->hasMany(UserGameScore::class);
    }
}
