<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            // Nullable, nullOnDelete: deleting a schedule slot must not
            // destroy the live classes (and recordings) already materialised
            // from it — only the link back to the slot is severed.
            $table->foreignUuid('schedule_slot_id')
                ->nullable()
                ->after('course_id')
                ->constrained('course_schedule_slots')
                ->nullOnDelete();

            // Makes lazy materialisation idempotent: firstOrCreate on this
            // pair means re-running materialisation never duplicates an
            // occurrence. Postgres treats NULLs as distinct, so ad-hoc
            // classes (null schedule_slot_id) are never constrained by this.
            $table->unique(['schedule_slot_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            $table->dropUnique(['schedule_slot_id', 'scheduled_at']);
            $table->dropForeign(['schedule_slot_id']);
            $table->dropColumn('schedule_slot_id');
        });
    }
};
