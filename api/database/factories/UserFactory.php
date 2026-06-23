<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'password'          => bcrypt('password'),
            'email_verified_at' => now(),
            'color'             => '#2747E0',
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (User $user) {
            $student = Role::firstOrCreate(['name' => 'student']);
            $user->roles()->syncWithoutDetaching($student);
        });
    }

    public function teacher(): static
    {
        return $this->afterCreating(function (User $user) {
            $teacher = Role::firstOrCreate(['name' => 'teacher']);
            $user->roles()->syncWithoutDetaching($teacher);
            // detach student if present
            $student = Role::where('name', 'student')->first();
            if ($student) {
                $user->roles()->detach($student);
            }
        });
    }
}
