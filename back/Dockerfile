FROM php:8.2-cli

# Installer les paquets nécessaires
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    zip \
    libzip-dev \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier uniquement le composer.json et composer.lock pour optimiser le build
COPY composer.json composer.lock ./

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader || true

# Copier tout le reste du projet
COPY . .

# Exposer le port
EXPOSE 8000

# Commande de démarrage (dev)
CMD ["sh", "-c", "composer install && php artisan serve --host=0.0.0.0 --port=8000"]
