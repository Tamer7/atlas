<?php

namespace App\Modules\Enrollment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AcceptInvitationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
        ];
    }
}
