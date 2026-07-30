<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'  => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes', 'email',
                Rule::unique('users', 'email')->ignore($this->route('id')),
            ],
            'role'  => ['sometimes', Rule::in(['student', 'teacher', 'admin'])],
        ];
    }
}
