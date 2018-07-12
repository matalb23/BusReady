const URL_SERVIDOR_REST = "https://ikeapp.conveyor.cloud/";
//const URL_SERVIDOR_REST = "http://localhost:3672/";
//const URL_SERVIDOR_REST = "http://192.168.1.254:45457/";
function url_servidor(){
    //return getConfigValue("url_server");
  //alert("Entro a funcion url_servidor");
  //alert(getConfigValue("url_server"));
        //return getConfigValue("url_server");
      if (getConfigValue("url_server")==null ) {
          setConfigValue("url_server",URL_SERVIDOR_REST);
          return getConfigValue("url_server");
      } else {

          return getConfigValue("url_server");
        }

}


function redireccionaSeccion(){
  if (getConfigValue("tiposeccion") == "mapa") {

      window.location = "seccion2.html";
  }
  else {
      window.location = "seccion.html";
  }

}
function getConfigValue(keyname) {
    return window.localStorage.getItem(keyname);
}

function setConfigValue(keyname, value) {
    window.localStorage.setItem(keyname, value);
}

function borrarCache() {
	//window.localStorage.clear();
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
            //ocultarCargando();
            mostrarDialogoErrorSalir("En este momento no podemos validar su usuario. Por favor verifique su conexión a internet.J");
            //window.location = "urlServidor.html";
        },
        timeout: 10000
    });//10000
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
            //ocultarCargando();
            mostrarDialogoErrorSalir("En este momento no podemos validar su usuario. Por favor verifique su conexión a internet.compruebe url api");
            window.location = "urlServidor.html";
        },
        timeout: 3000
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
        client_id: "_BusInspector1234$_"
    };

    var url = url_servidor() + "token";

    var response = llamarServicioRestPOST(url, parametros);

    if (response.access_token) {
        setConfigValue("token", response.access_token);
        setConfigValue("usuarioLogueado", "S");

    } else if (response.error_description) {
        borrarCache();
        setConfigValue("usuarioLogueado", "N");
        return "Usuario no válido. Verifique los datos ingresados.Legajo  no debe tener puntos ni espacios . Documento no debe tener puntos ni espacios.";
    } else {
        borrarCache();
        setConfigValue("usuarioLogueado", "N");
        return "Usuario no válido. Verifique los datos ingresados.Legajo  no debe tener puntos ni espacios . Documento no debe tener puntos ni espacios.";
    }
}

function Firmar(Interno) {
  var inspectorid = getConfigValue("inspectorid");
  var seccionid = getConfigValue("seccionid");
    var parametros = {
        Inspector: inspectorid,
        Interno: Interno,
        Seccion: seccionid
    };
    llamarServicioRestPOSTJSON(url_servidor() + "api/Inspector", parametros);
}

