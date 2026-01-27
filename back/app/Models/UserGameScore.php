<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserGameScore extends Model
{
    protected $fillable = ['user_id', 'game_id', 'score', 'achieved_at', 'is_highscore','difficulty'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
