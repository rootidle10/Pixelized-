<?php // app/Http/Controllers/Api/AuthController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ScoreController extends Controller
{
    public function saveScore (Request $request){
        $GameName = $request->query('Game');
        $Score = $request->query('score');
        
        //nom du jeux
        //score
        //id utilisateur

        //enregistrer le jeux

        //retour bon
        //retour mauvais
    }
}