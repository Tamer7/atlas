<?php

namespace App\Modules\Curriculum\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadLessonVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'video' => [
                'required',
                'file',
                'mimetypes:video/mp4,video/webm,video/quicktime,video/x-m4v',
                'max:512000', // KB — 500 MB
            ],
        ];
    }
}
