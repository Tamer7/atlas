<?php

namespace App\Modules\Admin\Exceptions;

use Exception;

class AdminActionDenied extends Exception
{
    public static function selfAction(string $what): self
    {
        return new self("You cannot {$what} your own account.");
    }

    public static function lastAdmin(string $what): self
    {
        return new self("You cannot {$what} the last remaining administrator.");
    }
}
