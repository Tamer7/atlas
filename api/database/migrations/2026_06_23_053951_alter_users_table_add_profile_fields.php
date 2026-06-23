<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'roles')) {
                $table->json('roles')->default('["student"]');
            }
            if (! Schema::hasColumn('users', 'color')) {
                $table->string('color')->nullable();
            }
            if (! Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url')->nullable();
            }
            if (! Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (! Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone')->default('UTC');
            }
            if (! Schema::hasColumn('users', 'language')) {
                $table->string('language', 10)->default('en');
            }
            if (! Schema::hasColumn('users', 'goal')) {
                $table->string('goal')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['roles', 'color', 'avatar_url', 'bio', 'timezone', 'language', 'goal']);
        });
    }
};
