const URL_SERVIDOR_REST = "https://ikeapp.conveyor.cloud/";

function getConfigValue(keyname) {
    return window.localStorage.getItem(keyname);
}

function setConfigValue(keyname, value) {
    window.localStorage.setItem(keyname, value);
}

function borrarCache() {
	window.localStorage.clear();
}

function mostrarSplashScreen() {
    if (navigator.splashscreen) {
        navigator.splashscreen.show();
    }
}

function ocultarSplashScreen() {
    if (navigator.splashscreen) {
        navigator.splashscreen.hide();
    }
}

function mostrarCargando() {
    if (window.plugins && window.plugins.spinnerDialog) {
        window.plugins.spinnerDialog.show(null, "Cargando", false);
    }
}

function ocultarCargando() {
    if (window.plugins && window.plugins.spinnerDialog) {
        window.plugins.spinnerDialog.hide();
    }
}

function mostrarDialogoError(mensaje) {
    if (navigator.notification) {
        navigator.notification.alert(
            mensaje, // message
            null, // callback
            "Atención", // title
            "Ok" // buttonName
        );
    } else {
        alert(mensaje);
    }
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

function obtenerGeoposicion() {
    var onSuccess = function(position) {
        var latitud = position.coords.latitude;
        var longitud = position.coords.longitude;
        var url = "https://www.google.com/maps/d/embed?mid=1zyq1jojT_RiheZizcZeF1WCLXzY&z=15&ll=" + latitud + "," + longitud;
        //$("#iframeMapa").attr("src", url);
        var ref = cordova.InAppBrowser.open(url, "_blank", "location=yes,zoom=yes");
    };

    var onError = function(error) {
        mostrarDialogoError("El GPS no se encuentra activado");
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
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

function llamarServicioRestPOST(url, parametros) {
    var response = null;
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: url,
        data: parametros,
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

function llamarServicioRestGETFile(url) {
    var token = getConfigValue("token");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.responseType = "arraybuffer";

    xhr.onload = function(e) {
        if (this.status == 200) {
            var archivo = new Blob([this.response], {type: "application/pdf"});
            guardarArchivo("cupon-pago.pdf", archivo);
            ocultarCargando();
        } else {
            mostrarDialogoError("Error al obtener el cupón");
        }
    };

    xhr.send();
}

function login() {
    var password = getConfigValue("legajo");
     var usuario = getConfigValue("dni");
	
	
    
	
    var parametros = {
        grant_type: "password",
        UserName: usuario,
        Password: password,
        client_id: "_Latika1234$_"
    };

    var url = URL_SERVIDOR_REST + "token";
    var response = llamarServicioRestPOST(url, parametros);

    if (response.access_token) {
        setConfigValue("token", response.access_token);
        setConfigValue("usuarioLogueado", "S");
        //log("200", "loading", "Llamado exitoso al servicio " + url);
		mostrarDialogoError("usuarioLogueado");
    } else if (response.error_description) {
        borrarCache();
        setConfigValue("usuarioLogueado", "N");
        //log("401", "loading", "Error al llamar al servicio " + url + " - " + response.error_description);
		mostrarDialogoError("Usuario no válido. Verifique los datos ingresados. Grupo debe tener 5 digitos incluyendo 0 a izquierda. Orden debe tener 3 digitos incluyendo 0 a izquierda. Documento no debe tener puntos ni espacios.");
        return "Usuario no válido. Verifique los datos ingresados. Grupo debe tener 5 digitos incluyendo 0 a izquierda. Orden debe tener 3 digitos incluyendo 0 a izquierda. Documento no debe tener puntos ni espacios.";
    } else {
        borrarCache();
        setConfigValue("usuarioLogueado", "N");
        //log("400", "loading", "Error al llamar al servicio " + url);
		mostrarDialogoError("Usuario no válido. Verifique los datos ingresados. Grupo debe tener 5 digitos incluyendo 0 a izquierda. Orden debe tener 3 digitos incluyendo 0 a izquierda. Documento no debe tener puntos ni espacios.");
        return "Usuario no válido. Verifique los datos ingresados. Grupo debe tener 5 digitos incluyendo 0 a izquierda. Orden debe tener 3 digitos incluyendo 0 a izquierda. Documento no debe tener puntos ni espacios.";
    }
}

function Firmar(Interno) {
    
    var parametros = {
        Inspector: 1,
        Interno: Interno,
        Seccion: 1
    };
    llamarServicioRestPOSTJSON(URL_SERVIDOR_REST + "api/Inspector", parametros);
}

function salir() {
    var urlActual = window.location.href;
    if (urlActual.substring(urlActual.lastIndexOf("/") + 1).startsWith("home.html") || urlActual.substring(urlActual.lastIndexOf("/") + 1).startsWith("loading.html")) {
        navigator.app.exitApp();
    } else {
        navigator.app.backHistory();
    }
}

function salirIndex() {
    var urlActual = window.location.href;
    if (urlActual.substring(urlActual.lastIndexOf("/") + 1).startsWith("index.html")) {
        navigator.app.exitApp();
    }
}

function log(tipoEvento, pantalla, descripcion) {
    var tipoDoc = getConfigValue("tipoDoc");
    var numDoc = getConfigValue("numDoc");

    var parametros = {
        tipo: tipoEvento,
        doc_tipo: tipoDoc,
        doc_numero: numDoc,
        pantalla: pantalla,
        descripcion: descripcion
    };

    llamarServicioRestPOSTJSON(URL_SERVIDOR_REST + "api/logs", parametros);
}

function inicializarPush() {
    if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/)) {
        return;
    }
   /* var push = PushNotification.init({
        "android": {
            "senderID": "869180756146",
            "icon": "iconotificaciones",
            "iconColor": "#2472b5",
            "topics": ["all","android"]
        },
        "ios": {
            "sound": true,
            "vibration": true,
            "badge": true,
            "topics": ["all","ios"]
        }
    });

    push.on("registration", function(data) {
        var oldRegId = getConfigValue("registrationId");
        if (oldRegId !== data.registrationId) {
            setConfigValue("registrationId", data.registrationId);

            var tipoDoc = getConfigValue("tipoDoc");
            var numDoc = getConfigValue("numDoc");
            var SO = "";
            if (device.platform == "Android") {
                SO = "a";
            } else if (device.platform == "iOS") {
                SO = "i";
            }

            var parametros = {
                doc_tipo: tipoDoc,
                doc_numero: numDoc,
                token: data.registrationId,
                so: SO
            };

            var url = URL_SERVIDOR_REST + "api/notificacion_token";
            var response = llamarServicioRestPOSTJSON(url, parametros);

            if (response.estado && response.estado == "ok") {
                log("200", "home", "Llamado exitoso al servicio " + url);
            } else if (response.errores && response.errores.length > 0) {
                log("401", "home", "Error al llamar al servicio " + url + " - " + response.errores[0].descripcion);
            } else {
                log("400", "home", "Error al llamar al servicio " + url);
            }
        }
    });

    push.on("error", function(e) {
        mostrarDialogoError(e.message);
    });

    push.on("notification", function(data) {
        setConfigValue("tituloAviso", data.title);
        setConfigValue("mensajeAviso", data.message);
        setConfigValue("hayAvisos", "S");

        if (data.additionalData.foreground) {
            var urlActual = window.location.href;
            if (urlActual.substring(urlActual.lastIndexOf("/") + 1).startsWith("home.html")) {
               chequearAvisos();
            }
            else if (urlActual.substring(urlActual.lastIndexOf("/") + 1).startsWith("servicios-vw-mis-avisos.html")) {
               inicializarAvisos();
            }
        } else {
            window.location = "servicios-vw-mis-avisos.html";
        }
   });*/
}

function inicializarLoading() {
    $("#ValidacionModal").modal("show");
    setTimeout(function() {
        ocultarSplashScreen();
    }, 1000);
}

function inicializarHome() {
    inicializarPush();
    chequearAvisos();
    obtenerDatosInicio();
    ocultarCargando();
    setTimeout(function() {
        ocultarSplashScreen();
    }, 1000);
}

function inicializarServicios() {
    inicializarPush();

    if (getConfigValue("mostrarBotonAutos") == "S") {
        $(".ike-autos").removeClass("display-none");
    }
    if (getConfigValue("mostrarBotonHogar") == "S") {
        $(".ike-hogar").removeClass("display-none");
    }

    $(".ike-autos").on("click", function(e) {
        setConfigValue("tipoServicio", "Auto");
    });
    $(".ike-hogar").on("click", function(e) {
        setConfigValue("tipoServicio", "Hogar");
    });
}

function inicializarInspecciones() {
    mostrarCargando();
    inicializarPush();
    
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

function inicializarAvisos() {
    mostrarCargando();
    inicializarPush();
    var tipoDoc = getConfigValue("tipoDoc");
    var numDoc = getConfigValue("numDoc");

    var url = URL_SERVIDOR_REST + "api/notificacion_mensaje/" + tipoDoc + "-" + numDoc;
    var response = llamarServicioRestGET(url);

    $("#panelAvisos").empty();
    if (response && response.length > 0) {
        log("200", "servicios-vw-mis-avisos", "Llamado exitoso al servicio " + url);
        $.each(response, function(index, item) {
            var tituloAviso = item.titulo;
            var mensajeAviso = item.mensaje;
            $("#panelAvisos").append("<p id='tituloAviso' class='novedad'>" + tituloAviso + "</p>");
            $("#panelAvisos").append("<p id='mensajeAviso'>" + mensajeAviso + "</p>");
            if (item.tipo == 1) {
                var idBoton = "botonAceptar" + index;
                var botonAceptar = "" +
                    "<li class='botones-servicios-ike'>" +
                        "<a href='#' id='" + idBoton + "' class='menu-central boton ike-ok'> <img src='img/icon-Like.png' width='60' height='60'>  ACEPTAR </a>" +
                    "</li>";
                $("#panelAvisos").append(botonAceptar);
                $("#" + idBoton).on("click", function(e) {
                    aceptarAdjudicacion();
                    mostrarDialogoError("Recibimos su aceptación de adjudicación. Recibirá un mail para confirmar su solicitud.");
                });
            }
            $("#panelAvisos").append("<hr>");
            setConfigValue("hayAvisos", "N");
        });
    } else {
        $("#panelAvisos").append("<p>No hay notificaciones para informar.</p>");
    }

    ocultarCargando();
    setTimeout(function() {
        ocultarSplashScreen();
    }, 3000);
}

function inicializarPuntosPago() {
    mostrarCargando();
    inicializarPush();
    obtenerGeoposicion();
    ocultarCargando();
}

function aceptarAdjudicacion() {
    mostrarCargando();
    var grupo = getConfigValue("grupo");
    var orden = getConfigValue("orden");
    var tipoDoc = getConfigValue("tipoDoc");
    var numDoc = getConfigValue("numDoc");

    var parametros = {
        grupo: grupo,
        orden: orden,
        doc_tipo: tipoDoc,
        doc_numero: numDoc
    };

    var url = URL_SERVIDOR_REST + "api/adjudicacion_aceptada";
    var response = llamarServicioRestPOSTJSON(url, parametros);

    if (response.estado && response.estado == "ok") {
        log("200", "servicios-vw-mis-avisos", "Llamado exitoso al servicio " + url);
    } else if (response.errores && response.errores.length > 0) {
        log("401", "servicios-vw-mis-avisos", "Error al llamar al servicio " + url + " - " + response.errores[0].descripcion);
    } else {
        log("400", "servicios-vw-mis-avisos", "Error al llamar al servicio " + url);
    }
    ocultarCargando();
}

function abrirChat() {
    var nombre = getConfigValue("nombre").split(" ")[0];
    var numDoc = getConfigValue("numDoc");
    nombre = encodeURIComponent(getConfigValue("tipoServicio") + ":" + nombre);

    var url = "https://ikearg.s1gateway.com/webchat/chat_embed.php?cpgid=10000&nw=1&autosubmit=1&name=" + nombre + "&DNI=" + numDoc;
    cordova.InAppBrowser.open(url, "_blank", "location=yes,zoom=yes,clearcache=yes,clearsessioncache=yes");
}

function abrirPDF() {
    mostrarCargando();

    var tipoDoc = getConfigValue("tipoDoc");
    var numDoc = getConfigValue("numDoc");

    var url = URL_SERVIDOR_REST + "api/pago/ultimo_pdfUrl?tipo=" + tipoDoc + "&numero=" + numDoc;
    var response = llamarServicioRestGET(url);

    ocultarCargando();

    if (response.urlParcial) {
        log("200", "servicios-vw-cupon-pago", "Llamado exitoso al servicio " + url);
        var urlPDF = URL_SERVIDOR_REST + response.urlParcial;
        cordova.InAppBrowser.open(urlPDF, "_system");
    } else {
        log("400", "servicios-vw-cupon-pago", "Error al llamar al servicio " + url);
        mostrarDialogoError("Error al obtener el cupón");
    }
}

function guardarArchivo(fileName, data) {
    var directorio = cordova.file.externalDataDirectory;
    if (device.platform == "iOS") {
        directorio = cordova.file.documentsDirectory;
    }

    window.resolveLocalFileSystemURL(directorio, function (directoryEntry) {
        directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                    var rutaArchivo = directorio + fileName;
                    cordova.plugins.fileOpener2.open(
                        rutaArchivo,
                        'application/pdf',
                        {
                            error: onErrorFile,
                            success: function () {
                            }
                        }
                    );
                };

                fileWriter.onerror = onErrorFile;

                fileWriter.write(data);
            }, onErrorFile);
        }, onErrorFile);
    }, onErrorFile);
}

