Il faut avoir php d'installé sur l'ordinateur
1 - cloner le git 

2 - Télécharger Composer.phar (Toute la commande sera avec composer.phar au lieu de composer (EX : composer install --> composer.phar install))
lien vers DL composer ----> : https://getcomposer.org/download/2.8.12/composer.phar
  Mettez-le dans le dossier back (Pixelized/back/composer.phar)

3 - Copiez le fichier .env.example (dans le dossier arrière) et renommez-le . env (> cp .env.example .env)

4 - Dans le Pixelized-/back, écrivez dans l’invite de commande :
      php composer.phar install (= composer installer pour les dépendances)

5 php artisan key:generate
php artisan migrate (yes pour la creation du fichier sqlite)
php artisan serve 
