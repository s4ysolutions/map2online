import './styles.scss';
import * as React from 'react';
import Modal from '../Modal';
import T from '../../../l10n';
import {getWorkspace} from '../../../di-default';

const workspace = getWorkspace()

const About = (): React.ReactElement => {
  return <Modal className="about" onClose={() => 0} >
    <form >
      <h2 >{T`About`}</h2 >
      <p >{T`About networking`}</p >
      <p >{T`About beta`}</p >
      <h3 >{T`Credentials`}</h3 >
      <p >{T`About Red Off-road`} <a target="_redoffroad" href="https://red-offroad.ru" >RED OFF-ROAD.</a ></p >
      <p >{T`About Tulupov`} <a target="_tulupov" href="https://www.facebook.com/aleksey.tulupov" >Алексей Тулупов.</a >
      </p >
      <p >{T`About Nevinski`} <a target="_nevinsky" href="https://www.facebook.com/kirillnev" >Кирилл Невинский.</a >
      </p >
      <hr />
      <h4 >&copy;S4Y.Solutions, 2020</h4 >
      <div className="buttons-row" >
        <button onClick={workspace.toggleAbout} >
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >
}

export default About;