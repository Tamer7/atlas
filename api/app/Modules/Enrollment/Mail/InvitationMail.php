<?php

namespace App\Modules\Enrollment\Mail;

use App\Modules\Enrollment\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $acceptUrl;

    public function __construct(private readonly Invitation $invitation, string $rawToken)
    {
        $this->acceptUrl = config('app.frontend_url')
            . '/invitation/accept?token=' . $rawToken;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'You have been invited to Atlas');
    }

    public function content(): Content
    {
        return new Content(text: 'enrollment::invitation');
    }
}
