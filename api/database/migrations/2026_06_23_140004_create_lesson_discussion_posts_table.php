<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_discussion_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->text('body');
            $table->timestamps();
        });

        Schema::table('lesson_discussion_posts', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('lesson_discussion_posts')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('lesson_discussion_posts', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
        });

        Schema::dropIfExists('lesson_discussion_posts');
    }
};
