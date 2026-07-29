<?php

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'              => ['sometimes', 'string', 'max:255'],
            'lesson_id'          => ['nullable', 'uuid'],
            'quiz_type'          => ['sometimes', Rule::in(['graded', 'practice', 'survey'])],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'max_attempts'       => ['sometimes', 'integer', 'min:1'],
            'shuffle_questions'  => ['sometimes', 'boolean'],
            'show_results'       => ['sometimes', Rule::in(['after', 'manual', 'never'])],
            'passing_score'      => ['sometimes', 'integer', 'min:0', 'max:100'],
            'show_correct'       => ['sometimes', 'boolean'],
            'show_score'         => ['sometimes', 'boolean'],
            'due_at'             => ['nullable', 'date'],
            'publish'            => ['nullable', 'boolean'],
            'questions'          => ['sometimes', 'array', 'min:1'],
            'questions.*.id'     => ['nullable', 'string'],
            'questions.*.type'   => ['required_with:questions', Rule::in(['mcq', 'tf', 'fib', 'short', 'match', 'essay', 'code', 'upload'])],
            'questions.*.prompt' => ['required_with:questions', 'string'],
            'questions.*.points' => ['nullable', 'integer', 'min:1'],
            'questions.*.config' => ['nullable', 'array'],
            'questions.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
