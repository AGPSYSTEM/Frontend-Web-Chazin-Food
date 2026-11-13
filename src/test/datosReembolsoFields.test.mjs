import assert from "node:assert/strict";
import test from "node:test";
import {
  requiresDatosReembolso,
  validateDatosReembolso
} from "../features/ventas/utils/datosReembolsoUtils.js";

test("requiresDatosReembolso identifica resoluciones monetarias correctamente", () => {
  assert.equal(requiresDatosReembolso("Devolución de dinero"), true);
  assert.equal(requiresDatosReembolso("Cambio de producto y devolución de dinero"), true);
  assert.equal(requiresDatosReembolso("Cambio de producto"), false);
  assert.equal(requiresDatosReembolso(""), false);
});

test("validateDatosReembolso valida cuenta Bancolombia y normaliza espacios y documento", () => {
  const res = validateDatosReembolso({
    banco: "Bancolombia",
    tipoCuenta: "Ahorros",
    numeroCuenta: "123-456789-01",
    titularNombre: "  María Gómez ",
    titularTipoDocumento: "cc",
    titularDocumento: "1.020.304.506",
    observacionesCuenta: "  Cuenta principal "
  });

  assert.equal(res.valid, true);
  assert.deepEqual(res.errors, {});
  assert.equal(res.normalized.banco, "Bancolombia");
  assert.equal(res.normalized.tipoCuenta, "Ahorros");
  assert.equal(res.normalized.numeroCuenta, "12345678901");
  assert.equal(res.normalized.titularNombre, "María Gómez");
  assert.equal(res.normalized.titularTipoDocumento, "CC");
  assert.equal(res.normalized.titularDocumento, "1020304506");
  assert.equal(res.normalized.observacionesCuenta, "Cuenta principal");
});

test("validateDatosReembolso exige celular colombiano de 10 dígitos iniciando en 3 para Nequi y Daviplata", () => {
  const nequiValido = validateDatosReembolso({
    banco: "Nequi",
    numeroCuenta: "300 123 4567",
    titularNombre: "Carlos Ruiz",
    titularDocumento: "98765432"
  });
  assert.equal(nequiValido.valid, true);
  assert.equal(nequiValido.normalized.tipoCuenta, "Billetera Digital / Celular");
  assert.equal(nequiValido.normalized.numeroCuenta, "3001234567");

  const daviInvalido = validateDatosReembolso({
    banco: "Daviplata",
    numeroCuenta: "2001234567",
    titularNombre: "Carlos Ruiz",
    titularDocumento: "98765432"
  });
  assert.equal(daviInvalido.valid, false);
  assert.match(daviInvalido.errors.numeroCuenta, /10 dígitos e iniciar en 3/);
});

test("validateDatosReembolso distingue Efectivo en Caja entre cliente web y personal POS", () => {
  const payload = {
    banco: "Efectivo en Caja",
    numeroCuenta: "",
    titularNombre: "Ana Torres",
    titularDocumento: "1234567"
  };

  const webClient = validateDatosReembolso(payload, { allowCash: false });
  assert.equal(webClient.valid, false);
  assert.ok(webClient.errors.numeroCuenta);

  const staffPos = validateDatosReembolso(payload, { allowCash: true });
  assert.equal(staffPos.valid, true);
  assert.equal(staffPos.normalized.tipoCuenta, "Caja / POS");
  assert.equal(staffPos.normalized.numeroCuenta, "Efectivo en Caja");
});

test("validateDatosReembolso soporta banco 'Otro' y rechaza cuentas fuera de rango", () => {
  const otroSinNombre = validateDatosReembolso({
    banco: "Otro",
    bancoOtro: " ",
    numeroCuenta: "12345678",
    titularNombre: "Luis Mora",
    titularDocumento: "55443322"
  });
  assert.equal(otroSinNombre.valid, false);
  assert.ok(otroSinNombre.errors.banco);

  const cuentaCorta = validateDatosReembolso({
    banco: "Otro",
    bancoOtro: "Banco Caja Social",
    numeroCuenta: "12345",
    titularNombre: "Luis Mora",
    titularDocumento: "55443322"
  });
  assert.equal(cuentaCorta.valid, false);
  assert.ok(cuentaCorta.errors.numeroCuenta);
});

