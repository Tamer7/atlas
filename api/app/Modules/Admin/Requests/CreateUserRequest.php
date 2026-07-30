<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'mode'     => ['required', Rule::in(['invite', 'password'])],
            'email'    => ['required', 'email', 'unique:users,email'],
            'role'     => ['required', Rule::in(['student', 'teacher', 'admin'])],
            'name'     => ['required_if:mode,password', 'string', 'max:255'],
            'password' => ['required_if:mode,password', 'string', 'min:8'],
        ];
    }
}
