<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserGameScore extends Model
{
    protected $fillable = [
        'user_id',
        'game_id',
        'score',
        'difficulty',
        'time_left',
        'result',
        'achieved_at',
        'is_highscore'
    ];

    protected $casts = [
        'achieved_at' => 'datetime',
        'is_highscore' => 'boolean',
        'score' => 'integer',
        'time_left' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
