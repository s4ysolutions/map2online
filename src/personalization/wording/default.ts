/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Wording} from './index';
import {currentLocale} from '../../l10n';
import {KV} from '../../kv-rx';
import {Observable, merge} from 'rxjs';
import {map} from 'rxjs/operators';

const categoryVariants: Record<string, string[]> = {
  ru: [
    'путешествия',
    'поездки',
    'проекты',
    'экспедиции',
    'папки',
  ],
  en: [
    'travels',
    'trips',
    'projects',
    'expeditions',
    'folders',
  ],
};

const routeVariants: Record<string, string[]> = {
  ru: [
    'дни',
    'маршруты',
    'отрезки',
    'этапы',
  ],
  en: [
    'parts',
    'days',
    'routes',
  ],
};

// noinspection NonAsciiCharacters
const wordings: Record<string, Record<string, Record<string, string>>> = {
  en: {
    'travels': {
      'Catalog': 'Travels',
      'Delete category': 'Delete the travel plan',
      'Export category': 'Export the travel',
      'Found categories: ': 'Found travels: ',
      'Modify category': 'Modify the travel plan',
      'New category': 'New travel plan',
      'Yes, delete the category': 'Yes, delete the travel plan',
    },
    'trips': {
      'Catalog': 'Trips',
      'Delete category': 'Delete the trip',
      'Export category': 'Export the trip',
      'Found categories: ': 'Found trips: ',
      'Modify category': 'Modify the trip',
      'New category': 'New trip',
      'Yes, delete the category': 'Yes, Delete the trip',
    },
    'projects': {
      'Catalog': 'Projects',
      'Delete category': 'Delete the project',
      'Export category': 'Export the project',
      'Modify category': 'Modify the project',
      'Found categories: ': 'Found projects: ',
      'New category': 'New project',
      'Yes, delete the category': 'Yes, Delete the project',
    },
    'expeditions': {
      'Catalog': 'Expeditions',
      'Delete category': 'Delete the expedition',
      'Export category': 'Export the expedition',
      'Found categories: ': 'Found expeditions: ',
      'Modify category': 'Modify the expedition',
      'New category': 'New expedition',
      'Yes, delete the category': 'Yes, Delete the expedition',
    },
    'folders': {
      'Catalog': 'Catalog',
      'Delete category': 'Delete the folder',
      'Export category': 'Export the folder',
      'Found categories: ': 'Found folders: ',
      'Modify category': 'Modify the folder',
      'New category': 'New folder',
      'Yes, delete the category': 'Yes, Delete the folder',
    },
    'travels_parts': {
      'Delete category warning': 'The travel plan and all the parts of it will be deleted, are you sure?',
    },
    'travels_days': {
      'Delete category warning': 'The travel plan with all the days inside it will be deleted, are you sure?',
    },
    'travels_routes': {
      'Delete category warning': 'The travel plan with all the routes in it will be deleted, are you sure?',
    },
    'trips_parts': {
      'Delete category warning': 'The trip and all the parts of it will be deleted, are you sure?',
    },
    'trips_days': {
      'Delete category warning': 'The trip with all the days inside it will be deleted, are you sure?',
    },
    'trips_routes': {
      'Delete category warning': 'The trip with all the routes in it will be deleted, are you sure?',
    },
    'projects_parts': {
      'Delete category warning': 'The project and all the parts of it will be deleted, are you sure?',
    },
    'projects_days': {
      'Delete category warning': 'The project with all the days inside it will be deleted, are you sure?',
    },
    'projects_routes': {
      'Delete category warning': 'The project with all the routes in it will be deleted, are you sure?',
    },
    'expeditions_parts': {
      'Delete category warning': 'The expedition and all the parts of it will be deleted, are you sure?',
    },
    'expeditions_days': {
      'Delete category warning': 'The expedition with all the days inside it will be deleted, are you sure?',
    },
    'expeditions_routes': {
      'Delete category warning': 'The expedition with all the routes in it will be deleted, are you sure?',
    },
    'folders_parts': {
      'Delete category warning': 'The folder and all the parts of it will be deleted, are you sure?',
    },
    'folders_days': {
      'Delete category warning': 'The folder with all the days inside it will be deleted, are you sure?',
    },
    'folders_routes': {
      'Delete category warning': 'The folder with all the routes in it will be deleted, are you sure?',
    },
    'parts': {
      'Delete route': 'Delete the part',
      'Delete route warning': 'The part and all the features of it will be deleted, are you sure?',
      'Export route': 'Export the part',
      'Modify route': 'Modifiy the part',
      'New route': 'New part',
      'Yes, delete the route': 'Yes, delete the part',
    },
    'days': {
      'Delete route': 'Delete the day',
      'Delete route warning': 'The day and all the features of it will be deleted, are you sure?',
      'Export route': 'Export the day',
      'Modify route': 'Modifiy the day',
      'New route': 'New day',
      'Yes, delete the route': 'Yes, delete the day',
    },
    'routes': {
      'Delete route': 'Delete the route',
      'Delete route warning': 'The route and all the features of it will be deleted, are you sure?',
      'Export route': 'Export the route',
      'Modify route': 'Modifiy the route',
      'New route': 'New route',
      'Yes, delete the route': 'Yes, delete the route',
    },
  },
  ru: {
    'путешествия': {
      'Catalog': 'Каталог',
      'Delete category': 'Удалить путешествие',
      'Export category': 'Экспорт текущего путешествия',
      'Found categories: ': 'Найдено путешествий: ',
      'Import the categories into the catalog': 'Импортировать путешествия в каталог',
      'Modify category': 'Изменить путешествие',
      'New category': 'Новое путешествие',
      'Yes, delete the category': 'Да, удалить это путешествие.',
    },
    'поездки': {
      'Catalog': 'Каталог',
      'Delete category': 'Удалить поездку',
      'Export category': 'Экспорт текущей поездки',
      'Found categories: ': 'Найдено поездок: ',
      'Import the categories into the catalog': 'Импортировать поездки в каталог',
      'Modify category': 'Изменить поездку',
      'New category': 'Новая поездка',
      'Yes, delete the category': 'Да, удалить эту поездку.',
    },
    'проекты': {
      'Catalog': 'Каталог',
      'Delete category': 'Удалить проект',
      'Export category': 'Экспорт текущего проекта',
      'Found categories: ': 'Найдено проектов: ',
      'Import the categories into the catalog': 'Импортировать проекты в каталог',
      'Modify category': 'Изменить проект',
      'New category': 'Новый проект',
      'Yes, delete the category': 'Да, удалить этот проект.',
    },
    'экспедиции': {
      'Catalog': 'Каталог',
      'Delete category': 'Удалить экспедицию',
      'Export category': 'Экспорт текущей экспедиции',
      'Found categories: ': 'Найдено экспедиций: ',
      'Import the categories into the catalog': 'Импортировать экспедиции в каталог',
      'Modify category': 'Изменить экспедицию',
      'New category': 'Новая экспедиция',
      'Yes, delete the category': 'Да, удалить эту экспедицию.',
    },
    'папки': {
      'Catalog': 'Каталог',
      'Delete category': 'Удалить папку',
      'Export category': 'Экспорт текущей папки',
      'Found categories: ': 'Найдено папок: ',
      'Import the categories into the catalog': 'Импортировать папки в каталог',
      'Modify category': 'Изменить папку',
      'New category': 'Новая папка',
      'Yes, delete the category': 'Да, удалить эту папку.',
    },
    'папки_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми ее днями?',
      'Import the route into the active category': 'Импортировать день в текущую папку',
      'Import all routes into the active category': 'Импортировать все дни в текущую папку',
    },
    'папки_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всем содержимым?',
      'Import the route into the active category': 'Импортировать отрезок в текущую папку',
      'Import all routes into the active category': 'Импортировать все отрезки в текущую папку',
    },
    'папки_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущую папку',
      'Import all routes into the active category': 'Импортировать все маршруты в текущую папку',
    },
    'папки_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми этапами внутри нее?',
      'Import the route into the active category': 'Импортировать этап в текущую папку',
      'Import all routes into the active category': 'Импортировать все этапы в текущую папку',
    },
    'поездки_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее днями?',
      'Import the route into the active category': 'Импортировать день в текущую поездку',
      'Import all routes into the active category': 'Импортировать все дни в текущую поездку',
    },
    'поездки_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущую поездку',
      'Import all routes into the active category': 'Импортировать все отрезки в текущую поездку',
    },
    'поездки_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущую поездку',
      'Import all routes into the active category': 'Импортировать все маршруты в текущую поездку',
    },
    'поездки_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее этапами?',
      'Import the route into the active category': 'Импортировать этап в текущую поездку',
      'Import all routes into the active category': 'Импортировать все этапы в текущую поездку',
    },
    'проекты_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его днями?',
      'Import the route into the active category': 'Импортировать день в текущий проект',
      'Import all routes into the active category': 'Импортировать все дни в текущий проект',
    },
    'проекты_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущий проект',
      'Import all routes into the active category': 'Импортировать все отрезки в текущий проект',
    },
    'проекты_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущий проект',
      'Import all routes into the active category': 'Импортировать все маршруты в текущий проект',
    },
    'проекты_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его этапами?',
      'Import the route into the active category': 'Импортировать этап в текущий проект',
      'Import all routes into the active category': 'Импортировать все этапы в текущий проект',
    },
    'путешествия_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его днями?',
      'Import the route into the active category': 'Импортировать день в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все дни в текущее путешествие',
    },
    'путешествия_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все отрезки в текущее путешествие',
    },
    'путешествия_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все маршруты в текущее путешествие',
    },
    'путешествия_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его этапами?',
      'Import the route into the active category': 'Импортировать этап в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все этапы в текущее путешествие',
    },
    'экспедиции_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее днями?',
      'Import the route into the active category': 'Импортировать день в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все дни в текущую экспедицию',
    },
    'экспедиции_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все отрезки в текущую экспедицию',
    },
    'экспедиции_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все маршруты в текущую экспедицию',
    },
    'экспедиции_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее этапами?',
      'Import the route into the active category': 'Импортировать этап в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все этапы в текущую экспедицию',
    },
    'дни': {
      'Delete route': 'Удалить день',
      'Delete route warning': 'Вы уверены, что хотить удалить день и все его элементы?',
      'Export route': 'Экспорт текущего дня',
      'Found routes: ': 'Найдено дней: ',
      'Import all features into the active route': 'Импортировать все метки в один день',
      'Modify route': 'Изменить день',
      'New route': 'Новый день',
      'Yes, delete the route': 'Да, удалить этот день.',
    },
    'отрезки': {
      'Delete route': 'Удалить отрезок',
      'Delete route warning': 'Вы уверены, что хотить удалить отрезок и все его элементы?',
      'Export route': 'Экспорт текущего отрезка',
      'Found routes: ': 'Найдено отрезков: ',
      'Import all features into the active route': 'Импортировать все метки в один отрезок',
      'Modify route': 'Изменить отрезок',
      'New route': 'Новый отрезок',
      'Yes, delete the route': 'Да, удалить этот отрезок.',
    },
    'маршруты': {
      'Delete route': 'Удалить маршрут',
      'Delete route warning': 'Вы уверены, что хотить удалить маршрут и все его элементы?',
      'Export route': 'Экспорт текущего маршрута',
      'Found routes: ': 'Найдено маршрутов: ',
      'Import all features into the active route': 'Импортировать все метки в один маршрут',
      'Modify route': 'Изменить маршрут',
      'New route': 'Новый маршрут',
      'Yes, delete the route': 'Да, удалить этот маршрут.',
    },
    'этапы': {
      'Delete route': 'Удалить этап',
      'Delete route warning': 'Вы уверены, что хотить удалить этап и все его элементы?',
      'Export route': 'Экспорт текущего этапа',
      'Import all features into the active route': 'Импортировать все метки в один этап',
      'Found routes: ': 'Найдено этапов: ',
      'Modify route': 'Изменить этап',
      'New route': 'Новый этап',
      'Yes, delete the route': 'Да, удалить этот этап.',
    },
  },
};

