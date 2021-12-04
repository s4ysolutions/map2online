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

const reorder = <T>(items: T[], src: number, dst: number): T[] =>
  src > dst
    ? items
      .slice(0, dst)
      .concat(items[src])
      .concat(items.slice(dst, src))
      .concat(items.slice(src + 1))
    : dst > src
      ? items
        .slice(0, src)
        .concat(items.slice(src + 1, dst + 1))
        .concat(items[src])
        .concat(items.slice(dst + 1))
      : items.slice();

export default reorder;
