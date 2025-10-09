1 - Download Composer.phar (All the command will be with composer.phar instead of composer (EX : composer install -----> composer.phar install))





link to DL composer ----> :   https://getcomposer.org/download/2.8.12/composer.phar



2 - put it in the back folder (Pixelized/back/composer.phar)


3 - Copy the .env.example file and rename it .env (dont delete the original .env.example because github doesnt take the .env, so it needs to be here)


4 - go in the folder Pixelized/back 


5 - php composer.phar install (= composer install for dependencies)

6 -php artisan key:generate


7 -php artisan migrate 


8 - php artisan serve (launching the server).
