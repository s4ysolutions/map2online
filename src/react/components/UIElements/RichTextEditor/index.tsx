/*
 * Copyright 2021 s4y.solutions
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

import * as React from 'react';
import {memo, useCallback, useMemo} from 'react';
import log from '../../../../log';
import './style.scss';
import {Descendant, createEditor} from 'slate';
import {Editable, ReactEditor, Slate, withReact} from 'slate-react';
import {withHistory} from 'slate-history';
import {Toolbar} from './Toolbar';
import MarkButton from './Toolbar/MarkButton';
import Leaf from './Editor/Leaf';
import Element from './Editor/Element';
import BlockButton from './Toolbar/BlockButton';
import InsertImageButton from './Toolbar/InsertImageButton';
import withImages from './Editor/Image/withImage';
import AddLinkButton from './Toolbar/AddLinkButton';
import RemoveLinkButton from './Toolbar/RemoveLinkButton';
import withInlines from './Editor/Inlines/withInlines';
import {RichText, RichTextElementType} from '../../../../richtext';
import {RenderElementProps, RenderLeafProps} from 'slate-react/dist/components/editable';

const emptyValue: RichText = [
  {
    type: RichTextElementType.Paragraph,
    children: [{text: ''}],
  },
];

const RichTextEditor: React.FunctionComponent<{ content: RichText, onChange?: (value: Descendant[]) => void }> =
  ({content, onChange: handleChange}): React.ReactElement => {
    log.render('RichText Editor');

    const initialValue = content && content.length ? content : emptyValue;

    // const [value, setValue] = useState<Descendant[]>(initialValue);
    const editor = useMemo(() => withInlines(withImages(withHistory(withReact(createEditor() as ReactEditor)))), []);
    const renderElement = useCallback((props: RenderElementProps): JSX.Element => <Element {...props}>
      {props.children}
    </Element>, []);
    const renderLeaf = useCallback((props: RenderLeafProps): JSX.Element => <Leaf {...props}>
      {props.children}
    </Leaf>, []);
    // const updateValue = useCallback(value => {/*setValue(value);*/onChange(value);}, [/*setValue*/]);

    return <div className="rich-text" >
      <Slate editor={editor} onChange={handleChange} value={initialValue} >
        <Toolbar >
          <MarkButton format="bold" icon="format_bold" />

          <MarkButton format="italic" icon="format_italic" />

          <MarkButton format="underline" icon="format_underlined" />

          <MarkButton format="code" icon="code" />

          <BlockButton format={RichTextElementType.HeadingOne} icon="looks_one" />

          <BlockButton format={RichTextElementType.HeadingTwo} icon="looks_two" />

          {
            /* TODO: wraps every P in its own quote
          <BlockButton format="block-quote" icon="format_quote" />
      */
          }

          <BlockButton format={RichTextElementType.NumberedList} icon="format_list_numbered" />

          <BlockButton format={RichTextElementType.BulletedList} icon="format_list_bulleted" />

          <InsertImageButton />

          <AddLinkButton />

          <RemoveLinkButton />

        </Toolbar >

        <Editable
          className="rich-textarea"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate >
    </div >;
  };

export default memo(RichTextEditor);

