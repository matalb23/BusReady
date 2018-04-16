//const URL_SERVIDOR_REST = "http://localhost:3672/";


var app = {
    // Application Constructor
    initialize: function() {
		inicializarInspecciones();
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
        document.getElementById('encode').addEventListener('click', this.encode, false);
		
    },

    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
		
        app.receivedEvent('deviceready');
		
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    scan: function() {
        console.log('scanning');
        
        var scanner = cordova.plugins.barcodeScanner;

        scanner.scan( function (result) { 
/*
            alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  
*/
           console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            //document.getElementById("info").innerHTML = result.text;
            console.log(result);
			Firmar(result.text);
			//inicializarInspecciones();
			 window.location = "home.html";
            /*
            if (args.format == "QR_CODE") {
                window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
            }
            */

        }, function (error) { 
            console.log("Scanning failed: ", error); 
        } );
    },

    encode: function() {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.encode(scanner.Encode.TEXT_TYPE, "http://www.nhl.com", function(success) {
			
            alert("encode success: " + success);
          }, function(fail) {
            alert("encoding failed: " + fail);
          }
        );

    }

};





function getConfigValue(keyname) {
    return window.localStorage.getItem(keyname);
}

function ocultarCargando() {
    if (window.plugins && window.plugins.spinnerDialog) {
        window.plugins.spinnerDialog.hide();
    }
}
function Firmar(interno) {
    
    var parametros = {
        Inspector: 1,
        Interno: interno,
        Seccion: 1
    };
    llamarServicioRestPOSTJSON(URL_SERVIDOR_REST + "api/Inspector", parametros);
	inicializarInspecciones();
}
function mostrarDialogoErrorSalir(mensaje) {
    if (navigator.notification) {
        navigator.notification.alert(
            mensaje, // message
            salirIndex, // callback
            "Atención", // title
            "Ok" // buttonName
        );
    } else {
        alert(mensaje);
    }
}
function llamarServicioRestPOSTJSON(url, parametros) {
    var response = null;
    var token = getConfigValue("token");
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        async: false,
        url: url,
        data: JSON.stringify(parametros),
        headers: {"Authorization": "Bearer " + token},
        success: function(json) {
            response = json;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            ocultarCargando();
            mostrarDialogoErrorSalir("En este momento no podemos validar su usuario. Por favor verifique su conexión a internet.");
            // response = JSON.parse(jqXHR.responseText);
        },
        timeout: 10000
    });
    return response;
}

























function llamarServicioRestGET(url) {
    var response = null;
    var token = getConfigValue("token");
    $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: url,
        headers: {"Authorization": "Bearer " + token},
        success: function(json) {
            response = json;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            ocultarCargando();
            mostrarDialogoErrorSalir("En este momento no podemos validar su usuario. Por favor verifique su conexión a internet.");
            // response = JSON.parse(jqXHR.responseText);
        },
        timeout: 10000
    });
    return response;
}

function mostrarCargando() {
    if (window.plugins && window.plugins.spinnerDialog) {
        window.plugins.spinnerDialog.show(null, "Cargando", false);
    }
}

function inicializarInspecciones() {
    mostrarCargando();
    //inicializarPush();
    
    var url = URL_SERVIDOR_REST + "api/Inspector?inspector=" + 1 ;
    listaAdjudicaciones = llamarServicioRestGET(url);

    if (listaAdjudicaciones.estado == "ok") {
        //log("200", "servicios-vw-resultados-adjudicacion", "Llamado exitoso al servicio " + url);
        if (listaAdjudicaciones.respuesta.length > 0) {
            $.each(listaAdjudicaciones.respuesta, function(index, item) {
                var adjudicacion =
                "<tr>" +
                    "<td>" +
                        item.interno +
                    "</td>" +
                    "<td>" +
                        item.hora +
                    "</td>" +                    
                "</tr>";

                $(".tabla-adj").append(adjudicacion);
            });
        } else {
            $(".tabla-adj").append("<tr><td colspan='3'>No se encontraron Inspecciones</td></tr>");
        }
    } else if (response.errores && response.errores.length > 0) {
       // log("401", "servicios-Inspecciones", "Error al llamar al servicio " + url + " - " + response.errores[0].descripcion);
    } else {
       // log("400", "servicios-Inspecciones", "Error al llamar al servicio " + url);
    }
    ocultarCargando();
}