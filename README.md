Open Tracker for Raspberry Pi 3

http://open-tracker.ru


Как в Raspberry Pi прописать ID устройства из панели упарвления

sudo nano /etc/environment

Добавить строку:

export OPEN_TRACKER_ID="your_id"





## Install ##

npm install

PM2 http://pm2.keymetrics.io
npm install pm2 -g

возможны проблемы с тайм-аутом после перезагрузки
нужно увеличить время в файле настройки /etc/systemd/system/pm2-pi.service

pm save
pm startup
pm list



## Установка hotspot WiFi ##