function onErrorFile() {
    mostrarDialogoError("Error al crear el archivo");
}

function obtenerDatosInicio() {
    var tipoDoc = getConfigValue("tipoDoc");
    var numDoc = getConfigValue("numDoc");

    var url = URL_SERVIDOR_REST + "api/usuarios?doc_tipo=" + tipoDoc + "&doc_nro=" + numDoc;
    var response = llamarServicioRestGET(url);

    if (response.usuario) {
        log("200", "home", "Llamado exitoso al servicio " + url);

        $("#nombreUsuario").text(response.usuario.nombre);
        setConfigValue("nombre", response.usuario.nombre);
        setConfigValue("mostrarBotonAutos", "N");
        setConfigValue("mostrarBotonHogar", "N");

        if (response.tipoproductos && response.tipoproductos.length > 0) {
            if (response.tipoproductos.length < 2) {
                setConfigValue("mostrarBotonHogar", "S");
            } else {
                setConfigValue("mostrarBotonHogar", "S");
                setConfigValue("mostrarBotonAutos", "S");
            }
        }
    } else {
        log("400", "home", "Error al llamar al servicio " + url);
    }
}

function chequearAvisos() {
    if (getConfigValue("hayAvisos") == "S") {
        $("#botonAutoahorroVW").append("<img src='img/notif-serv-vw.png' width='19' height='19' alt='Notificación' class='notificacion-serv-vw'>");
        $("#botonMisAvisos").append("<img src='img/notif-mis-avisos.png' width='21' height='21' alt='Notificación' class='notificacion-mis-avisos'>");
    }
}
