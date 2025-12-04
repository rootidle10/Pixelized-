<?php

namespace App\Models;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('score', function (Blueprint $table) {
            $table->id();

            // Clé étrangère vers users.name
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->integer('score')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('score');
    }
};

