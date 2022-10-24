/* eslint-disable func-style, no-magic-numbers */
/* xeslint-disable func-style, func-names, no-magic-numbers,  @typescript-eslint/ban-ts-comment */
import {expect} from 'chai';

interface Parent {
  a: number;
  getA(): number
}

function Parent(this: Parent, a: number) {
  this.a = a;
}

Parent.prototype.getA = function getA () {
  return this.a;
};

interface Child extends Parent {
  b: number;
  getB(): number
}

// eslint-disable-next-line @typescript-eslint/no-shadow
const Child = function Child(this: Child, a: number, b: number) {
  Parent.call(this, a);
  this.b = b;
} as unknown as {new (a: number, b: number): Child};


describe('ES5 classes', () => {
  it('Object.setPrototypeOf destroys parent, keeps child', () => {
    Child.prototype.getB = function getB () {
      return this.b;
    };
    Object.setPrototypeOf(Child, Parent);

    const child = new Child(1, 2);
    expect(child.getA).to.be.undefined;
    expect(child.getB()).to.be.eq(2);
  });

  it('Object.setPrototypeOf destroys parent, keeps child in the other order', () => {
    Object.setPrototypeOf(Child, Parent);
    Child.prototype.getB = function getB () {
      return this.b;
    };

    const child = new Child(1, 2);
    expect(child.getA).to.be.undefined;
    expect(child.getB()).to.be.eq(2);
  });

  it('Child.prototype = Object.create keeps parent', () => {
    Child.prototype = Object.create(Parent.prototype);
    Child.prototype.getB = function getB () {
      return this.b;
    };

    const child = new Child(1, 2);
    expect(child.getA()).to.be.eq(1);
    expect(child.getB()).to.be.eq(2);
  });

  it('Child.prototype = Object.create destroys child', () => {
    Child.prototype.getB = function getB () {
      return this.b;
    };
    Child.prototype = Object.create(Parent.prototype);

    const child = new Child(1, 2);
    expect(child.getA()).to.be.eq(1);
    expect(child.getB).to.be.undefined;
  });

});
