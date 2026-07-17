/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getDiasDelMes(mes: number, anio: number): number {
  return new Date(anio, mes, 0).getDate();
}

export function calcularMoraDeCuota(
  valorBase: number,
  diaCobroStr: string | null,
  fechaPrimerPagoStr: string,
  cuotaNumero: number,
  hoyInput?: Date
): {
  diasRetraso: number;
  recargoPorcentaje: number;
  mensaje: string;
  mes: number;
  anio: number;
} {
  const hoy = hoyInput || new Date();
  const diaActual = hoy.getDate();
  const mesActual = hoy.getMonth() + 1; // 1-indexed
  const añoActual = hoy.getFullYear();

  const diaCobro = diaCobroStr && diaCobroStr.trim() !== "" ? parseInt(diaCobroStr, 10) : 10;
  const diaLimite = diaCobro + 9; // de gracia es dia_cobro + 9

  const parts = fechaPrimerPagoStr.split('/');
  const startDay = parseInt(parts[0], 10);
  const startMonth = parseInt(parts[1], 10);
  const startAnio = parseInt(parts[2], 10);

  let mesCuota = startMonth;
  let añoCuota = startAnio;
  const mesesDesdePrimerPago = cuotaNumero - 1;

  for (let m = 0; m < mesesDesdePrimerPago; m++) {
    mesCuota++;
    if (mesCuota > 12) {
      mesCuota = 1;
      añoCuota++;
    }
  }

  let recargo = 0;
  let diasRetraso = 0;
  let mensajeCuota = "";

  // Si la cuota es de un mes anterior al actual
  if (añoCuota < añoActual || (añoCuota === añoActual && mesCuota < mesActual)) {
    const esMesInmediatoAnterior = (añoCuota === añoActual && mesCuota === mesActual - 1) ||
       (añoCuota === añoActual - 1 && mesCuota === 12 && mesActual === 1);

    const diasDelMesCuota = getDiasDelMes(mesCuota, añoCuota);
    const diasRemanentes = Math.max(0, diasDelMesCuota - diaLimite);

    if (esMesInmediatoAnterior) {
      diasRetraso = diaActual + diasRemanentes;
    } else {
      diasRetraso = diasRemanentes;

      // Sumar los dias de los meses intermedios
      let mesTemp = mesCuota;
      let añoTemp = añoCuota;

      while (true) {
        mesTemp++;
        if (mesTemp > 12) {
          mesTemp = 1;
          añoTemp++;
        }
        if (mesTemp === mesActual && añoTemp === añoActual) {
          break;
        }
        diasRetraso += getDiasDelMes(mesTemp, yearTempOrTemp(añoTemp));
      }
      diasRetraso += diaActual;
    }

    recargo = diasRetraso;
    mensajeCuota = `Cuota ${cuotaNumero} (${mesCuota}/${añoCuota}): Recargo del ${recargo}% por ${diasRetraso} días de retraso`;
  }
  // Si la cuota es del mes actual
  else if (añoCuota === añoActual && mesCuota === mesActual) {
    if (diaActual > diaLimite) {
      diasRetraso = diaActual - diaLimite;
      recargo = diasRetraso;
      mensajeCuota = `Cuota ${cuotaNumero} (${mesCuota}/${añoCuota}): Recargo del ${recargo}% por ${diasRetraso} días de retraso`;
    } else {
      mensajeCuota = `Cuota ${cuotaNumero} (${mesCuota}/${añoCuota}): Sin recargo (período de gracia hasta el día ${diaLimite})`;
    }
  }
  // Si la cuota es de un mes futuro
  else {
    mensajeCuota = `Cuota ${cuotaNumero} (${mesCuota}/${añoCuota}): Sin recargo (pago adelantado)`;
  }

  return {
    diasRetraso,
    recargoPorcentaje: recargo,
    mensaje: mensajeCuota,
    mes: mesCuota,
    anio: añoCuota
  };
}

function yearTempOrTemp(yr: number): number {
  return yr;
}

/**
 * Calcula los meses de atraso en base a la última cuota pagada y la fecha del primer pago
 */
export function calcularMesesAtraso(
  cuotasPagas: number,
  fechaPrimerPagoStr: string,
  hoyInput?: Date
): number {
  if (cuotasPagas === 0) {
    return 0; // O calcular desde el primer pago, pero si no hay pagos tomamos 0 o calculamos según el tiempo. 
  }
  const hoy = hoyInput || new Date();
  
  // Obtenemos el mes de la última cuota pagada (la cuota número cuotasPagas)
  const parts = fechaPrimerPagoStr.split('/');
  const startMonth = parseInt(parts[1], 10);
  const startAnio = parseInt(parts[2], 10);
  
  let ultimoMesPago = startMonth;
  let ultimoAnioPago = startAnio;
  
  const incrementoMeses = cuotasPagas - 1;
  ultimoMesPago += incrementoMeses;
  while (ultimoMesPago > 12) {
    ultimoMesPago -= 12;
    ultimoAnioPago += 1;
  }
  
  // Calcular la diferencia de meses entre "hoy" y "ultimo_mes_pago"
  let mesesDiferencia = (hoy.getFullYear() - ultimoAnioPago) * 12 + (hoy.getMonth() + 1 - ultimoMesPago);
  
  // Opcional: si hoy es posterior al día del último mes, sumamos 1 mes de atraso si ya venció
  return Math.max(0, mesesDiferencia);
}
