<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('tag');
            $table->string('category');
            $table->uuid('instructor_id');
            $table->foreign('instructor_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('thumb_gradient')->default('grad-1');
            $table->string('glyph', 8)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
