Il faut avoir php d'installé sur l'ordinateur
1 - cloner le git


Coté back 
1 - Télécharger Composer.phar (Toute la commande sera avec composer.phar au lieu de composer (EX : composer install --> composer.phar install))
lien vers DL composer ----> : https://getcomposer.org/download/2.8.12/composer.phar
  Mettez-le dans le dossier back (Pixelized/back/composer.phar)

2 - Copiez le fichier .env.example (dans le dossier arrière) et renommez-le . env (> cp .env.example .env)

3 - Dans le Pixelized-/back, écrivez dans l’invite de commande :
      php composer.phar install (= composer installer pour les dépendances)

4-  php artisan key:generate
php artisan migrate (yes pour la creation du fichier sqlite)
php artisan serve 


Coté Front 

1- dans Pixelized-/front, dans l'invite de commande :
npm install
npm run dev
2 - ctrl+click sur le lien 

APP_URL=url_de_laravel
MEMCACHED_HOST=url_du_site

REDIS_HOST=url_du_site
MAIL_HOST=url_du_site
SANCTUM_STATEFUL_DOMAINS=url_du_react,url_de_laravel
FRONTEND_URL=url_du_react


<img width="1209" height="417" alt="image" src="https://github.com/user-attachments/assets/d7c2ac93-46b5-44d8-90b7-f5d1b41db449" />
