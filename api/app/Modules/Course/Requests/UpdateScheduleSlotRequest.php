<?php

namespace App\Modules\Course\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['sometimes', 'integer', 'between:1,7'],
            'start_time'  => ['sometimes', 'date_format:H:i'],
            'end_time'    => ['sometimes', 'date_format:H:i'],
            'label'       => ['nullable', 'string', 'max:120'],
        ];
    }
}
