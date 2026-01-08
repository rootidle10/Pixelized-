<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTotal extends Model
{
    protected $fillable = ['user_id', 'total_score'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

