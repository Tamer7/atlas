<?php

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GradeAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score'    => ['required', 'integer', 'min:0'],
            'feedback' => ['nullable', 'string'],
        ];
    }
}
