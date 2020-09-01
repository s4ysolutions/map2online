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

import React from 'react';
import PropTypes from 'prop-types';

const strokeProps = {
  strokeWidth: 1,
};
const Line: React.FunctionComponent<{color: string}> = ({color}) => <svg viewBox="-1 -1 18 18" >
  <path
    d="M3.5,9h9C14.43,9,16,7.43,16,5.5S14.43,2,12.5,2H4c0-1.105-0.895-2-2-2S0,0.895,0,2c0,1.105,0.895,2,2,2  c0.738,0,1.376-0.405,1.723-1H12.5C13.878,3,15,4.122,15,5.5S13.878,8,12.5,8h-9C1.57,8,0,9.57,0,11.5S1.57,15,3.5,15h8.777  c0.346,0.595,0.984,1,1.723,1c1.105,0,2-0.895,2-2c0-1.105-0.895-2-2-2s-2,0.895-2,2H3.5C2.122,14,1,12.878,1,11.5S2.122,9,3.5,9z"
    stroke={color}
    {...strokeProps}
  />
</svg >
;

Line.propTypes = {color: PropTypes.string.isRequired};

export default Line;
