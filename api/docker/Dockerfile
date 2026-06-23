FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    git curl libpng-dev libzip-dev zip unzip \
    postgresql-dev oniguruma-dev linux-headers \
    nodejs npm ${PHPIZE_DEPS}

RUN docker-php-ext-install \
    pdo_pgsql pgsql mbstring zip exif pcntl bcmath gd

RUN pecl install redis && docker-php-ext-enable redis

RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini" && \
    echo "memory_limit = 512M" >> "$PHP_INI_DIR/php.ini" && \
    echo "upload_max_filesize = 64M" >> "$PHP_INI_DIR/php.ini" && \
    echo "post_max_size = 64M" >> "$PHP_INI_DIR/php.ini" && \
    echo "realpath_cache_size = 4096K" >> "$PHP_INI_DIR/php.ini" && \
    echo "realpath_cache_ttl = 600" >> "$PHP_INI_DIR/php.ini"

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs 2>/dev/null || true

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/sessions \
    storage/framework/views storage/framework/cache && \
    chmod -R 777 storage bootstrap/cache

RUN composer dump-autoload --optimize 2>/dev/null || true

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
