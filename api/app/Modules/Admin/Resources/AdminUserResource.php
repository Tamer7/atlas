<?php

namespace App\Modules\Admin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            // One role per user through this UI; first() is the effective role.
            'role'       => $this->roles->pluck('name')->first(),
            'is_active'  => $this->deactivated_at === null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
