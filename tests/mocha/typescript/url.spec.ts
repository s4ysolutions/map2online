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

import {expect} from 'chai';

describe('URL type', () => {
  it('constructor http://', () => {
    const url = new URL('https://example.com');
    expect(url.protocol).to.be.eq('https:');
    expect(url.hostname).to.be.eq('example.com');
  });
  it('constructor data schema url', () => {
    const data = `data:image/svg+xml;utf8,<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
 <path d="m254.35 340.25v171.75h22.549v-171.75c83.743-5.811 149.92-75.408 149.92-160.64 0-89.027-72.172-161.19-161.19-161.19-89.029 0-161.2 72.172-161.2 161.19 0 85.221 66.182 154.83 149.93 160.64zm11.275-275.66c63.434 0 115.03 51.607 115.03 115.02h-22.548c0-50.989-41.487-92.476-92.489-92.476z" opacity=".3" stroke-width="2.302"/>
 <path d="m235.93 321.83v171.75h22.549v-171.75c83.743-5.811 149.92-75.408 149.92-160.64 0-89.027-72.172-161.19-161.19-161.19-89.029 0-161.2 72.172-161.2 161.19 0 85.221 66.182 154.83 149.93 160.64zm11.275-275.66c63.434 0 115.03 51.607 115.03 115.02h-22.548c0-50.989-41.487-92.476-92.489-92.476z" fill="red" stroke-width="2.302"/>
</svg>`;
    const url = new URL(data);
    expect(url.protocol).to.be.eq('data:');
    const formatted = url.toString();
    const url2 = new URL(data);
    expect(url2.protocol).to.be.eq('data:');
    expect(url2.toString()).to.be.eq(formatted);
    const url3 = new URL(url2.toString());
    expect(url3.href).to.be.eq(url2.href);
  });
});
