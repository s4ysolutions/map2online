import {expect} from 'chai';
import {Subject, concat, merge} from 'rxjs';

describe('Expected behavior of rxjs', () => {
  it('merge does not miss events', () => {
    const s1 = new Subject<number>();
    const s2 = new Subject<number>();

    const c = merge(s1, s2);
    const events: Array<number> = [];

    const subs = c.subscribe(n => {
      events.push(n);
    });

    s1.next(1);
    // eslint-disable-next-line no-magic-numbers
    s2.next(2);
    // eslint-disable-next-line no-magic-numbers
    s1.next(3);
    // eslint-disable-next-line no-magic-numbers
    s2.next(4);
    // eslint-disable-next-line no-magic-numbers
    s2.next(5);
    // eslint-disable-next-line no-magic-numbers
    s1.next(6);
    // eslint-disable-next-line no-magic-numbers
    s1.next(7);
    subs.unsubscribe();

    // eslint-disable-next-line no-magic-numbers
    expect(events).to.be.eql([1, 2, 3, 4, 5, 6, 7]);

  });
  it('concat misses events', () => {
    const s1 = new Subject<number>();
    const s2 = new Subject<number>();

    const c = concat(s1, s2);
    const events: Array<number> = [];

    const subs = c.subscribe(n => {
      events.push(n);
    });

    s1.next(1);
    // eslint-disable-next-line no-magic-numbers
    s2.next(2);
    // eslint-disable-next-line no-magic-numbers
    s1.next(3);
    // eslint-disable-next-line no-magic-numbers
    s2.next(4);
    // eslint-disable-next-line no-magic-numbers
    s2.next(5);
    // eslint-disable-next-line no-magic-numbers
    s1.next(6);
    // eslint-disable-next-line no-magic-numbers
    s1.next(7);
    subs.unsubscribe();

    // eslint-disable-next-line no-magic-numbers
    expect(events).to.be.eql([1, 3, 6, 7]);

  });
});
