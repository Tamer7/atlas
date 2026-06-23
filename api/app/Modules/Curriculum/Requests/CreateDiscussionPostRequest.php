<?php

namespace App\Modules\Curriculum\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateDiscussionPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body'      => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'uuid'],
        ];
    }
}
