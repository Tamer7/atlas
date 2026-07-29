<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    require app_path('Modules/Auth/Routes/api.php');
    require app_path('Modules/Course/Routes/api.php');
    require app_path('Modules/Curriculum/Routes/api.php');
    require app_path('Modules/Enrollment/Routes/api.php');
    require app_path('Modules/Assessment/Routes/api.php');
    require app_path('Modules/Analytics/Routes/api.php');
    require app_path('Modules/Live/Routes/api.php');
    require app_path('Modules/Profile/Routes/api.php');
});
