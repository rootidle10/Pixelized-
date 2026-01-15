PIXELIZED – GUIDE D’INSTALLATION
===============================


PRÉREQUIS
---------
Avant de commencer, assurez-vous d’avoir installé sur votre ordinateur :

- PHP (version 8.1 ou supérieure recommandée)
- Node.js + npm
- Git
- Un serveur local (XAMPP, WAMP ou équivalent)


CLONER LE PROJET
----------------
⚠️ IMPORTANT :
Le projet doit être cloné dans un dossier accessible par votre serveur local
(XAMPP, WAMP ou équivalent), par exemple : htdocs ou www.

Commandes :

git clone https://github.com/rootidle10/Pixelized-.git
cd Pixelized-

Ensuite, lancez Apache dans XAMPP / WAMP (ou votre équivalent).


ℹ️ Note :
Sur certains ordinateurs, l’accès au terminal peut être limité.
Si vous utilisez XAMPP ou WAMP, vous pouvez ouvrir le terminal directement
depuis leur interface (shell) , puis vous déplacer dans le dossier du projet
avant de suivre les instructions ci-dessous.


BACK-END (Laravel)
==================
Dossier : Pixelized-/back


1) INSTALLER COMPOSER (VERSION PORTABLE)
----------------------------------------
Composer n’est pas installé globalement.
Nous utilisons donc la version portable composer.phar.

Toutes les commandes Composer utiliseront :
php composer.phar <commande>
Exemple :
composer install  -->  php composer.phar install

Télécharger Composer :
https://getcomposer.org/download/2.8.12/composer.phar

Placer le fichier ici :
Pixelized/back/composer.phar


2) CONFIGURATION DU FICHIER .ENV (BACK)
---------------------------------------
Dans le dossier back :

Copier le fichier .env.example et le renommer en .env :
cp .env.example .env


3) INSTALLER LES DÉPENDANCES PHP
--------------------------------
Toujours dans Pixelized/back :

php composer.phar install


4) GÉNÉRER LA CLÉ LARAVEL
------------------------
Commande :

php artisan key:generate

Vérifier dans back/.env qu’une clé existe bien :
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxx


5) BASE DE DONNÉES (SQLite)
--------------------------
Créer et mettre à jour la base de données :

php artisan migrate

Répondre "yes" lors de la création du fichier SQLite afin qu'il crée cette base de donnée.


6) VARIABLES D’ENVIRONNEMENT (BACK)
-----------------------------------
Dans back/.env, renseigner les variables suivantes (exemple en local) :

APP_URL=http://localhost:8000

MEMCACHED_HOST=localhost
REDIS_HOST=localhost
MAIL_HOST=localhost

SANCTUM_STATEFUL_DOMAINS=http://localhost:5173,http://localhost:8000


7) LANCER LE SERVEUR BACK-END
-----------------------------
Commande :

php artisan serve

URL par défaut :
http://localhost:8000


FRONT-END (React + Vite)
=======================
Dossier : Pixelized/front


8) CONFIGURATION DU FICHIER .ENV (FRONT)
----------------------------------------
Dans le dossier front :

Copier le fichier .env.example et le renommer en .env :

cp .env.example .env


9) VARIABLES D’ENVIRONNEMENT (FRONT)
-----------------------------------
Dans front/.env, renseigner les variables suivantes :

FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000


10) INSTALLER LES DÉPENDANCES FRONT
----------------------------------
Commande :

npm install


11) LANCER LE SERVEUR FRONT
--------------------------
Commande :

npm run dev

Vite affichera une URL du type :
http://localhost:5173

Ctrl + clic sur le lien pour ouvrir l’application.