webix.ready(function() {
    // Запускаем главный вид
    webix.ui({
        type:"material",
        rows: [
            // трекер времени
            {
                view: 'toolbar'
                ,css:"bg_panel_raised bg_primary"
                ,elements: [
                    // Список дней
                    {
                        view: 'richselect'
                        ,id: 'day-select'
                        ,width: 170
                        ,value: common_f.get_today()
                        ,options: common_f.get_list()
                    }

                    // Время трекера
                    ,{view: 'label', label: '00:00:)0', id: 'time-label', width: 100}

                    // Кнопка плей-топ
                    ,{view: 'toggle', type: 'icon', offIcon:'play', onIcon: 'stop', id: 'playstop', css:"solid_icon", width: 50}

                    // Трекер
                    ,{ view:"slider", min:0, max: 86399, step: 60, id:"time-slider", css: 'slider_css'}

                ]
            }
            ,{
                cols: [
                    // Карта
                    {
                        id: "map1",
                        view:"yandex-map",
                        center: [55.6225, 37.4548],
                        zoom: 15,
                        controls: ["zoomControl"],
                        mapType: 'yandex#satellite',
                        gravity: 3
                    }

                    // Боковая панель с пультом
                    ,{
                        gravity: 1
                        ,rows: [
                            {
                                template: 'image'
                            }
                            ,{
                                template: 'telemetry'
                            }
                        ]
                    }
                ]
            }
        ]
    });


    let play_in_progress = false;

    const play_track = function(){
        if( !play_in_progress ){
            play_in_progress = setInterval(function(){
                let slider_value = $$('time-slider').getValue();
                $$('time-slider').setValue(slider_value + 1);
            }, 1000);
        }
    };

    const stop_track = function(){
        if( play_in_progress ){
            clearInterval(play_in_progress);
            play_in_progress = null;
        }
    };


    const set_time_label = function(){
        let slider_value = $$('time-slider').getValue();

        //
        // Установить время в панели
        let hour = Math.floor(slider_value/3600);
        let min = Math.floor((slider_value - hour*3600)/60);
        let sec = slider_value - hour*3600 - min*60;

        hour = hour < 10 ? '0' + hour : '' + hour;
        min = min < 10 ? '0' + min : '' + min;
        sec = sec < 10 ? '0' + sec : '' + sec;

        $$('time-label').setValue(hour + ':' + min + ':' + sec);
    };

    // Переключение вида карты, фото и телеметрии на позицию слайдера
    const set_frame = function(){

        set_time_label();

        //
        // TODO Переставить объект на карте

        //
        // TODO переставить центр карты если нужно

        //
        // TODO Перерисовать след

        //
        // TODO Загрузить изображение

        //
        // TODO Обновить таблицу с телеметрией



    };


    // Обработка событий
    $$('time-slider').attachEvent('onChange', set_frame);

    $$('time-slider').attachEvent('onSliderDrag', set_time_label);

    $$('playstop').attachEvent('onChange', function(value){
        if( value ){
            play_track();
        }
        else {
            stop_track();
        }
    });



});

const common_f = {
    get_today: function(){
        return 'd-0';
    }

    ,get_list: function(){
        return [
            {id:'d-0', value: 'Сегодня'}
            ,{id:'d-1', value: 'Вчера'}
            ,{id:'d-2', value: 'Позавчера'}
        ];
    }
};