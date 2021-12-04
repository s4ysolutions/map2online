import {Categories, Category, CategoryProps} from '../index';

class CategoriesBase implements Categories {
  add(props: CategoryProps | null, position: number | undefined): Promise<Category> {
    return Promise.resolve(undefined);
  }

  byPos(index: number): Category | null {
    return undefined;
  }

  readonly length: number;

  observable(): Observable<Categories> {
    return undefined;
  }

  remove(category: Category): Promise<number> {
    return Promise.resolve(0);
  }

  reorder(from: number, to: number): void {
  }

  [Symbol.iterator](): Iterator<Category> {
    return undefined;
  }
}