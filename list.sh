#!/usr/bin/env bash

for folders in $(find /var/www/projects/fa-nodejs/* -type d )
#do echo "$folders" && rm -R "$folders"
do echo "$folders"
done

#for folders in $(find ./fa-nodejs/* -type d )
#do echo "$folders" && cp -R "$folders" /var/www/projects/fa-nodejs
#do echo "$folders"
#done
