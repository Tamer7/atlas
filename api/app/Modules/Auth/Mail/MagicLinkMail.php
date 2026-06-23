<?php

namespace App\Modules\Auth\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MagicLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $magicUrl;

    public function __construct(string $email, string $token)
    {
        $this->magicUrl = config('app.frontend_url') . '/magic?token=' . $token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Atlas sign-in link');
    }

    public function content(): Content
    {
        return new Content(text: 'auth::magic-link');
    }
}
