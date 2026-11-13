import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseEventoInsumos,
  formatEventoToppingsText,
  isToppingEvento,
  formatTipoEvento
} from '../shared/utils/eventoUtils.js';

test('parseEventoInsumos handles JSON string, array, and legacy id/unidad keys', () => {
  const fromJson = parseEventoInsumos({
    insumosAsociados: JSON.stringify([
      { id: 3, nombre: 'Tocineta Ahumada', cantidad: 30, unidad: 'g' }
    ])
  });
  assert.deepEqual(fromJson, [
    {
      id: 3,
      idInsumo: 3,
      nombre: 'Tocineta Ahumada',
      cantidad: 30,
      unidad: 'g',
      unidadMedida: 'g'
    }
  ]);

  const fromArray = parseEventoInsumos({
    insumosAsociados: [
      { idInsumo: 8, nombre: 'Queso Cheddar', cantidad: 2, unidadMedida: 'und' }
    ]
  });
  assert.equal(fromArray.length, 1);
  assert.equal(fromArray[0].id, 8);
  assert.equal(fromArray[0].unidad, 'und');
});

test('parseEventoInsumos returns empty array for invalid JSON or empty values', () => {
  assert.deepEqual(parseEventoInsumos({ insumosAsociados: '{malformed' }), []);
  assert.deepEqual(parseEventoInsumos(null), []);
});

test('formatEventoToppingsText and isToppingEvento format and detect courtesy toppings', () => {
  const evt = {
    tipoEvento: 'Añadir Insumos',
    insumosAsociados: [
      { id: 3, nombre: 'Tocineta', cantidad: 30, unidad: 'g' },
      { idInsumo: 9, nombre: 'Queso Mozzarella', cantidad: 1, unidadMedida: 'und' }
    ]
  };
  assert.equal(
    formatEventoToppingsText(evt),
    'Tocineta (30 g) + Queso Mozzarella (1 und)'
  );
  assert.equal(isToppingEvento(evt), true);
  assert.equal(isToppingEvento({ tipoEvento: 'Descuento', insumosAsociados: [] }), false);
  assert.equal(formatTipoEvento('Añadir Insumos'), 'Topping Extra');
});
