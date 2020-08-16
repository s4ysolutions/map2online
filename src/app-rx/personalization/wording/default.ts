import {Wording} from './index';
import {currentLocale} from '../../../l10n';
import {KV} from '../../../kv-rx';
import {merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

const categoryVariands = {
  ru: [
    'путешествия',
    'поездки',
    'проекты',
    'экспедиции',
    'папки с маршрутами',
  ],
  en: [
    'travels',
    'trips',
    'projects',
    'expeditions',
    'folders',
  ],
}

const routeVarians = {
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
}

// noinspection NonAsciiCharacters
const wordings = {
  en: {
    'travels': {
      'Catalog': 'Travels',
      'Delete category': 'Delete the travel plan',
      'Modify category': 'Modify the travel plan',
      'New category': 'New travel plan',
      'Yes, delete the category': 'Yes, delete the travel plan',
    },
    'trips': {
      'Catalog': 'Trips',
      'Delete category': 'Delete the trip',
      'Modify category': 'Modify the trip',
      'New category': 'New trip',
      'Yes, delete the category': 'Yes, Delete the trip',
    },
    'projects': {
      'Catalog': 'Projects',
      'Delete category': 'Delete the project',
      'Modify category': 'Modify the project',
      'New category': 'New project',
      'Yes, delete the category': 'Yes, Delete the project',
    },
    'expeditions': {
      'Catalog': 'Expeditions',
      'Delete category': 'Delete the expedition',
      'Modify category': 'Modify the expedition',
      'New category': 'New expedition',
      'Yes, delete the category': 'Yes, Delete the expedition',
    },
    'folders': {
      'Catalog': 'Catalog',
      'Delete category': 'Delete the folder',
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
      'Modify route': 'Modifiy the part',
      'New route': 'New part',
      'Yes, delete the route': 'Yes, delete the part',
    },
    'days': {
      'Delete route': 'Delete the day',
      'Delete route warning': 'The day and all the features of it will be deleted, are you sure?',
      'Modify route': 'Modifiy the day',
      'New route': 'New day',
      'Yes, delete the route': 'Yes, delete the day',
    },
    'routes': {
      'Delete route': 'Delete the route',
      'Delete route warning': 'The route and all the features of it will be deleted, are you sure?',
      'Modify route': 'Modifiy the route',
      'New route': 'New route',
      'Yes, delete the route': 'Yes, delete the route',
    },
  },
  ru: {
    'путешествия': {
      'Catalog': 'Путешествия',
      'Delete category': 'Удалить путешествие',
      'Modify category': 'Изменить путешествие',
      'New category': 'Новое путешествие',
      'Yes, delete the category': 'Да, удалить это путешествие.',
    },
    'поездки': {
      'Catalog': 'Пoездки',
      'Delete category': 'Удалить поездку',
      'Modify category': 'Изменить поездку',
      'New category': 'Новая поездка',
      'Yes, delete the category': 'Да, удалить эту поездку.',
    },
    'проекты': {
      'Catalog': 'Проекты',
      'Delete category': 'Удалить проект',
      'Modify category': 'Изменить проект',
      'New category': 'Новый проект',
      'Yes, delete the category': 'Да, удалить этот проект.',
    },
    'экспедиции': {
      'Catalog': 'Экспедиции',
      'Delete category': 'Удалить экспедицию',
      'Modify category': 'Изменить экспедицию',
      'New category': 'Новая экспедиция',
      'Yes, delete the category': 'Да, удалить эту экспедицию.',
    },
    'папки': {
      'Catalog': 'Каталог',
      'Delete category': 'Удалить папку',
      'Modify category': 'Изменить папку',
      'New category': 'Новая папка',
      'Yes, delete the category': 'Да, удалить эту папку.',
    },
    'папки_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми ее днями?',
    },
    'папки_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всем содержимым?',
    },
    'папки_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми маршрутами?',
    },
    'папки_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить папку со всеми этапами внутри нее?',
    },
    'поездки_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее днями?',
    },
    'поездки_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее отрезками?',
    },
    'поездки_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее маршрутами?',
    },
    'поездки_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить поездку со всеми ее этапами?',
    },
    'проекты_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его днями?',
    },
    'проекты_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его отрезками?',
    },
    'проекты_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его маршрутами?',
    },
    'проекты_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить проект со всеми его этапами?',
    },
    'путешествия_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его днями?',
    },
    'путешествия_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его отрезками?',
    },
    'путешествия_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его маршрутами?',
    },
    'путешествия_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить путешествие со всеми его этапами?',
    },
    'экспедиции_дни': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее днями?',
    },
    'экспедиции_отрезки': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее отрезками?',
    },
    'экспедиции_маршруты': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее маршрутами?',
    },
    'экспедиции_этапы': {
      'Delete category warning': 'Вы уверены, что хотите удалить экспедицию со всеми ее этапами?',
    },
    'дни': {
      'Delete route': 'Удалить день',
      'Delete route warning': 'Вы уверены, что хотить удалить день и все его элементы?',
      'Modify route': 'Изменить день',
      'New route': 'Новый день',
      'Yes, delete the route': 'Да, удалить этот день.',
    },
    'отрезки': {
      'Delete route': 'Удалить отрезок',
      'Delete route warning': 'Вы уверены, что хотить удалить отрезок и все его элементы?',
      'Modify route': 'Изменить отрезок',
      'New route': 'Новый отрезок',
      'Yes, delete the route': 'Да, удалить этот отрезок.',
    },
    'маршруты': {
      'Delete route': 'Удалить маршрут',
      'Delete route warning': 'Вы уверены, что хотить удалить маршрут и все его элементы?',
      'Modify route': 'Изменить маршрут',
      'New route': 'Новый маршрут',
      'Yes, delete the route': 'Да, удалить этот маршрут.',
    },
    'этапы': {
      'Delete route': 'Удалить этап',
      'Delete route warning': 'Вы уверены, что хотить удалить этап и все его элементы?',
      'Modify route': 'Изменить этап',
      'New route': 'Новый этап',
      'Yes, delete the route': 'Да, удалить этот этап.',
    },
  }
}

