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

module.exports = config => {
  console.log('== CONFIG ==========================');
  console.log(config);
  console.log('== CONFIG.PLUGINS ==================');
  console.log(config.plugins);
  console.log('== CONFIG.RULES ====================');
  if (config.module) {
    if (config.module.rules) {
      for (let i = 0; i < config.module.rules.length; i++) {
        console.log(`== TEST: ${config.module.rules[i].test}`);
        console.log(config.module.rules[i]);
        for (let j = 0; j < config.module.rules[i].use.length; j++) {
          console.log('... options ...');
          console.log(config.module.rules[i].use[j].options);
          if (config.module.rules[i].use[j].options && config.module.rules[i].use[j].options.presets) {
            console.log(config.module.rules[i].use[j].options.presets[0]);
          }
        }
      }
    }
  }
};
