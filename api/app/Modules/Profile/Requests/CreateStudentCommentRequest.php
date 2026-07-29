<?php

namespace App\Modules\Profile\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateStudentCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body'      => ['required', 'string', 'max:5000'],
            'course_id' => ['nullable', 'uuid'],
        ];
    }
}
