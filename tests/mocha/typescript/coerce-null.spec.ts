import {expect} from 'chai';

describe('coerce', () => {
  it('null?.something === null', () => {
    let a: {b: string} | null = null;
    for (let i = 1; i === 1; i++) {
      if (i === 1) {
        a = null;
      } else {
        a = {b: 'never'};
      }
    }
    // eslint-disable-next-line no-unused-expressions
    expect(a?.b).to.be.undefined;
  });
});