export const wordingFactory = (storage: KV): Wording => {
  const r: Wording = {
    get isPersonalized(): boolean {
      return this.currentCategoryVariant && this.currentRouteVariant
    },
    observableIsPersonalized(): Observable<boolean> {
      const th = this
      return merge(this.observableCurrentCategoryVariant(), this.observableCurrentRouteVariant())
        .pipe(
          map(() => th.isPersonalized)
        )
    },
    get categoryVariants(): string[] {
      return categoryVariands[currentLocale()] || categoryVariands['en'];
    },
    get routeVariants(): string[] {
      return routeVarians[currentLocale()] || routeVarians['en'];
    },
    get currentCategoryVariant(): string | null {
      return storage.get('curcat', null) || null
    },
    get currentRouteVariant(): string | null {
      return storage.get('curroute', null) || null
    },
    set currentCategoryVariant(variant: string | null) {
      storage.set('curcat', variant)
    },
    set currentRouteVariant(variant: string | null) {
      storage.set('curroute', variant)
    },
    observableCurrentCategoryVariant: (): Observable<string> => storage.observable<string | null>("curcat"),
    observableCurrentRouteVariant: (): Observable<string> => storage.observable<string | null>("curroute"),
    C: (key) => {
      const localized = wordings[currentLocale()] || wordings['en']
      if (localized) {
        const variant = localized[r.currentCategoryVariant]
        if (variant) {
          const t = variant[key]
          if (t)
            return t
        }
      }
      return `l10n: ${key}`;
    },
    R: (key) => {
      const localized = wordings[currentLocale()] || wordings['en']
      if (localized) {
        const variant = localized[r.currentRouteVariant]
        if (variant) {
          const t = variant[key]
          if (t)
            return t
        }
      }
      return `l10n: ${key}`;
    },
    CR: (key) => {
      const localized = wordings[currentLocale()] || wordings['en']
      if (localized) {
        const variant = localized[`${r.currentCategoryVariant}_${r.currentRouteVariant}`]
        if (variant) {
          const t = variant[key]
          if (t)
            return t
        }
      }
      return `l10n: ${key}`;
    },
  }
  return r;
}