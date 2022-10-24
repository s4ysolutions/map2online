/* eslint-disable no-magic-numbers */
import {expect} from 'chai';

class A {
  a: number;

  constructor(a: number) {
    this.a = a;
  }
}

class B extends A {
  b: number;

  constructor(a: number, b: number) {
    super(a);
    this.b = b;
  }
}

describe('Class related', () => {
  it('super constructor', () => {
    const i = new B(1, 2);
    expect(i.a).to.be.eq(1);
    expect(i.b).to.be.eq(2);
  });
});
