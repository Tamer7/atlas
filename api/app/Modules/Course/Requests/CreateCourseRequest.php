<?php

namespace App\Modules\Course\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'          => ['required', 'string', 'max:255'],
            'tag'            => ['required', 'string', 'max:100'],
            'category'       => ['required', 'string', 'max:100'],
            'description'    => ['nullable', 'string', 'max:5000'],
            'glyph'          => ['nullable', 'string', 'max:8'],
            'thumb_gradient' => ['nullable', 'string', 'max:20'],
        ];
    }
}
