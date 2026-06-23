<?php

namespace App\Modules\Curriculum\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'position_seconds' => ['nullable', 'integer', 'min:0'],
            'completed'        => ['nullable', 'boolean'],
        ];
    }
}
