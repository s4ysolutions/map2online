/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {CacheKey, CacheObject, SearchCache} from './index';

class MemSearchCache implements SearchCache {
  private mem: Record<CacheKey, CacheObject> = {};

  add(key: CacheKey, object: CacheObject): void {
    this.mem[key] = object;
  }

  has(key: CacheKey): boolean {
    return Boolean(this.mem[key]);
  }

  get(key: CacheKey): CacheObject | null {
    return this.mem[key] || null;
  }
}

export default MemSearchCache;
