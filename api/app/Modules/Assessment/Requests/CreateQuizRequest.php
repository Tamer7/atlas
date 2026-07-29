<?php

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'              => ['required', 'string', 'max:255'],
            'lesson_id'          => ['nullable', 'uuid'],
            'quiz_type'          => ['nullable', Rule::in(['graded', 'practice', 'survey'])],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'max_attempts'       => ['nullable', 'integer', 'min:1'],
            'shuffle_questions'  => ['nullable', 'boolean'],
            'show_results'       => ['nullable', Rule::in(['after', 'manual', 'never'])],
            'passing_score'      => ['nullable', 'integer', 'min:0', 'max:100'],
            'show_correct'       => ['nullable', 'boolean'],
            'show_score'         => ['nullable', 'boolean'],
            'due_at'             => ['nullable', 'date'],
            'publish'            => ['nullable', 'boolean'],
            'questions'          => ['required', 'array', 'min:1'],
            'questions.*.id'     => ['nullable', 'string'],
            'questions.*.type'   => ['required', Rule::in(['mcq', 'tf', 'fib', 'short', 'match', 'essay', 'code', 'upload'])],
            'questions.*.prompt' => ['required', 'string'],
            'questions.*.points' => ['nullable', 'integer', 'min:1'],
            'questions.*.config' => ['nullable', 'array'],
            'questions.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
