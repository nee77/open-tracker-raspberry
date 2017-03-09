if( window.app_views == undefined ) window.app_views = [];


window.app_views.push({
    // Главный вид
    main_view: {
        id: 'map1' // уникальный id вида
        ,menu: true // добавить вид в боковое меню
        ,text: 'Карта' // Текст в меню и в заголовке
        ,icon: 'globe' // Иконка в меню

        // Кнопки и элементы управления на верхней панели у вида
        ,tools: [
            {view: 'search', id: 'map1_search', placeholder: 'Поиск по карте', gravity: 3 }
            ,{width: 20}
            ,{view: 'button', type: 'iconButton', icon:'plus', label: 'Кнопка', id: 'map1_add_button', width: 120}
        ]

        // Основной вид модуля
        ,view: {
            id: 'map1_view' // Должен быть сделан из id вида (выше) с добавлением _view
            ,type: 'clean'
            ,rows: [
                // Панель информации
                {
                    height: 100
                    ,cols: [
                        {
                            id: 'info_speed'
                            ,template: '<div>Скорость</div><div>#speed# км/ч</div>'
                        }

                        ,{
                            id: 'info_alt'
                            ,template: '<div>Высота</div><div>#alt#</div>'
                        }

                        ,{
                            id: 'info_heading'
                            ,template: '<div>Направление</div><div>#heading#</div>'
                        }

                        ,{
                            id: 'info_time'
                            ,template: '<div>Время</div><div>#time#</div>'
                        }

                        ,{
                            id: 'info_position'
                            ,template: '<div>Координаты</div><div>#position#</div>'
                        }
                    ]
                }
                //
                // Карта
                ,{
                    id: "map1_ymap",
                    view:"yandex-map",
                    center: [55.6000, 37.4000],
                    zoom: 15,
                    controls: ["zoomControl"],
                    mapType: 'yandex#satellite',
                    disabled: true
                }
            ]
        }
    }

    // Дополнительные окна в модуле
    ,viewInit: function(){
        webix.ui({
            view:"window",
            id:"real_win",
            height:500,
            width:500,
            left:50, top:50,
            head:{
                view:"toolbar", cols:[
                    {view:"label", label: "Window" },
                    { view:"button", label: 'Х', width: 50, align: 'right', click:"$$('real_win').close();"}
                    ]
            }
            ,
            body:{
                rows: [
                    {
                        view:"datatable",
                        id: 'real_time_table',
                        height:500,
                        width:500,
                        columns:[
                            { id:"data_type_name", header: "Параметр", fillspace: 1},
                            { id:"value",	header:"", width:100, }
                        ],
                        autoheight:true,
                        autowidth:true,
                        data: [
                            { dt_id: 'position', dt_name: 'Координаты', val: ''},
                            { dt_id: 'speed', dt_name: 'Скорость', val: ''},
                            { dt_id: 'alt', dt_name: 'Высота', val: ''},
                            { dt_id: 'online', dt_name: 'Онлайн', val: 'нет'},
                            { dt_id: 'time', dt_name: 'Время', val: ''}
                        ]
                    }
                ]
            }
        });
    }

    // Инициализация логики модуля
    ,logicInit: function(){

        const map_view = $$('map1_view');
        const map_search = $$('map1_search');
        const add_button = $$('map1_add_button');
        const ymap1 = $$('map1_ymap');

        const real_win = $$('real_win');
        const info_speed = $$('info_speed');
        const info_time = $$('info_time');
        const info_alt = $$('info_alt');
        const real_table = $$('real_time_table');

        // Границы карты
        const limit_map_area = [[55.0000, 37.0000],[55.5000, 37.5000]];


        info_alt.bind(data_stores.real_time);
        info_time.bind(data_stores.real_time);
        info_speed.bind(data_stores.real_time);


        //
        // Отрисовка объектов на карте и добавление событий на них
        const map_init = function(){
            // При двойном клике карта зуммируется, отключаем эту функцию
            ymap1.map.events.add('dblclick', function (e) {
                e.preventDefault(); // При двойном щелчке зума не будет.
            });

            // Ограничение карты
            ymap1.map.options.set('restrictMapArea', limit_map_area);

            ymap1.enable();

            // Перерисовка карты в окне
            ymap1.map.container.fitToViewport();

            map_view.attachEvent('onFocus', function(){
                // Перерисовка карты в окне
                ymap1.map.container.fitToViewport();

            });
        };


        //
        // После загрузки модуля карты начинаем работу с ней
        ymap1.attachEvent('onMapLoad', map_init);


        //
        // Добавить
        add_button.attachEvent('onItemClick', function () {
            webix.message('Add button');

            // Перерисовка карты в окне

            // TODO попробовать webix-webix_remote
            var result = webix.remote.add(1,2);
            //or using the then() method
            webix.remote.add(1,2).then(function(result){
                alert(result);
            });

        });

    }
});