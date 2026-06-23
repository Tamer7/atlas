<?php

namespace App\Modules\Enrollment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email'        => ['required', 'email'],
            'course_ids'   => ['present', 'array'],
            'course_ids.*' => ['uuid'],
        ];
    }
}
