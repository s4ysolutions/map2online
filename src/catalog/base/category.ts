import {Category} from '../index';

class CategoryBase implements Category {
  delete(): Promise<void> {
    return Promise.resolve(undefined);
  }

  description: string;

  hasRoute(route: Route): boolean {
    return false;
  }

  id: ID;

  observable(): Observable<Category> {
    return undefined;
  }

  open: boolean;
  routes: Routes;
  summary: string;
  title: string;
  visible: boolean;

}