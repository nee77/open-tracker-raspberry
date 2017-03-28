# Open Tracker для Raspberry Pi 3 #

http://open-tracker.ru

Github https://github.com/nee77/open-tracker-raspberry


## Установка ОС Raspbian на Raspberry Pi 3 ##

Скачиваем свежий дистрибутив Rasbian Lite https://www.raspberrypi.org/downloads/raspbian/

Устанавливаем его на SD карту. На Linux список устройств

    sudo blkid

Находим карту и пишем на нее образ

    sudo dd if=/home/user/Downloads/jessie.img of=/dev/mmcblk0 bs=1M

В разделе BOOT создаем пустой файл ssh, чтобы компьютер запустился с включенным SSH.

Подключаем Raspberry Pi к роутеру и находим его IP адрес.

Подключаемся через терминал (имя и пароль pi/raspberry) и запускаем утилиту для настройки.
Нужно включить необходимые интерфейсы и поменять стандартный пароль. Если не включить SSH,
то после перезагрузки SSH не включится и нужно заново создавать пустой файл ssh в разделе BOOT.

    sudo raspi-config

Перегружаем устройство и подключаемся заново.


## Установка NodeJS и пакетов ##

Обновляем дистрибутив

    sudo apt-get update && sudo apt-get upgrade -y

Устанавливаем NodeJS 7

    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y nodejs

Варианты установки NodeJS https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

Устанавливаем необходимые пакеты

    sudo apt-get install git
    sudo npm install pm2 -g


## Устанавливаем wifi сеть по умолчанию ##

Можно настроить Raspberry Pi так, чтобы он подключался к известным WiFi сетям автоматически, когда они будут в зоне видимости.
Открываем файл конфигурации

    sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

И вставляем в него эти строки со своим названием сети и паролем.

    network={
        ssid="название_сети"
        psk="пароль_сети"
    }

Сохраняем Ctrl+X, y, Enter.

После сохранения компьютер попытается найти и подключиться к новой сети.
Застваить еще раз подключиться

    sudo wpa_cli reconfigure

Проверить состояние сети

    ifconfig wlan0

Более подробно с дополнительными настройками https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md



## Записать ID устройства из панели управления ##

Откроем файл с системными переменными

    sudo nano /etc/environment

Добавить строку. Укажите свой ID устройства вместо your_id, он может начинаться со знака - (девис):

    export OPEN_TRACKER_ID="your_id"

Перегружаемся

    sudo reboot


## Установка Open Tracker из репозитория ##

Скопируем файлы в папку пользователя

    cd
    git clone https://github.com/nee77/open-tracker-raspberry.git && cd open-tracker-raspberry

Установим необходимые пакеты

    npm install

Запустим процесс

    pm2 start main.js --name open-tracker

И настроим его автозапуск

    pm2 save
    pm2 startup

Менеджер процессов pm2 покажет команду, которую нужно скопировать
в терминал и выполнить с правами sudo

Перегружаемся и проверяем работу скрипта

    pm2 monit


Если у вас возникли вопросы, их можно задать на странице в Github
https://github.com/nee77/open-tracker-raspberry



