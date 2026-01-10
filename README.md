PIXELIZED – GUIDE D’INSTALLATION
===============================

PRÉREQUIS
---------
Avant de commencer, assurez-vous d’avoir installé sur votre ordinateur :

- PHP (version 8.1 ou supérieure recommandée)


CLONER LE PROJET
----------------
Attention cloner le projets dans un les dossiers de xampp ou wampp ou votre equivalents

git clone <URL_DU_REPO>
cd Pixelized

Précision pour la parti back qui vas suivre tous les ordinateurs ne permet pas de passer par le terminals 
exemple pour ceux qui dispose de xamp ou wampp lancer l'application et ouvrir le terminal proposer dans l'interface, deplacer vous dans votre dossier et après vous pourrer suivre les instructions


BACK-END (Laravel)
==================
Dossier : Pixelized/back


1) INSTALLER COMPOSER (VERSION PORTABLE)
----------------------------------------
Télécharger Composer :
https://getcomposer.org/download/2.8.12/composer.phar

Placer le fichier ici :
Pixelized/back/composer.phar


2) CONFIGURATION DU FICHIER .ENV
--------------------------------
Dans le dossier back :

copier le fichier .env.example et le renommer .env : voici la commande :
cp .env.example .env


3) INSTALLER LES DÉPENDANCES PHP
--------------------------------
Toujours dans Pixelized/back :

php composer.phar install


4) GÉNÉRER LA CLÉ LARAVEL
------------------------
php artisan key:generate

Vérifier dans back/.env qu’il existe bien :
APP_KEY=xxxxxxxxxxxxxxxx


5) BASE DE DONNÉES (SQLite)
--------------------------

Faire la commande suivant pour créer et mettre à jour la base de donnée : voici la commande :
php artisan migrate


6) VARIABLES D’ENVIRONNEMENT (BACK)
-----------------------------------
Dans back/.env remplir les variables : exemple : 

FRONTEND_URL=url_du_react
FRONTEND_URL=http://localhost:8000/


7) LANCER LE SERVEUR LARAVEL
---------------------------

Commande pour lancer le serveur back : voici la commande : 
php artisan serve



FRONT-END (React + Vite)
=======================
Dossier : Pixelized/front


8) CONFIGURATION DU .ENV FRONT
------------------------------
Dans le dossier Front :

copier le fichier .env.example et le renommer .env : voici la commande :

cp .env.example .env


9) INSTALLER LES DÉPENDANCES FRONT
---------------------------------

Installer toute les dépendances : voici la commande :

npm i

10) VARIABLES D’ENVIRONNEMENT (FRONT)
-----------------------------------
Dans Front/.env  remplir les variables : exemple : 

FRONTEND_URL=url_du_react
FRONTEND_URL=http://localhost:8000/


11) LANCER LE SERVEUR FRONT
--------------------------

Lancer le projets : voici la commande : 

npm run dev

Ctrl + clic sur le lien pour ouvrir l’application.

Il faut avoir php d'installé sur l'ordinateur
1 - cloner le git


Coté back 
1 - Télécharger Composer.phar (Toute la commande sera avec composer.phar au lieu de composer (EX : composer install --> composer.phar install))
lien vers DL composer ----> : https://getcomposer.org/download/2.8.12/composer.phar
  Mettez-le dans le dossier back (Pixelized/back/composer.phar)

2 - Copiez le fichier .env.example (dans le dossier arrière) et renommez-le . env (> cp .env.example .env)

3 - Dans le Pixelized-/back, écrivez dans l’invite de commande :
      php composer.phar install (= composer installer pour les dépendances)

4-  php artisan key:generate (verifier si vous avec quelque chose apres :APP_KEY= dans le .env dans back)
5- php artisan migrate (yes pour la creation du fichier sqlite)
6- php artisan serve 

7. variable a remplir dans le .env  
APP_URL=url_de_laravel
MEMCACHED_HOST=url_du_site

REDIS_HOST=url_du_site
MAIL_HOST=url_du_site
SANCTUM_STATEFUL_DOMAINS=url_du_react,url_de_laravel

Coté Front 

1 - Copiez le fichier .env.example (dans le dossier arrière) et renommez-le . env (> cp .env.example .env)
2- remplir le .env : 
FRONTEND_URL=url_du_react

2- dans Pixelized-/front, dans l'invite de commande :
npm install
npm run dev
3 - ctrl+click sur le lien 
