/* eslint-disable */
import {expect} from 'chai';
import {makePinURL} from '../../../src/style/default/pin';
import {map2colors} from '../../../src/style/colors';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {isIconStyle, isLineStyle} from '../../../src/style';


const map2styles = map2StylesFactory();
const map2DefaultStyle = map2styles.defaultStyle;

describe('Default map2 styles', () => {
  it('there are 9 map2 styles', () => {
    expect(map2styles.styles.length).to.be.eq(9);
  })
  it('default style should be red', () => {
    expect(map2DefaultStyle.lineStyle!.color).to.be.eq(map2colors.RED,'line style is ' + map2DefaultStyle.lineStyle!.color);
    expect(map2DefaultStyle.iconStyle!.color).to.be.eq(map2colors.RED);
    expect(map2DefaultStyle.iconStyle!.icon).to.be.eq(makePinURL(map2colors.RED));
  })
  it('style type guards', () => {
    expect(isIconStyle(map2DefaultStyle.iconStyle)).to.be.true
    expect(isLineStyle(map2DefaultStyle.iconStyle)).to.be.false
    expect(isIconStyle(map2DefaultStyle.lineStyle)).to.be.false
    expect(isLineStyle(map2DefaultStyle.lineStyle)).to.be.true
  })
  it('can find equal', () => {
    const s2 = map2styles.styles[2];
    const s = map2styles.findEq(s2);
    expect(s).to.not.be.undefined;
    expect(s).to.not.be.null;
    expect(s!.id).to.be.eq(s2.id);
  })
  it('find Orange style', () => {
    const c = "#f58231ff";
    const s = map2styles.byColorId(c);
    expect(s).to.not.be.undefined;
    expect(s).to.not.be.null;
    expect(s!.lineStyle!.color).to.be.eq(c);
    expect(s!.iconStyle!.color).to.be.eq(c);
  })
});
