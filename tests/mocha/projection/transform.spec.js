import {expect} from 'chai';
import {fromEPSG4326toEPSG3857} from './module';

describe('Projection', () => {
  it('fromEPSG4326toEPSG3857', () => {
    expect(fromEPSG4326toEPSG3857).to.not.be.undefined;
  })
});
