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
import {KV} from '../../kv/sync';
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
      'Activate category hint': 'Plan this travel',
      'Catalog': 'Travels',
      'Delete category': 'Delete the travel plan',
      'Delete category hint': 'Delete the travel plan',
      'Export category': 'Export the travel',
      'Found categories: ': 'Found travels: ',
      'Modify category': 'Modify the travel plan',
      'Modify category hint': 'Modify the travel plan',
      'New category': 'New travel plan',
      'Visibility on category hint': 'Show features of the travel on the map',
      'Visibility off category hint': 'Hide features of the travel from the map',
      'Yes, delete the category': 'Yes, delete the travel plan',
    },
    'trips': {
      'Activate category hint': 'Plan this trip',
      'Catalog': 'Trips',
      'Delete category': 'Delete the trip',
      'Delete category hint': 'Delete the trip',
      'Export category': 'Export the trip',
      'Found categories: ': 'Found trips: ',
      'Modify category': 'Modify the trip',
      'Modify category hint': 'Modify the trip',
      'New category': 'New trip',
      'Visibility on category hint': 'Show features of the trip on the map',
      'Visibility off category hint': 'Hide features of the trip from the map',
      'Yes, delete the category': 'Yes, Delete the trip',
    },
    'projects': {
      'Activate category hint': 'Plan this project',
      'Catalog': 'Projects',
      'Delete category': 'Delete the project',
      'Delete category hint': 'Delete the project',
      'Export category': 'Export the project',
      'Modify category': 'Modify the project',
      'Modify category hint': 'Modify the project',
      'Found categories: ': 'Found projects: ',
      'New category': 'New project',
      'Visibility on category hint': 'Show features of the project on the map',
      'Visibility off category hint': 'Hide features of the project from the map',
      'Yes, delete the category': 'Yes, Delete the project',
    },
    'expeditions': {
      'Activate category hint': 'Plan this expedition',
      'Catalog': 'Expeditions',
      'Delete category': 'Delete the expedition',
      'Delete category hint': 'Delete the expedition',
      'Export category': 'Export the expedition',
      'Found categories: ': 'Found expeditions: ',
      'Modify category': 'Modify the expedition',
      'Modify category hint': 'Modify the expedition',
      'New category': 'New expedition',
      'Visibility on category hint': 'Show features of the expedition on the map',
      'Visibility off category hint': 'Hide features of the expedition from the map',
      'Yes, delete the category': 'Yes, Delete the expedition',
    },
    'folders': {
      'Activate category hint': 'Use this folder for planning',
      'Catalog': 'Catalog',
      'Delete category': 'Delete the folder',
      'Delete category hint': 'Delete the folder',
      'Export category': 'Export the folder',
      'Found categories: ': 'Found folders: ',
      'Modify category': 'Modify the folder',
      'Modify category hint': 'Modify the folder',
      'New category': 'New folder',
      'Visibility on category hint': 'Show features of the folder on the map',
      'Visibility off category hint': 'Hide features of the folder from the map',
      'Yes, delete the category': 'Yes, Delete the folder',
    },
    'travels_parts': {
      'Delete category warning': 'The travel plan and all the parts of it will be deleted, are you sure?',
      'Open category hint': 'Show parts of the travel',
    },
    'travels_days': {
      'Delete category warning': 'The travel plan with all the days inside it will be deleted, are you sure?',
      'Open category hint': 'Show days of the travel',
    },
    'travels_routes': {
      'Delete category warning': 'The travel plan with all the routes in it will be deleted, are you sure?',
      'Open category hint': 'Show routes of the travel',
    },
    'trips_parts': {
      'Delete category warning': 'The trip and all the parts of it will be deleted, are you sure?',
      'Open category hint': 'Show parts of the trip',
    },
    'trips_days': {
      'Delete category warning': 'The trip with all the days inside it will be deleted, are you sure?',
      'Open category hint': 'Show days of the trip',
    },
    'trips_routes': {
      'Delete category warning': 'The trip with all the routes in it will be deleted, are you sure?',
      'Open category hint': 'Show routes of the trip',
    },
    'projects_parts': {
      'Delete category warning': 'The project and all the parts of it will be deleted, are you sure?',
      'Open category hint': 'Show parts of the project',
    },
    'projects_days': {
      'Delete category warning': 'The project with all the days inside it will be deleted, are you sure?',
      'Open category hint': 'Show days of the project',
    },
    'projects_routes': {
      'Delete category warning': 'The project with all the routes in it will be deleted, are you sure?',
      'Open category hint': 'Show routes of the project',
    },
    'expeditions_parts': {
      'Delete category warning': 'The expedition and all the parts of it will be deleted, are you sure?',
      'Open category hint': 'Show parts of the expedition',
    },
    'expeditions_days': {
      'Delete category warning': 'The expedition with all the days inside it will be deleted, are you sure?',
      'Open category hint': 'Show days of the expedition',
    },
    'expeditions_routes': {
      'Delete category warning': 'The expedition with all the routes in it will be deleted, are you sure?',
      'Open category hint': 'Show routes of the expedition',
    },
    'folders_parts': {
      'Delete category warning': 'The folder and all the parts of it will be deleted, are you sure?',
      'Open category hint': 'Show parts of the folder',
    },
    'folders_days': {
      'Delete category warning': 'The folder with all the days inside it will be deleted, are you sure?',
      'Open category hint': 'Show days of the folder',
    },
    'folders_routes': {
      'Delete category warning': 'The folder with all the routes in it will be deleted, are you sure?',
      'Open category hint': 'Show routes of the folder',
    },
    'parts': {
      'Activate route hint': 'Plan this part',
      'Delete route': 'Delete the part',
      'Delete route hint': 'Delete the part',
      'Delete route warning': 'The part and all the features of it will be deleted, are you sure?',
      'Export route': 'Export the part',
      'Modify route': 'Modify the part',
      'Modify route hint': 'Modify the part',
      'New route': 'New part',
      'Open route hint': 'Show features of the route',
      'Visibility on route hint': 'Show features of the part on the map',
      'Visibility off route hint': 'Hide features of the part from the map',
      'Yes, delete the route': 'Yes, delete the part',
    },
    'days': {
      'Activate route hint': 'Plan this day',
      'Delete route': 'Delete the day',
      'Delete route hint': 'Delete the day',
      'Delete route warning': 'The day and all the features of it will be deleted, are you sure?',
      'Export route': 'Export the day',
      'Modify route': 'Modify the day',
      'Modify route hint': 'Modify the day',
      'New route': 'New day',
      'Open route hint': 'Show features of the day',
      'Visibility on route hint': 'Show features of the day on the map',
      'Visibility off route hint': 'Hide features of the day from the map',
      'Yes, delete the route': 'Yes, delete the day',
    },
    'routes': {
      'Activate route hint': 'Plan this route',
      'Delete route': 'Delete the route',
      'Delete route hint': 'Delete the route',
      'Delete route warning': 'The route and all the features of it will be deleted, are you sure?',
      'Export route': 'Export the route',
      'Modify route': 'Modify the route',
      'Modify route hint': 'Modify the route',
      'New route': 'New route',
      'Open route hint': 'Show features of the route',
      'Visibility on route hint': 'Show features of the route on the map',
      'Visibility off route hint': 'Hide features of the route from the map',
      'Yes, delete the route': 'Yes, delete the route',
    },
  },
  ru: {
    'путешествия': {
      'Activate category hint': 'Планировать это путешествие',
      'Catalog': 'Каталог',
      'Delete category': 'Удалить путешествие',
      'Delete category hint': 'Удалить путешествие',
      'Export category': 'Экспорт текущего путешествия',
      'Found categories: ': 'Найдено путешествий: ',
      'Import the categories into the catalog': 'Импортировать путешествия в каталог',
      'Modify category': 'Изменить путешествие',
      'Modify category hint': 'Изменить путешествие',
      'New category': 'Новое путешествие',
      'Visibility on category hint': 'Показать путешествие на карте',
      'Visibility off category hint': 'Не показвать путешествие на карте',
      'Yes, delete the category': 'Да, удалить это путешествие.',
    },
    'поездки': {
      'Activate category hint': 'Планировать этy поездку',
      'Catalog': 'Каталог',
      'Delete category': 'Удалить поездку',
      'Delete category hint': 'Удалить поездку',
      'Export category': 'Экспорт текущей поездки',
      'Found categories: ': 'Найдено поездок: ',
      'Import the categories into the catalog': 'Импортировать поездки в каталог',
      'Modify category': 'Изменить поездку',
      'Modify category hint': 'Изменить поездку',
      'New category': 'новая поездка',
      'Visibility on category hint': 'Показать поездку на карте',
      'Visibility off category hint': 'Не показвать поездку на карте',
      'Yes, delete the category': 'Да, удалить эту поездку.',
    },
    'проекты': {
      'Activate category hint': 'Планировать этот проект',
      'Catalog': 'Каталог',
      'Delete category': 'Удалить проект',
      'Delete category hint': 'Удалить проект',
      'Export category': 'Экспорт текущего проекта',
      'Found categories: ': 'Найдено проектов: ',
      'Import the categories into the catalog': 'Импортировать проекты в каталог',
      'Modify category': 'Изменить проект',
      'Modify category hint': 'Изменить проект',
      'New category': 'Новый проект',
      'Visibility on category hint': 'Показать проект на карте',
      'Visibility off category hint': 'Не показвать проект на карте',
      'Yes, delete the category': 'Да, удалить этот проект.',
    },
    'экспедиции': {
      'Activate category hint': 'Планировать эту экспедицию',
      'Catalog': 'Каталог',
      'Delete category': 'Удалить экспедицию',
      'Delete category hint': 'Удалить экспедицию',
      'Export category': 'Экспорт текущей экспедиции',
      'Found categories: ': 'Найдено экспедиций: ',
      'Import the categories into the catalog': 'Импортировать экспедиции в каталог',
      'Modify category': 'Изменить экспедицию',
      'Modify category hint': 'Изменить экспедицию',
      'New category': 'Новая экспедиция',
      'Visibility on category hint': 'Показать экспедицию на карте',
      'Visibility off category hint': 'Не показвать экспедицию на карте',
      'Yes, delete the category': 'Да, удалить эту экспедицию.',
    },
    'папки': {
      'Activate category hint': 'Добавлять новые элементы в эту папку',
      'Catalog': 'Каталог',
      'Delete category': 'Удалить папку',
      'Delete category hint': 'Удалить папку',
      'Export category': 'Экспорт текущей папки',
      'Found categories: ': 'Найдено папок: ',
      'Import the categories into the catalog': 'Импортировать папки в каталог',
      'Modify category': 'Изменить папку',
      'Modify category hint': 'Изменить папку',
      'New category': 'Новая папка',
      'Visibility on category hint': 'Показать содержимое папки на карте',
      'Visibility off category hint': 'Не показвать содержимое папки на карте',
      'Yes, delete the category': 'Да, удалить эту папку.',
    },
    'папки_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми ее днями?',
      'Import the route into the active category': 'Импортировать день в текущую папку',
      'Import all routes into the active category': 'Импортировать все дни в текущую папку',
      'Open category hint': 'Показать дни из папки',
    },
    'папки_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всем содержимым?',
      'Import the route into the active category': 'Импортировать отрезок в текущую папку',
      'Import all routes into the active category': 'Импортировать все отрезки в текущую папку',
      'Open category hint': 'Показать отрезки из папки',
    },
    'папки_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущую папку',
      'Import all routes into the active category': 'Импортировать все маршруты в текущую папку',
      'Open category hint': 'Показать маршруты из папки',
    },
    'папки_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми этапами внутри нее?',
      'Import the route into the active category': 'Импортировать этап в текущую папку',
      'Import all routes into the active category': 'Импортировать все этапы в текущую папку',
      'Open category hint': 'Показать этапы из папки',
    },
    'поездки_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее днями?',
      'Import the route into the active category': 'Импортировать день в текущую поездку',
      'Import all routes into the active category': 'Импортировать все дни в текущую поездку',
      'Open category hint': 'Показать дни поездки',
    },
    'поездки_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущую поездку',
      'Import all routes into the active category': 'Импортировать все отрезки в текущую поездку',
      'Open category hint': 'Показать отрезки этой поездки',
    },
    'поездки_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущую поездку',
      'Import all routes into the active category': 'Импортировать все маршруты в текущую поездку',
      'Open category hint': 'Показать маршруты поездки',
    },
    'поездки_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее этапами?',
      'Import the route into the active category': 'Импортировать этап в текущую поездку',
      'Import all routes into the active category': 'Импортировать все этапы в текущую поездку',
      'Open category hint': 'Показать этапы поездки',
    },
    'проекты_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его днями?',
      'Import the route into the active category': 'Импортировать день в текущий проект',
      'Import all routes into the active category': 'Импортировать все дни в текущий проект',
      'Open category hint': 'Показать дни поездки',
    },
    'проекты_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущий проект',
      'Import all routes into the active category': 'Импортировать все отрезки в текущий проект',
      'Open category hint': 'Показать отрезки проекта',
    },
    'проекты_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущий проект',
      'Import all routes into the active category': 'Импортировать все маршруты в текущий проект',
      'Open category hint': 'Показать маршруты проекта',
    },
    'проекты_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его этапами?',
      'Import the route into the active category': 'Импортировать этап в текущий проект',
      'Import all routes into the active category': 'Импортировать все этапы в текущий проект',
      'Open category hint': 'Показать этапы проекта',
    },
    'путешествия_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его днями?',
      'Import the route into the active category': 'Импортировать день в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все дни в текущее путешествие',
      'Open category hint': 'Показать дни путешествия',
    },
    'путешествия_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все отрезки в текущее путешествие',
      'Open category hint': 'Показать отрезки путешествия',
    },
    'путешествия_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все маршруты в текущее путешествие',
      'Open category hint': 'Показать маршруты путешествия',
    },
    'путешествия_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его этапами?',
      'Import the route into the active category': 'Импортировать этап в текущее путешествие',
      'Import all routes into the active category': 'Импортировать все этапы в текущее путешествие',
      'Open category hint': 'Показать этапы путешествия',
    },
    'экспедиции_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее днями?',
      'Import the route into the active category': 'Импортировать день в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все дни в текущую экспедицию',
      'Open category hint': 'Показать дни экспедиции',
    },
    'экспедиции_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее отрезками?',
      'Import the route into the active category': 'Импортировать отрезок в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все отрезки в текущую экспедицию',
      'Open category hint': 'Показать отрезки экспедиции',
    },
    'экспедиции_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее маршрутами?',
      'Import the route into the active category': 'Импортировать маршрут в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все маршруты в текущую экспедицию',
      'Open category hint': 'Показать маршруты экспедиции',
    },
    'экспедиции_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее этапами?',
      'Import the route into the active category': 'Импортировать этап в текущую экспедицию',
      'Import all routes into the active category': 'Импортировать все этапы в текущую экспедицию',
      'Open category hint': 'Показать этапы экспедиции',
    },
    'дни': {
      'Activate route hint': 'Планировать этот день',
      'Delete route': 'Удалить день',
      'Delete route hint': 'Удалить день',
      'Delete route warning': 'Вы уверены, что хотить удалить день и все его элементы?',
      'Export route': 'Экспорт текущего дня',
      'Found routes: ': 'Найдено дней: ',
      'Import all features into the active route': 'Импортировать все метки в текущий день',
      'Modify route': 'Изменить день',
      'Modify route hint': 'Изменить день',
      'New route': 'Новый день',
      'Open route hint': 'Показать план на день',
      'Visibility on route hint': 'Отображать план дня на карте',
      'Visibility off route hint': 'Не отображать план дня на карте',
      'Yes, delete the route': 'Да, удалить этот день.',
    },
    'отрезки': {
      'Activate route hint': 'Планировать этот отрезок',
      'Delete route': 'Удалить отрезок',
      'Delete route hint': 'Удалить отрезок',
      'Delete route warning': 'Вы уверены, что хотить удалить отрезок и все его элементы?',
      'Export route': 'Экспорт текущего отрезка',
      'Found routes: ': 'Найдено отрезков: ',
      'Import all features into the active route': 'Импортировать все метки в текущий отрезок',
      'Modify route': 'Изменить отрезок',
      'Modify route hint': 'Изменить отрезок',
      'New route': 'Новый отрезок',
      'Open route hint': 'Показать точки отрезка',
      'Visibility on route hint': 'Отображать отрезок на карте',
      'Visibility off route hint': 'Не отображать отрезок на карте',
      'Yes, delete the route': 'Да, удалить этот отрезок.',
    },
    'маршруты': {
      'Activate route hint': 'Планировать этот маршрут',
      'Delete route': 'Удалить маршрут',
      'Delete route hint': 'Удалить маршрут',
      'Delete route warning': 'Вы уверены, что хотить удалить маршрут и все его элементы?',
      'Export route': 'Экспорт текущего маршрута',
      'Found routes: ': 'Найдено маршрутов: ',
      'Import all features into the active route': 'Импортировать все метки в текущий маршрут',
      'Modify route': 'Изменить маршрут',
      'Modify route hint': 'Изменить маршрут',
      'New route': 'Новый маршрут',
      'Open route hint': 'Показать план маршрута',
      'Visibility on route hint': 'Отображать план маршрута на карте',
      'Visibility off route hint': 'Не отображать план маршрута на карте',
      'Yes, delete the route': 'Да, удалить этот маршрут.',
    },
    'этапы': {
      'Activate route hint': 'Планировать этот этап',
      'Delete route': 'Удалить этап',
      'Delete route hint': 'Удалить этап',
      'Delete route warning': 'Вы уверены, что хотить удалить этап и все его элементы?',
      'Export route': 'Экспорт текущего этапа',
      'Import all features into the active route': 'Импортировать все метки в текущий этап',
      'Found routes: ': 'Найдено этапов: ',
      'Modify route': 'Изменить этап',
      'Modify route hint': 'Изменить этап',
      'New route': 'Новый этап',
      'Open route hint': 'Показать план этапа',
      'Visibility on route hint': 'Отображать план этапа на карте',
      'Visibility off route hint': 'Не отображать план этапа на карте',
      'Yes, delete the route': 'Да, удалить этот этап.',
    },
  },
};

export const wordingFactory = (storage: KV): Wording => {
  const r: Wording = {
    get isPersonalized(): boolean {
      return Boolean(this.currentCategoryVariant) && Boolean(this.currentRouteVariant);
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
    observableCurrentCategoryVariant: (): Observable<string | null> => merge(
      storage.observable<string>('curcat'),
      storage.observableDelete<string>('curcat').pipe(map(() => null)),
    ),
    observableCurrentRouteVariant: (): Observable<string | null> => merge(
      storage.observable<string | null>('curroute'),
      storage.observableDelete<string>('curroute').pipe(map(() => null)),
    ),
    C: (key) => {
      const localized = wordings[currentLocale()] || wordings.en;
      const currentCategoryVariant = r.currentCategoryVariant;
      if (localized && currentCategoryVariant !== null) {
        const variant = localized[currentCategoryVariant];
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
      const currentRouteVariant = r.currentRouteVariant;
      if (localized && currentRouteVariant !== null) {
        const variant = localized[currentRouteVariant];
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
