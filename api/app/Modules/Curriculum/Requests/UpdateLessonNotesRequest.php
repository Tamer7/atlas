<?php

namespace App\Modules\Curriculum\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonNotesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notes' => ['required', 'string', 'max:10000'],
        ];
    }
}
