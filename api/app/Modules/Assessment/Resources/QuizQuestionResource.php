<?php

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizQuestionResource extends JsonResource
{
    public function __construct($resource, private readonly bool $includeAnswers = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $config = $this->config ?? [];

        if (! $this->includeAnswers) {
            $config = $this->stripAnswerKeys($config);
        }

        return [
            'id'         => $this->id,
            'type'       => $this->type,
            'prompt'     => $this->prompt,
            'points'     => $this->points,
            'config'     => $config,
            'sort_order' => $this->sort_order,
        ];
    }

    private function stripAnswerKeys(array $config): array
    {
        unset(
            $config['answer'],
            $config['tfAnswer'],
            $config['blanks'],
            $config['expected_output'],
        );

        if (isset($config['pairs']) && is_array($config['pairs'])) {
            $config['pairs'] = array_map(
                fn ($pair) => ['l' => $pair['l'] ?? ''],
                $config['pairs'],
            );
        }

        return $config;
    }
}
