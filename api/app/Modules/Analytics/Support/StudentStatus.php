<?php

namespace App\Modules\Analytics\Support;

final class StudentStatus
{
    public const LOW_COMPLETION_THRESHOLD = 50;

    public const EXCELLING_SCORE = 90;

    public const EXCELLING_COMPLETION = 90;

    public const DEFAULT_PASSING_SCORE = 60;

    public static function determine(float $avgScore, float $completionPct, int $passingScore = self::DEFAULT_PASSING_SCORE): string
    {
        if ($avgScore < $passingScore || $completionPct < self::LOW_COMPLETION_THRESHOLD) {
            return 'at_risk';
        }

        if ($avgScore >= self::EXCELLING_SCORE && $completionPct >= self::EXCELLING_COMPLETION) {
            return 'excelling';
        }

        return 'on_track';
    }

    public static function isAtRisk(float $avgScore, float $completionPct, int $passingScore = self::DEFAULT_PASSING_SCORE): bool
    {
        return self::determine($avgScore, $completionPct, $passingScore) === 'at_risk';
    }
}
