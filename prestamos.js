const IVA = 0.16
let monto, plazo, totalPagos, tasaAnual, fechaInicio, fechaPago, tasaMensual, mensualidad, intereses, impuestos,
  capital, insoluto, primerInteres, primerImpuesto, primerCapital, primerInsoluto, primerFechaPago, acumIntereses, acumImpuestos, acumCapital

const dinero = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN'
})

var establecerDatos = function () {
  primerInteres = 0, primerImpuesto = 0, primerCapital = 0, primerInsoluto = 0, primerFechaPago = true
  acumIntereses = 0, acumImpuestos = 0, acumCapital = 0

  monto = document.getElementById('monto').value
  periodo = document.getElementById('periodo').value
  plazo = document.getElementById('plazo').value
  tasaAnual = document.getElementById('interes').value
  fechaInicio = new Date(document.getElementById('fecha').value)
  fechaInicio.setDate(fechaInicio.getDate() + 1) // fecha actual

  let plazoMensual = document.getElementById('mensual').checked
  let plazoAnual = document.getElementById('anual').checked

  if ( plazoMensual === true ) {
    this.plazo = plazo
  } else if ( plazoAnual === true ) {
    this.plazo = plazo * 12
  } else {
    alert('No seleccionaste ningún tipo de plazo')
  }

  switch ( periodo ) {
    case 'semanal':
      let fechaFin = new Date(fechaInicio)
      fechaFin.setMonth(fechaFin.getMonth() + parseInt(plazo))
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

function calcularTasaMensual () {
  tasaMensual = (tasaAnual / 100) / 12
  return tasaMensual
}

function tasaMensualconIVA () {
  return (calcularTasaMensual() + (calcularTasaMensual() * IVA))
}

function PagoMensual () {
  let denominador = Math.pow((1 + tasaMensualconIVA()), totalPagos) - 1
  mensualidad = (tasaMensualconIVA() + (tasaMensualconIVA() / denominador)) * monto
  return mensualidad
}

function calcularTotalPrestamo () {
  let totalPrestamo = 0
  for ( let i = 0; i < totalPagos; i++ ) {
    totalPrestamo += mensualidad
  }
  return totalPrestamo
}

function obtenerPagoMensual () {
  return Math.round(PagoMensual(), 2)
}

function obtenerTotalPrestamo () {
  return Math.round(calcularTotalPrestamo(), 2)
}

function Intereses () {
  if ( primerInteres === 0 ) {
    intereses = tasaMensual * monto
    primerInteres = intereses
  } else {
    intereses = tasaMensual * insoluto
  }
  return intereses
}

function Impuestos () {
  if ( primerImpuesto === 0 ) {
    impuestos = primerInteres * IVA
    primerImpuesto = impuestos
  } else {
    impuestos = Intereses() * IVA
  }
  return impuestos
}

function Capital () {
  if ( primerCapital === 0 ) {
    capital = mensualidad - primerInteres - primerImpuesto
    primerCapital = capital
  } else {
    capital = mensualidad - Intereses() - Impuestos()
  }
  return capital
}

function SaldoInsoluto () {
  if ( primerInsoluto === 0 ) {
    insoluto = monto - primerCapital
    primerInsoluto = insoluto
  } else {
    insoluto -= Capital()
  }
  return insoluto
}

function simularPrestamo () {
  establecerDatos()
  PagoMensual()
  calcularTotalPrestamo()

  var columnas = [ 'No.', 'Fecha', 'Mensualidad', 'Intereses', 'Impuestos', 'Capital', 'Insoluto' ]

  var amortizaciones = document.getElementById('amortizaciones')
  var tabla = document.createElement('table')
  var cabeceraTabla = document.createElement('thead')
  var cuerpoTabla = document.createElement('tbody')
  var pieTabla = document.createElement('tfoot')
  var fila = document.createElement('tr')

  // header de mi tabla
  for ( let j = 0; j < columnas.length; j++ ) {
    let celda = document.createElement('td')
    let texto = columnas[j]
    let textoCelda = document.createTextNode(texto)
    celda.appendChild(textoCelda)
    fila.appendChild(celda)
  }
  cabeceraTabla.appendChild(fila)

  // cuerpo de mi tabla
  for ( let i = 0; i < totalPagos; i++ ) {
    let intereses = Intereses(), impuestos = Impuestos(), capital = Capital(), insoluto = SaldoInsoluto()
    acumIntereses += intereses
    acumImpuestos += impuestos
    acumCapital += capital

    var fila = document.createElement('tr')
    for ( let j = 0; j < columnas.length; j++ ) {
      let celda = document.createElement('td')
      let texto

      switch ( columnas[j] ) {
        case 'No.':
          texto = (i + 1)
          break
        case 'Fecha':
          if ( primerFechaPago === true ) {
            fechaPago = new Date(fechaInicio)
            primerFechaPago = false
          } else {
            if ( periodo === 'semanal' ) {
              fechaPago.setDate(fechaPago.getDate() + 7)
            } else if ( periodo === 'quincenal' ) {
              fechaPago.setDate(fechaPago.getDate() + 15)
            } else if ( periodo === 'mensual' ) {
              fechaPago.setMonth(fechaPago.getMonth() + 1)
            }
          }
          texto = fechaPago.toLocaleDateString()
          break
        case 'Mensualidad':
          texto = dinero.format(mensualidad)
          break
        case 'Intereses':
          texto = dinero.format(intereses)
          break
        case 'Impuestos':
          texto = dinero.format(impuestos)
          break
        case 'Capital':
          texto = dinero.format(capital)
          break
        case 'Insoluto':
          texto = dinero.format(Math.abs(insoluto))
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

  // footer de la tabla
  for ( let j = 0; j < columnas.length; j++ ) {
    let celda = document.createElement('td')
    let texto
    switch ( columnas[j] ) {
      case 'No.':
        texto = totalPagos
        break
      case 'Intereses':
        texto = dinero.format(acumIntereses)
        break
      case 'Impuestos':
        texto = dinero.format(acumImpuestos)
        break
      case 'Capital':
        texto = dinero.format(acumCapital)
        break
      default:
        texto = ''
        break
    }
    let textoCelda = document.createTextNode(texto)
    celda.appendChild(textoCelda)
    pieTabla.appendChild(celda)
  }

  tabla.appendChild(cabeceraTabla)
  tabla.appendChild(cuerpoTabla)
  tabla.appendChild(pieTabla)
  amortizaciones.appendChild(tabla)
}
