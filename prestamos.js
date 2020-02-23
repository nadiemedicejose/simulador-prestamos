var acumIntereses = 0, acumImpuestos = 0, acumCapital = 0
var monto, plazo, totalPagos, tasaAnual, fechaInicio, fechaPago, tasaMensual, mensualidad, intereses, impuestos, capital, insoluto,primerInteres = 0, primerImpuesto = 0, primerCapital = 0, primerInsoluto = 0
const IVA = 0.16

var establecerDatos = function(){
    monto = document.getElementById('monto').value
    periodo = document.getElementById('periodo').value
    plazo = document.getElementById('plazo').value
    tasaAnual = document.getElementById('interes').value
    fechaInicio = new Date(document.getElementById('fecha').value)
    fechaPago = new Date(fechaInicio)

    let plazoMensual = document.getElementById('mensual').checked
    let plazoAnual = document.getElementById('anual').checked

    if (plazoMensual === true) {
        this.plazo = plazo
    } else if (plazoAnual === true) {
        this.plazo = plazo * 12;
    } else {
        alert('No seleccionaste ningún tipo de plazo')
    }

    switch(periodo) {
        case 'semanal':
            let fechaFin = new Date(fechaInicio)
            fechaFin.setMonth(plazo)
            let tiempo = fechaFin.getTime() - fechaInicio.getTime()
            let dias = Math.floor(tiempo / (1000 * 60 * 60 * 24))
            totalPagos = Math.ceil(dias / 7)
            break
        case 'quincenal':
            totalPagos = plazo * 2
            break
        case 'mensual':
            totalPagos = plazo
            break
        default:
            alert('No seleccionaste ningún periodo de pagos')
            break
    }
}

function calcularTasaMensual(){
    tasaMensual = (tasaAnual / 100) / 12
    return tasaMensual
}

function tasaMensualconIVA(){
    return (calcularTasaMensual() + (calcularTasaMensual() * IVA));
}

function PagoMensual() {
    let denominador = Math.pow((1 + tasaMensualconIVA()), totalPagos) - 1
    mensualidad = (tasaMensualconIVA() + (tasaMensualconIVA() / denominador)) * monto
    return mensualidad
}

function calcularTotalPrestamo() {
    let totalPrestamo = 0;
    for (let i = 0; i < totalPagos; i++) {
        totalPrestamo += mensualidad
    }
    return totalPrestamo
}

function obtenerPagoMensual() {
    return Math.round(PagoMensual(), 2)
}

function obtenerTotalPrestamo() {
    return Math.round(calcularTotalPrestamo(), 2)
}

function Intereses() {
    if (primerInteres === 0) {
        intereses = tasaMensual * monto
        primerInteres = intereses
    } else {
        intereses = tasaMensual * insoluto
    }
    return intereses
}

function Impuestos() {
    if (primerImpuesto === 0) {
        impuestos = primerInteres * IVA
        primerImpuesto = impuestos
    } else {
        impuestos = Intereses() * IVA
    }
    return impuestos
}

function Capital() {
    if (primerCapital === 0) {
        capital = mensualidad - primerInteres - primerImpuesto
        primerCapital = capital
    } else {
        capital = mensualidad - Intereses() - Impuestos()
    }
    return capital
}

function SaldoInsoluto() {
    if (primerInsoluto === 0) {
        insoluto = monto - primerCapital
        primerInsoluto = insoluto
    } else {
        insoluto -= Capital()
    }
    return insoluto
}

function simularPrestamo() {
    establecerDatos()
    PagoMensual()
    calcularTotalPrestamo()

    var miArreglo = ['No.', 'Fecha', 'Mensualidad', 'Intereses', 'Impuestos', 'Capital', 'Insoluto']

    var tablaAmortizaciones = document.getElementById('amortizaciones')
    var tabla = document.createElement('table')
    var cabeceraTabla = document.createElement('thead')
    var cuerpoTabla = document.createElement('tbody')
    var pieTabla = document.createElement('tfoot')
    var fila = document.createElement("tr")

    // este for, lo utilizo para el header de la tabla
    for (let j = 0; j < miArreglo.length; j++) {
        let celda = document.createElement("td")
        let texto = miArreglo[j]
        let textoCelda = document.createTextNode(texto)
        celda.appendChild(textoCelda)
        fila.appendChild(celda)
    }
    cabeceraTabla.appendChild(fila)

    // este for, lo utilizo para el cuerpo de la tabla
    for (let i = 0; i < totalPagos; i++) {
        let intereses = Intereses(), impuestos = Impuestos(), capital = Capital(), insoluto = SaldoInsoluto()
        acumIntereses = acumIntereses + intereses
        acumImpuestos = acumImpuestos + impuestos
        acumCapital = acumCapital + capital
        
        var fila = document.createElement("tr")
        for (let j = 0; j < miArreglo.length; j++) {
            var celda = document.createElement("td")
            var texto // el texto a mostrar en la celda
            switch(miArreglo[j]) {
                case 'No.':
                    texto = (i+1)
                    break
                case 'Fecha':
                    if(periodo === 'semanal') {
                        fechaPago.setDate(fechaPago.getDate()+7)
                    } else if (periodo === 'quincenal') {
                        fechaPago.setDate(fechaPago.getDate()+15)
                    } else if(periodo === 'mensual') {
                        fechaPago.setMonth(fechaPago.getMonth()+1)
                    }
                    texto = fechaPago.toLocaleDateString()
                    break
                case 'Mensualidad':
                    texto = '$' + mensualidad.toFixed(2)
                    break
                case 'Intereses':
                    texto = '$' + intereses.toFixed(2)
                    break
                case 'Impuestos':
                    texto = '$' + impuestos.toFixed(2)
                    break
                case 'Capital':
                    texto = '$' + capital.toFixed(2)
                    break
                case 'Insoluto':
                    texto = '$' + Math.abs(insoluto.toFixed(2))
                    break
                default:
                    texto = null
                    break
            }
            var textoCelda = document.createTextNode(texto)
            celda.appendChild(textoCelda)
            fila.appendChild(celda)
        }
        cuerpoTabla.appendChild(fila)
    }

    /* // este for, lo utilizo para el footer de la tabla
    for (let j = 0; j < miArreglo.length; j++) {
        let celda = document.createElement("td")
        let texto
        switch(miArreglo[j]) {
            case 'No.':
                texto = totalPagos
                break
            case 'Intereses':
                texto = '$' + acumIntereses.toFixed(2)
                break
            case 'Impuestos':
                texto = '$' + acumImpuestos.toFixed(2)
                break
            case 'Capital':
                texto = '$' + acumCapital.toFixed(2)
                break
            default:
                texto = null
                break
        }
        let textoCelda = document.createTextNode(texto)
        celda.appendChild(textoCelda)
        fila.appendChild(celda)
    }
    pieTabla.appendChild(fila) */

    tabla.appendChild(cabeceraTabla)
    tabla.appendChild(cuerpoTabla)
    //tabla.appendChild(pieTabla)
    tablaAmortizaciones.appendChild(tabla)
}