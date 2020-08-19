import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import catalogFactory from '../../../src/app-rx/catalog/default/catalog';
import {expect} from 'chai';
import {wordingFactory} from '../../../src/app-rx/personalization/wording/default';
import {Wording} from '../../../src/app-rx/personalization/wording';
import {KV} from '../../../src/kv-rx';

describe.only('Catalog categories', () => {
  let storage: KV;
  let wording: Wording;

  beforeEach(() => {
    storage = memoryStorageFactory()
    wording = wordingFactory(storage)
  })

  it('New Catalog must not have categories till wording initialized', () => {
    const catalog = catalogFactory(storage, wording)
    expect(catalog).has.property('categories')
    expect(catalog.categories).has.property('length', 0)
  })

  it('New Catalog must have 1 category if wording initialized', () => {
    wording.currentRouteVariant = "ru";
    wording.currentCategoryVariant = "en";
    const catalog = catalogFactory(storage, wording)
    expect(catalog).has.property('categories')
    expect(catalog.categories).has.property('length', 1)
  })
})
