<?php

namespace App\Modules\Live\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateLiveClassRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'course_id'    => ['required', 'uuid', 'exists:courses,id'],
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ];
    }
}
