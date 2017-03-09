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
                    ,{view: 'icon', icon:'play', id: 'playstop', css:"solid_icon"}

                    // Трекер
                    ,{ view:"slider", min:0, max: 86399, id:"time-slider", css: 'slider_css'}

                ]
            }
            ,{
                cols: [
                    // Карта
                    {template: 'test'}

                    // Боковая панель с пультом
                ]
            }
        ]
    });


    // Обработка событий
    $$('time-slider').attachEvent('onSliderDrag', function(){
        let hour = 0, min = 0, sec = 0, value = this.getValue();
        hour = Math.floor(value/3600);
        min = Math.floor((value - hour*3600)/60);
        sec = value - hour*3600 - min*60;

        hour = hour < 10 ? '0' + hour : '' + hour;
        min = min < 10 ? '0' + min : '' + min;
        sec = sec < 10 ? '0' + sec : '' + sec;

        $$('time-label').setValue(hour + ':' + min + ':' + sec);
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