export const wordingFactory = (storage: KV): Wording => {
  const r: Wording = {
    get isPersonalized(): boolean {
      return this.currentCategoryVariant && this.currentRouteVariant;
    },
    observableIsPersonalized(): Observable<boolean> {
      return merge(this.observableCurrentCategoryVariant(), this.observableCurrentRouteVariant())
        .pipe(map(() => this.isPersonalized));
    },
    get categoryVariants(): string[] {
      return categoryVariants[currentLocale()] || categoryVariants.en;
    },
    get routeVariants(): string[] {
      return routeVariants[currentLocale()] || routeVariants.en;
    },
    get currentCategoryVariant(): string | null {
      return storage.get('curcat', null) || null;
    },
    set currentCategoryVariant(variant: string | null) {
      storage.set('curcat', variant);
    },
    get currentRouteVariant(): string | null {
      return storage.get('curroute', null) || null;
    },
    set currentRouteVariant(variant: string | null) {
      storage.set('curroute', variant);
    },
    observableCurrentCategoryVariant: (): Observable<string> => storage.observable<string | null>('curcat'),
    observableCurrentRouteVariant: (): Observable<string> => storage.observable<string | null>('curroute'),
    C: (key) => {
      const localized = wordings[currentLocale()] || wordings.en;
      if (localized) {
        const variant = localized[r.currentCategoryVariant];
        if (variant) {
          const t = variant[key];
          if (t) {
            return t;
          }
        }
      }
      return `${key}`;
    },
    R: (key) => {
      const localized = wordings[currentLocale()] || wordings.en;
      if (localized) {
        const variant = localized[r.currentRouteVariant];
        if (variant) {
          const t = variant[key];
          if (t) {
            return t;
          }
        }
      }
      return `${key}`;
    },
    CR: (key) => {
      const localized = wordings[currentLocale()] || wordings.en;
      if (localized) {
        const variant = localized[`${r.currentCategoryVariant}_${r.currentRouteVariant}`];
        if (variant) {
          const t = variant[key];
          if (t) {
            return t;
          }
        }
      }
      return `${key}`;
    },
  };
  return r;
};
