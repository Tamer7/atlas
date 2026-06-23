<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('module_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->unsignedInteger('number')->default(1);
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('content_type')->default('text');
            $table->text('body')->nullable();
            $table->string('video_url')->nullable();
            $table->json('chapters')->nullable();
            $table->json('transcript')->nullable();
            $table->json('attachments')->nullable();
            $table->foreignUuid('quiz_id')->nullable()->constrained('quizzes')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreign('lesson_id')->references('id')->on('lessons')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropForeign(['lesson_id']);
        });
        Schema::dropIfExists('lessons');
    }
};
