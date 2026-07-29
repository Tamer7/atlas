<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Admin\Resources\AdminUserResource;
use App\Modules\Admin\Services\AdminUserService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminUserController extends Controller
{
    public function __construct(private readonly AdminUserService $users) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $paginator = $this->users->list([
            'search' => $request->query('search'),
            'role'   => $request->query('role'),
            'status' => $request->query('status'),
        ], (int) $request->query('per_page', 25));

        return AdminUserResource::collection($paginator);
    }
}
