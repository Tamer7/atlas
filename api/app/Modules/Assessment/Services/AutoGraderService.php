<?php

namespace App\Modules\Assessment\Services;

use App\Models\QuizAnswer;
use App\Models\QuizQuestion;

class AutoGraderService
{
    private const AUTO_TYPES = ['mcq', 'tf', 'fib', 'match', 'code'];

    public function canAutoGrade(string $type): bool
    {
        return in_array($type, self::AUTO_TYPES, true);
    }

    public function grade(QuizQuestion $question, ?array $studentAnswer): ?int
    {
        if ($studentAnswer === null) {
            return 0;
        }

        return match ($question->type) {
            'mcq'   => $this->gradeMcq($question, $studentAnswer),
            'tf'    => $this->gradeTf($question, $studentAnswer),
            'fib'   => $this->gradeFib($question, $studentAnswer),
            'match' => $this->gradeMatch($question, $studentAnswer),
            'code'  => $this->gradeCode($question, $studentAnswer),
            default => null,
        };
    }

    private function gradeMcq(QuizQuestion $question, array $studentAnswer): int
    {
        $correct = $question->config['answer'] ?? null;
        $selected = $studentAnswer['selected'] ?? $studentAnswer['value'] ?? $studentAnswer;

        if (is_array($selected)) {
            $selected = $selected['selected'] ?? null;
        }

        return (string) $selected === (string) $correct ? $question->points : 0;
    }

    private function gradeTf(QuizQuestion $question, array $studentAnswer): int
    {
        $correct = $question->config['answer'] ?? $question->config['tfAnswer'] ?? null;
        $value = $studentAnswer['value'] ?? $studentAnswer;

        if (is_array($value)) {
            $value = $value['value'] ?? null;
        }

        return $this->normalizeBool($value) === $this->normalizeBool($correct)
            ? $question->points
            : 0;
    }

    private function gradeFib(QuizQuestion $question, array $studentAnswer): int
    {
        $correctBlanks = $question->config['blanks'] ?? [];
        $studentBlanks = $studentAnswer['blanks'] ?? $studentAnswer;

        if (! is_array($studentBlanks)) {
            return 0;
        }

        if (count($correctBlanks) !== count($studentBlanks)) {
            return 0;
        }

        foreach ($correctBlanks as $index => $expected) {
            $given = $studentBlanks[$index] ?? '';
            if (! $this->stringsMatch($expected, $given)) {
                return 0;
            }
        }

        return $question->points;
    }

    private function gradeMatch(QuizQuestion $question, array $studentAnswer): int
    {
        $pairs = $question->config['pairs'] ?? [];

        if ($pairs === []) {
            return 0;
        }

        $studentPairs = $studentAnswer['pairs'] ?? null;

        if (is_array($studentPairs)) {
            foreach ($pairs as $expected) {
                $matched = collect($studentPairs)->first(
                    fn ($sp) => $this->stringsMatch($expected['l'] ?? '', $sp['l'] ?? ''),
                );

                if (! $matched || ! $this->stringsMatch($expected['r'] ?? '', $matched['r'] ?? '')) {
                    return 0;
                }
            }

            return $question->points;
        }

        $matches = $studentAnswer['matches'] ?? null;

        if (! is_array($matches)) {
            return 0;
        }

        $rights = array_values(array_map(fn ($pair) => $pair['r'] ?? '', $pairs));

        foreach ($pairs as $index => $pair) {
            $expectedRight = $pair['r'] ?? '';
            $studentRightIndex = $matches[(string) $index] ?? $matches[$index] ?? null;

            if ($studentRightIndex === null) {
                return 0;
            }

            $studentRight = $rights[(int) $studentRightIndex] ?? null;

            if ($studentRight === null || ! $this->stringsMatch($expectedRight, $studentRight)) {
                return 0;
            }
        }

        return $question->points;
    }

    private function gradeCode(QuizQuestion $question, array $studentAnswer): ?int
    {
        $expectedOutput = $question->config['expected_output'] ?? null;

        if ($expectedOutput === null || $expectedOutput === '') {
            return null;
        }

        $output = $studentAnswer['output'] ?? null;

        if ($output === null) {
            return 0;
        }

        return trim((string) $output) === trim((string) $expectedOutput)
            ? $question->points
            : 0;
    }

    public function recalculateAttemptAutoScore(QuizAnswer $answer): void
    {
        $score = $this->grade($answer->question, $answer->answer);

        if ($score !== null) {
            $answer->update(['auto_score' => $score]);
        }
    }

    private function stringsMatch(mixed $expected, mixed $given): bool
    {
        return mb_strtolower(trim((string) $expected)) === mb_strtolower(trim((string) $given));
    }

    private function normalizeBool(mixed $value): ?bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if ($value === 'true' || $value === 1 || $value === '1') {
            return true;
        }

        if ($value === 'false' || $value === 0 || $value === '0') {
            return false;
        }

        return null;
    }

}