function salir() {
    var urlActual = window.location.href;
    if (urlActual.substring(urlActual.lastIndexOf("/") + 1).startsWith("secciones.html") || urlActual.substring(urlActual.lastIndexOf("/") + 1).startsWith("loading.html")) {
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



function inicializarLoading() {


  $("#ValidacionModal").modal("show");
  setTimeout(function() {
      ocultarSplashScreen();
  }, 2000);
}

function inicializarUrlServidor() {
  //if
 $("#url").val(url_servidor());
 //$("#url").val(URL_SERVIDOR_REST);
}

function inicializarHome() {


    //ocultarCargando();
    /*setTimeout(function() {
        ocultarSplashScreen();
    }, 1000);*/
}


function inicializarInspecciones() {
    mostrarCargando();
    var seccionid = getConfigValue("seccionid");

    var url = url_servidor() + "api/seccion/me/"+ "?seccion=" + seccionid;
    lista = llamarServicioRestGET(url);
    setConfigValue("seccionnombre",lista.respuesta.nombre);
    var seccionnombre="<h5>"+ getConfigValue("seccionnombre") + "</h5>";
    var seccionnombre= seccionnombre.toUpperCase();
    $(".nombre-seccion").append(seccionnombre);



    var url = url_servidor() + "api/Inspector?inspector=" + getConfigValue("inspectorid") + "&seccion=" + seccionid;
    lista = llamarServicioRestGET(url);

    if (lista.estado == "ok") {
        if (lista.respuesta.length > 0) {
            $.each(lista.respuesta, function(index, item) {
                var inspeccion =
                "<tr>" +
                    "<td>" +
                        item.interno +
                    "</td>" +
                    "<td>" +
                        item.hora +
                    "</td>" +
                "</tr>";

                $(".tabla-inspecciones").append(inspeccion);
            });
        } else {
            $(".tabla-inspecciones").append("<tr><td colspan='3'>No se encontraron Inspecciones</td></tr>");
        }
    }/* else if (response.errores && response.errores.length > 0) {

    } else {

    }*/
    ocultarCargando();
}
function inicializarSeccion() {
    // mostrarCargando();
    var dni = getConfigValue("dni");
    var legajo = getConfigValue("legajo");
    var url = url_servidor() + "api/Inspector/me/"+ "?dni=" + dni + "&legajo=" + legajo ;
    lista = llamarServicioRestGET(url);
    setConfigValue("inspectorid",lista.respuesta.id);
    setConfigValue("inspectornombre",lista.respuesta.nombre);
    var seccionnombre="<h5> "+ getConfigValue("inspectornombre") + "</h5>";
    var seccionnombre=seccionnombre.toUpperCase();
    $(".nombre-seccion").append(seccionnombre);

    var url = url_servidor() + "api/Seccion" ;
    lista = llamarServicioRestGET(url);

    if (lista.estado == "ok") {
        if (lista.respuesta.length > 0) {
            $.each(lista.respuesta, function(index, item) {
                var seccion =
                "<tr>" +

                    "<td><button type='button' id='" + item.id + "' class='btn-large naranja'>" + item.nombre + "</button>" +

                    "</td>" +
                "</tr>";

                $(".tabla-seccion").append(seccion);
            });
        } else {
            $(".tabla-seccion").append("<tr><td colspan='3'>No se encontraron secciones</td></tr>");
        }
    } else if (response.errores && response.errores.length > 0) {

    } else {

    }
    // ocultarCargando();
}

function LlamarObservacion(Interno,Patente,Observacion) {
  var inspectorid = getConfigValue("inspectorid");
  var seccionid = getConfigValue("seccionid");
    var parametros = {
        inspector: inspectorid,
        interno: Interno,
        seccion: seccionid,
        patente:Patente,
        Descripcion:Observacion
    };
    llamarServicioRestPOSTJSON(url_servidor() + "api/Observacion", parametros);
}
function inicializarSeccionGeo() {

    var dni = getConfigValue("dni");
    var legajo = getConfigValue("legajo");
    var url = url_servidor() + "api/Inspector/me/"+ "?dni=" + dni + "&legajo=" + legajo ;
    lista = llamarServicioRestGET(url);
    setConfigValue("inspectorid",lista.respuesta.id);
    setConfigValue("inspectornombre",lista.respuesta.nombre);

  /*  var seccionnombre="<h2>"+ getConfigValue("inspectornombre") + "</h2>";
    $(".nombre-seccion").append(seccionnombre);
*/
    var url = url_servidor() + "api/Seccion" ;
    lista = llamarServicioRestGET(url);

    if (lista.estado == "ok") {
        if (lista.respuesta.length > 0) {

          return lista.respuesta;

        } else {

        }
    } else if (response.errores && response.errores.length > 0) {

    } else {

    }

}
function ExisteInterno(internoid) {
    var url = url_servidor() + "api/Interno/existe/" + "?interno=" + internoid;
  //  alert(url);
    var lista = llamarServicioRestGET(url);
    if (lista.respuesta=="1")
    {return 1;}
    else { return 0;    }
  }
