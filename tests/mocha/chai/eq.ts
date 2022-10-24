import {expect} from 'chai';

describe('Test chai eq works as expected', () => {
  it('eq array should be false', () => {
    // eslint-disable-next-line no-magic-numbers
    const a = [1, 2, 3];
    // eslint-disable-next-line no-magic-numbers
    expect(a).to.be.not.eq([1, 2, 3]);
  });
  it('equal array should be false', () => {
    // eslint-disable-next-line no-magic-numbers
    const a = [1, 2, 3];
    // eslint-disable-next-line no-magic-numbers
    expect(a).to.be.not.equal([1, 2, 3]);
  });
  it('equals array should be false', () => {
    // eslint-disable-next-line no-magic-numbers
    const a = [1, 2, 3];
    // eslint-disable-next-line no-magic-numbers
    expect(a).to.be.not.equals([1, 2, 3]);
  });

  it('eql array should be true for 1 level', () => {
    // eslint-disable-next-line no-magic-numbers
    const a = [1, 2, 3];
    // eslint-disable-next-line no-magic-numbers
    expect(a).to.be.eql([1, 2, 3]);
  });
  it('eql array should be true for 2 level', () => {
    // eslint-disable-next-line no-magic-numbers
    const a = [[1, 1], [2, 2], [3, 3]];
    // eslint-disable-next-line no-magic-numbers
    expect(a).to.be.eql([[1, 1], [2, 2], [3, 3]]);
  });

});
