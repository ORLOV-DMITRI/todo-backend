#!/bin/bash

echo "Начинаем деплой Express приложения..."

git checkout production
git merge master

echo "Устанавливаем зависимости..."
npm install

echo "Перезапускаем приложение..."
pm2 restart todo-server || pm2 start app.js --name "todo-server"

pm2 save
pm2 status
