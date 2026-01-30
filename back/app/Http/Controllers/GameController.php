<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    // Liste tous les jeux
    public function index()
    {
        $games = Game::all();
        return view('games.index', compact('games'));
    }

    // Détail d’un jeu
    public function show($slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();
        return view('games.show', compact('game'));
    }

    // (Optionnel) Créer un jeu - pour admin
    public function create()
    {
        return view('games.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:games,name',
            'description' => 'nullable',
            'thumbnail' => 'nullable|image',
        ]);

        $slug = \Str::slug($request->name);

        $game = Game::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'thumbnail' => $request->thumbnail ?? null,
        ]);

        return redirect()->route('games.show', $game->slug);
    }
}
