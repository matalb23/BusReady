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

        scanner.scan(

		function (result) {
			if(!isNaN(result.text)  )
			{
        if (result.text!="")
				{
          Firmar(result.text);
        }
			}
      else {
          alert("No es un qr valido");
      }
			window.location = "inspeccionar.html";
      },
      function (error) {
          alert("No se leyo el interno: " + error);
      },
      {
          preferFrontCamera : false, // iOS and Android
          showFlipCameraButton : false, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: true, // Android, launch with the torch switched on (if available)
          saveHistory: false, // Android, save scan history (default false)
          prompt : "Firme el Interno", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS and Android
      }

		);
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



function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getConfigValue(keyname) {
    return window.localStorage.getItem(keyname);
}

function ocultarCargando() {
    if (window.plugins && window.plugins.spinnerDialog) {
        window.plugins.spinnerDialog.hide();
    }
}
function Firmar(interno) {
var inspectorid = getConfigValue("inspectorid");
var seccionid = getConfigValue("seccionid");
    var parametros = {
        Inspector: inspectorid,
        Interno: interno,
        Seccion: seccionid
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
  var seccionid = getConfigValue("seccionid");

var url = URL_SERVIDOR_REST + "api/seccion/me/"+ "?seccion=" + seccionid;
lista = llamarServicioRestGET(url);
setConfigValue("seccionnombre",lista.respuesta.nombre);
var seccionnombre="<h1>"+ getConfigValue("seccionnombre") + "</h1>";
    $(".nombre-seccion").append(seccionnombre);


var inspectorid = getConfigValue("inspectorid");
    var url = URL_SERVIDOR_REST + "api/Inspector?inspector=" + inspectorid ;
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
  //  ocultarCargando();
}
