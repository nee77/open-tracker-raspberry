/*
Это измененный модуль Webix для Яндекс.Карт, который загружает более свежую библиотеку на нужном языке
А также вызывает событие onMapLoad после инициализации карты

Версия API Яндекс карт и язык указываются в переменных ниже

ко всем изменениям комменатрии в коде

Оригинальный файл
http://cdn.webix.com/components/yandexmap/yandexmap.js

Пример с оригинальным файлом
http://docs.webix.com/samples/32_thirdparty/11_yandex_map.html

модуль подключается вместо оригинального, далее используется как обычно
<script src="/PATH/TO/webix_yandexmap.js"></script>

 */

var yandex_map_api_version = '2.1';
var yandex_map_api_lang = 'ru_RU';

webix.protoUI({
	name:"yandex-map",
	$init:function(config){
		this.$view.innerHTML = "<div class='webix_map_content' style='width:100%;height:100%'></div>";
		this._contentobj = this.$view.firstChild;

		this.map = null;
		this.$ready.push(this.render);
	},
	render:function(){
        if(typeof ymaps=="undefined"){
        	var name = "webix_callback_"+webix.uid();
            window[name] = webix.bind(function(){
                 this._initMap.call(this,true);
            },this);

            var script = document.createElement("script");
            script.type = "text/javascript";

            // оригинальная строка
            // script.src = "//api-maps.yandex.ru/2.0-stable/?load=package.standard&lang=en-US&onload="+name;
            // заменена на
            script.src = "//api-maps.yandex.ru/" + yandex_map_api_version + "/?lang=" + yandex_map_api_lang + "&onload="+name;

            document.getElementsByTagName("head")[0].appendChild(script);
        }
        else
            this._initMap();
	},
    _initMap:function(define){
	    var c = this.config;

        this.map = new ymaps.Map(this._contentobj, {
        	center:c.center,
        	zoom:c.zoom,
        	type:c.mapType,
            controls: c.controls
        });
        webix._ldYMap = null;

        // добавлено: после загрузки карты вызывается свое событие, к которому можно привязаться
        this.callEvent("onMapLoad")
    },
	center_setter:function(config){
		if(this.map)
            this.map.setCenter(config);

		return config;
	},
	mapType_setter:function(config){
		// варианты карт: yadex#map, yadex#satellite, yadex#hybrid, yadex#publicMap
		if(this.map)
        	this.map.setType(config);

		return config;
	},
	zoom_setter:function(config){
		if(this.map)
			 this.map.setZoom(config);

		return config;
	}

    // добавлено webix.EventSystem, чтобы модуль работал с событиями
}, webix.EventSystem, webix.ui.view);