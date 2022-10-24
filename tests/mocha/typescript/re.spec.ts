/* eslint-disable @typescript-eslint/no-non-null-assertion,no-magic-numbers */
import {use as chaiUse, expect} from 'chai';
import chaiArrays from 'chai-arrays';

chaiUse(chaiArrays);

describe('re', () => {
  it('split single line by new line is not null', () => {
    const toSplit = '1,1';
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(1);
    expect(matches![0]).to.be.eq('1,1');
  });
  it('split one line by new line is not null', () => {
    const toSplit = `1,1
`;
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(1);
    expect(matches![0]).to.be.eq('1,1');
  });
  it('split lines wtih NL by new line is not null', () => {
    const toSplit = '1,1\n2,2';
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(2);
    expect(matches![0]).to.be.eq('1,1');
    expect(matches![1]).to.be.eq('2,2');
  });
  it('split lines wtih CR by new line is not null', () => {
    const toSplit = '1,1\r2,2';
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(2);
    expect(matches![0]).to.be.eq('1,1');
    expect(matches![1]).to.be.eq('2,2');
  });
  it('split lines wtih CR/NL by new line is not null', () => {
    const toSplit = '1,1\r\n2,2';
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(2);
    expect(matches![0]).to.be.eq('1,1');
    expect(matches![1]).to.be.eq('2,2');
  });
  it('split lines wtih NL/CR by new line is not null', () => {
    const toSplit = '1,1\n\r2,2';
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(2);
    expect(matches![0]).to.be.eq('1,1');
    expect(matches![1]).to.be.eq('2,2');
  });
  it('split lines wtih NL/NL by new line is not null', () => {
    const toSplit = '1,1\n\n2,2';
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(2);
    expect(matches![0]).to.be.eq('1,1');
    expect(matches![1]).to.be.eq('2,2');
  });
  it('split lines wtih CR/NL, CR/NL by new line is not null', () => {
    const toSplit = '1,1\r\n\r\n2,2';
    const matches = toSplit.match(/[^\r\n]+/gu);
    expect(matches).to.be.not.null;
    expect(matches!).to.be.array();
    expect(matches!.length).to.be.eq(2);
    expect(matches![0]).to.be.eq('1,1');
    expect(matches![1]).to.be.eq('2,2');
  });
});
