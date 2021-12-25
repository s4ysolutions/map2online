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

import './styles.scss';
import * as React from 'react';
import Modal from '../Modal';
import T from '../../../l10n';
import {getWorkspace} from '../../../di-default';
import {FormEvent} from 'react';

const workspace = getWorkspace();

const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  // noinspection JSIgnoredPromiseFromCall
  workspace.toggleAbout();
  return null;
};

const About: React.FunctionComponent = () => <Modal className="about" onClose={() => 0} >
  <form onSubmit={handleSubmit} >
    <h2 >
      {T`About`}
    </h2 >

    <p >
      {T`About service`}
    </p >

    <p >
      {T`About beta`}
    </p >

    <h3 >
      {T`Credentials`}
    </h3 >

    <p >
      {T`About Red Off-road`}

      {' '}

      <a href="https://red-offroad.ru" target="_redoffroad" >
        Red off-road expedition.
      </a >
    </p >

    <p >
      {T`About Tulupov`}

      {' '}

      <a href="https://www.facebook.com/aleksey.tulupov" target="_tulupov" >
        Алексей Тулупов.
      </a >
    </p >

    <p >
      {T`About Nevinski`}

      {' '}

      <a href="https://www.facebook.com/kirillnev" target="_nevinsky" >
        Кирилл Невинский.
      </a >
    </p >

    <br />

    <p >
      <a href="mailto:sergey@s4y.solutions?subject=map2online%20-%20feedback" >
        {T`Feedback`}
      </a >
    </p >

    <div className="buttons-row" >
      <button onClick={workspace.toggleAbout} type="button" >
        {T`Close`}
      </button >
    </div >

    <hr />

    <h4 >
      &copy;S4Y.Solutions, 2020&nbsp;v1.2.0
    </h4 >
  </form >
</Modal >;

export default About;
