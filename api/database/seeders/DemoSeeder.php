<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::firstOrCreate(
            ['email' => 'prof.vale@atlas.edu'],
            [
                'name'     => 'Prof. Marcus Vale',
                'password' => Hash::make('password'),
                'color'    => '#5C3A1E',
            ],
        );
        $teacher->roles()->syncWithoutDetaching(
            \App\Models\Role::firstOrCreate(['name' => 'teacher'])->id
        );

        $sofia = User::firstOrCreate(
            ['email' => 'sofia@atlas.edu'],
            [
                'name'     => 'Sofia Chen',
                'password' => Hash::make('password'),
                'color'    => '#2747E0',
            ],
        );
        $sofia->roles()->syncWithoutDetaching(
            \App\Models\Role::firstOrCreate(['name' => 'student'])->id
        );

        $amir = User::firstOrCreate(
            ['email' => 'amir@atlas.edu'],
            [
                'name'     => 'Amir Khoury',
                'password' => Hash::make('password'),
                'color'    => '#D97757',
            ],
        );
        $amir->roles()->syncWithoutDetaching(
            \App\Models\Role::firstOrCreate(['name' => 'student'])->id
        );

        $english = Course::firstOrCreate(
            ['title' => 'English B2 — Conversational Fluency', 'instructor_id' => $teacher->id],
            [
                'tag'            => 'English · B2',
                'category'       => 'Languages',
                'glyph'          => 'E',
                'thumb_gradient' => 'grad-1',
                'description'    => 'Build conversational fluency at B2 level.',
            ],
        );

        $ielts = Course::firstOrCreate(
            ['title' => 'IELTS Writing Intensive', 'instructor_id' => $teacher->id],
            [
                'tag'            => 'Test Prep',
                'category'       => 'Test Prep',
                'glyph'          => '✎',
                'thumb_gradient' => 'grad-3',
                'description'    => 'Intensive IELTS writing preparation.',
            ],
        );

        foreach ([$sofia, $amir] as $student) {
            Enrollment::firstOrCreate(
                ['user_id' => $student->id, 'course_id' => $english->id],
                ['enrolled_at' => now()],
            );
        }

        Enrollment::firstOrCreate(
            ['user_id' => $sofia->id, 'course_id' => $ielts->id],
            ['enrolled_at' => now()],
        );
    }
}
