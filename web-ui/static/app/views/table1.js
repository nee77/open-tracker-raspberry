if( window.app_views == undefined ) window.app_views = [];


window.app_views.push({
    // Главный вид
    main_view: {
        id: 'table1'
        ,menu: true
        ,text: 'Таблица'
        ,icon: 'table'
        ,tools: [
            {view: 'search', id: 'table1_search', placeholder: 'Поиск по таблице', gravity: 3 }
            ,{width: 20}
            ,{view: 'button', type: 'iconButton', icon:'plus', label: 'Добавить', id: 'table1_add_button', width: 120}
        ]
        // Основной вид модуля
        ,view: {
            id: 'table1_view'
            ,type: 'clean'
            ,rows: [
                {
                    view: 'datatable'
                    , id: 'table1_datatable'
                    , columns: [
                        {header: "# ID", id: 'id', sort: 'int', width: 50}
                        ,{header: 'Название', id: 'title', fillspace: 1, sort: 'string'}
                        ,{header: 'Год', id: 'year', width: 100, sort: 'int'}
                        ,{header: 'Рейтинг', id: 'rating', width: 100, sort: 'int'}
                    ]
                    ,scheme: {
                        $change: function (row) {
                            // row.$css = '';
                            // if( row.rating > 50 ) row.$css = "row_css";
                        }
                    }
                    ,select: true
                    //,footer: true
                    ,url: 'static/app/test_data/table1.data'
                }
            ]
        }
    }

    // Формы и окна
    ,viewInit: function(){

    }

    // Инициализация модуля
    ,logicInit: function(){

        var add_button = $$('table1_add_button');

        //
        // Добавить
        add_button.attachEvent('onItemClick', function () {
            webix.remote.add(5,2).then(function(result){
                webix.message(result);
            });

        });

    }

});