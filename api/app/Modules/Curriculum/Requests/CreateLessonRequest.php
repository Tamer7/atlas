<?php

namespace App\Modules\Curriculum\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'            => ['required', 'string', 'max:255'],
            'number'           => ['nullable', 'integer', 'min:1'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'sort_order'       => ['nullable', 'integer', 'min:0'],
            'content_type'     => ['nullable', 'string', 'in:text,video,quiz'],
            'body'             => ['nullable', 'string'],
            'video_url'        => ['nullable', 'string', 'max:2048'],
            'chapters'         => ['nullable', 'array'],
            'transcript'       => ['nullable', 'array'],
            'attachments'      => ['nullable', 'array'],
            'quiz_id'          => ['nullable', 'uuid'],
        ];
    }
}
