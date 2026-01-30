<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_game_scores', function (Blueprint $table) {
            if (!Schema::hasColumn('user_game_scores', 'difficulty')) {
                $table->string('difficulty')->nullable()->after('score');
            }
            if (!Schema::hasColumn('user_game_scores', 'time_left')) {
                $table->integer('time_left')->nullable()->after('difficulty');
            }
            if (!Schema::hasColumn('user_game_scores', 'result')) {
                $table->string('result')->nullable()->after('time_left');
            }
            if (!Schema::hasColumn('user_game_scores', 'achieved_at')) {
                $table->timestamp('achieved_at')->nullable()->after('result');
            }
            if (!Schema::hasColumn('user_game_scores', 'is_highscore')) {
                $table->boolean('is_highscore')->default(true)->after('achieved_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_game_scores', function (Blueprint $table) {
            if (Schema::hasColumn('user_game_scores', 'difficulty')) $table->dropColumn('difficulty');
            if (Schema::hasColumn('user_game_scores', 'time_left')) $table->dropColumn('time_left');
            if (Schema::hasColumn('user_game_scores', 'result')) $table->dropColumn('result');
            if (Schema::hasColumn('user_game_scores', 'achieved_at')) $table->dropColumn('achieved_at');
            if (Schema::hasColumn('user_game_scores', 'is_highscore')) $table->dropColumn('is_highscore');
        });
    }
};
