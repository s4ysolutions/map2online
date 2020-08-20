import './styles.scss';
import * as React from 'react';
import Modal from '../Modal';
import T from '../../../l10n';
import {getWorkspace} from '../../../di-default';
import {FormEvent} from 'react';

const workspace = getWorkspace()

const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  // noinspection JSIgnoredPromiseFromCall
  workspace.toggleAbout();
  return null;
};

const About = (): React.ReactElement => {
  return <Modal className="about" onClose={() => 0} >
    <form onSubmit={handleSubmit}>
      <h2 >{T`About`}</h2 >
      <p >{T`About networking`}</p >
      <p >{T`About beta`}</p >
      <h3 >{T`Credentials`}</h3 >
      <p >{T`About Red Off-road`} <a target="_redoffroad" href="https://red-offroad.ru" >Red off-road expedition.</a ></p >
      <p >{T`About Tulupov`} <a target="_tulupov" href="https://www.facebook.com/aleksey.tulupov" >Алексей Тулупов.</a >
      </p >
      <p >{T`About Nevinski`} <a target="_nevinsky" href="https://www.facebook.com/kirillnev" >Кирилл Невинский.</a >
      </p >
      <div className="buttons-row" >
        <button onClick={workspace.toggleAbout} >
          {T`Close`}
        </button >
      </div >
      <hr />
      <h4 >&copy;S4Y.Solutions, 2020</h4 >
    </form >
  </Modal >
}

export default About;