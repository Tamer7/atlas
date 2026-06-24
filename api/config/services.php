<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'livekit' => [
        'url'               => env('LIVEKIT_URL'),
        'api_key'           => env('LIVEKIT_API_KEY'),
        'api_secret'        => env('LIVEKIT_API_SECRET'),
        'egress_bucket'     => env('LIVEKIT_EGRESS_BUCKET'),
        'egress_s3_key'     => env('LIVEKIT_EGRESS_S3_KEY'),
        'egress_s3_secret'  => env('LIVEKIT_EGRESS_S3_SECRET'),
        'egress_s3_region'  => env('LIVEKIT_EGRESS_S3_REGION', 'us-east-1'),
        'egress_s3_endpoint' => env('LIVEKIT_EGRESS_S3_ENDPOINT'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
