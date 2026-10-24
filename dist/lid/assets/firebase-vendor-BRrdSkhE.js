const Vl=()=>{};var so={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fa=function(n){const t=[];let e=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?t[e++]=i:i<2048?(t[e++]=i>>6|192,t[e++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),t[e++]=i>>18|240,t[e++]=i>>12&63|128,t[e++]=i>>6&63|128,t[e++]=i&63|128):(t[e++]=i>>12|224,t[e++]=i>>6&63|128,t[e++]=i&63|128)}return t},Dl=function(n){const t=[];let e=0,r=0;for(;e<n.length;){const i=n[e++];if(i<128)t[r++]=String.fromCharCode(i);else if(i>191&&i<224){const o=n[e++];t[r++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){const o=n[e++],c=n[e++],u=n[e++],f=((i&7)<<18|(o&63)<<12|(c&63)<<6|u&63)-65536;t[r++]=String.fromCharCode(55296+(f>>10)),t[r++]=String.fromCharCode(56320+(f&1023))}else{const o=n[e++],c=n[e++];t[r++]=String.fromCharCode((i&15)<<12|(o&63)<<6|c&63)}}return t.join("")},da={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,t){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const e=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const o=n[i],c=i+1<n.length,u=c?n[i+1]:0,f=i+2<n.length,d=f?n[i+2]:0,T=o>>2,w=(o&3)<<4|u>>4;let R=(u&15)<<2|d>>6,V=d&63;f||(V=64,c||(R=64)),r.push(e[T],e[w],e[R],e[V])}return r.join("")},encodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(n):this.encodeByteArray(fa(n),t)},decodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(n):Dl(this.decodeStringToByteArray(n,t))},decodeStringToByteArray(n,t){this.init_();const e=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const o=e[n.charAt(i++)],u=i<n.length?e[n.charAt(i)]:0;++i;const d=i<n.length?e[n.charAt(i)]:64;++i;const w=i<n.length?e[n.charAt(i)]:64;if(++i,o==null||u==null||d==null||w==null)throw new Nl;const R=o<<2|u>>4;if(r.push(R),d!==64){const V=u<<4&240|d>>2;if(r.push(V),w!==64){const N=d<<6&192|w;r.push(N)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Nl extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const kl=function(n){const t=fa(n);return da.encodeByteArray(t,!0)},Jn=function(n){return kl(n).replace(/\./g,"")},Ol=function(n){try{return da.decodeString(n,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xl(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ml=()=>xl().__FIREBASE_DEFAULTS__,Ll=()=>{if(typeof process>"u"||typeof so>"u")return;const n=so.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Fl=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=n&&Ol(n[1]);return t&&JSON.parse(t)},Is=()=>{try{return Vl()||Ml()||Ll()||Fl()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Ul=n=>Is()?.emulatorHosts?.[n],Bl=n=>{const t=Ul(n);if(!t)return;const e=t.lastIndexOf(":");if(e<=0||e+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const r=parseInt(t.substring(e+1),10);return t[0]==="["?[t.substring(1,e-1),r]:[t.substring(0,e),r]},pa=()=>Is()?.config;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jl{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,r)=>{e?this.reject(e):this.resolve(r),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(e):t(e,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vs(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function $l(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ql(n,t){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const e={alg:"none",type:"JWT"},r=t||"demo-project",i=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const c={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Jn(JSON.stringify(e)),Jn(JSON.stringify(c)),""].join(".")}const tn={};function zl(){const n={prod:[],emulator:[]};for(const t of Object.keys(tn))tn[t]?n.emulator.push(t):n.prod.push(t);return n}function Hl(n){let t=document.getElementById(n),e=!1;return t||(t=document.createElement("div"),t.setAttribute("id",n),e=!0),{created:e,element:t}}let io=!1;function Gl(n,t){if(typeof window>"u"||typeof document>"u"||!vs(window.location.host)||tn[n]===t||tn[n]||io)return;tn[n]=t;function e(R){return`__firebase__banner__${R}`}const r="__firebase__banner",o=zl().prod.length>0;function c(){const R=document.getElementById(r);R&&R.remove()}function u(R){R.style.display="flex",R.style.background="#7faaf0",R.style.position="fixed",R.style.bottom="5px",R.style.left="5px",R.style.padding=".5em",R.style.borderRadius="5px",R.style.alignItems="center"}function f(R,V){R.setAttribute("width","24"),R.setAttribute("id",V),R.setAttribute("height","24"),R.setAttribute("viewBox","0 0 24 24"),R.setAttribute("fill","none"),R.style.marginLeft="-6px"}function d(){const R=document.createElement("span");return R.style.cursor="pointer",R.style.marginLeft="16px",R.style.fontSize="24px",R.innerHTML=" &times;",R.onclick=()=>{io=!0,c()},R}function T(R,V){R.setAttribute("id",V),R.innerText="Learn more",R.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",R.setAttribute("target","__blank"),R.style.paddingLeft="5px",R.style.textDecoration="underline"}function w(){const R=Hl(r),V=e("text"),N=document.getElementById(V)||document.createElement("span"),L=e("learnmore"),x=document.getElementById(L)||document.createElement("a"),z=e("preprendIcon"),H=document.getElementById(z)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(R.created){const X=R.element;u(X),T(x,L);const gt=d();f(H,z),X.append(H,N,x,gt),document.body.appendChild(X)}o?(N.innerText="Preview backend disconnected.",H.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(H.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,N.innerText="Preview backend running in this workspace."),N.setAttribute("id",V)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",w):w()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kl(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Wl(){const n=Is()?.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ql(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Jl(){return!Wl()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function ma(){try{return typeof indexedDB=="object"}catch{return!1}}function ga(){return new Promise((n,t)=>{try{let e=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),e||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{e=!1},i.onerror=()=>{t(i.error?.message||"")}}catch(e){t(e)}})}function Xl(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yl="FirebaseError";class Yt extends Error{constructor(t,e,r){super(e),this.code=t,this.customData=r,this.name=Yl,Object.setPrototypeOf(this,Yt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ur.prototype.create)}}class ur{constructor(t,e,r){this.service=t,this.serviceName=e,this.errors=r}create(t,...e){const r=e[0]||{},i=`${this.service}/${t}`,o=this.errors[t],c=o?Zl(o,r):"Error",u=`${this.serviceName}: ${c} (${i}).`;return new Yt(i,u,r)}}function Zl(n,t){return n.replace(tu,(e,r)=>{const i=t[r];return i!=null?String(i):`<${r}?>`})}const tu=/\{\$([^}]+)}/g;function an(n,t){if(n===t)return!0;const e=Object.keys(n),r=Object.keys(t);for(const i of e){if(!r.includes(i))return!1;const o=n[i],c=t[i];if(oo(o)&&oo(c)){if(!an(o,c))return!1}else if(o!==c)return!1}for(const i of r)if(!e.includes(i))return!1;return!0}function oo(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eu=1e3,nu=2,ru=4*60*60*1e3,su=.5;function ao(n,t=eu,e=nu){const r=t*Math.pow(e,n),i=Math.round(su*r*(Math.random()-.5)*2);return Math.min(ru,r+i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ue(n){return n&&n._delegate?n._delegate:n}class Lt{constructor(t,e,r){this.name=t,this.instanceFactory=e,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ie="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iu{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const r=new jl;if(this.instancesDeferred.set(e,r),this.isInitialized(e)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:e});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(e).promise}getImmediate(t){const e=this.normalizeInstanceIdentifier(t?.identifier),r=t?.optional??!1;if(this.isInitialized(e)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:e})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(au(t))try{this.getOrInitializeService({instanceIdentifier:ie})}catch{}for(const[e,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(e);try{const o=this.getOrInitializeService({instanceIdentifier:i});r.resolve(o)}catch{}}}}clearInstance(t=ie){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...t.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=ie){return this.instances.has(t)}getOptions(t=ie){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,r=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:e});for(const[o,c]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(o);r===u&&c.resolve(i)}return i}onInit(t,e){const r=this.normalizeInstanceIdentifier(e),i=this.onInitCallbacks.get(r)??new Set;i.add(t),this.onInitCallbacks.set(r,i);const o=this.instances.get(r);return o&&t(o,r),()=>{i.delete(t)}}invokeOnInitCallbacks(t,e){const r=this.onInitCallbacks.get(e);if(r)for(const i of r)try{i(t,e)}catch{}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let r=this.instances.get(t);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ou(t),options:e}),this.instances.set(t,r),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(r,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,r)}catch{}return r||null}normalizeInstanceIdentifier(t=ie){return this.component?this.component.multipleInstances?t:ie:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ou(n){return n===ie?void 0:n}function au(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cu{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new iu(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var U;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(U||(U={}));const lu={debug:U.DEBUG,verbose:U.VERBOSE,info:U.INFO,warn:U.WARN,error:U.ERROR,silent:U.SILENT},uu=U.INFO,hu={[U.DEBUG]:"log",[U.VERBOSE]:"log",[U.INFO]:"info",[U.WARN]:"warn",[U.ERROR]:"error"},fu=(n,t,...e)=>{if(t<n.logLevel)return;const r=new Date().toISOString(),i=hu[t];if(i)console[i](`[${r}]  ${n.name}:`,...e);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class ws{constructor(t){this.name=t,this._logLevel=uu,this._logHandler=fu,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in U))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?lu[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,U.DEBUG,...t),this._logHandler(this,U.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,U.VERBOSE,...t),this._logHandler(this,U.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,U.INFO,...t),this._logHandler(this,U.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,U.WARN,...t),this._logHandler(this,U.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,U.ERROR,...t),this._logHandler(this,U.ERROR,...t)}}const du=(n,t)=>t.some(e=>n instanceof e);let co,lo;function pu(){return co||(co=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function mu(){return lo||(lo=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const _a=new WeakMap,ns=new WeakMap,ya=new WeakMap,Hr=new WeakMap,As=new WeakMap;function gu(n){const t=new Promise((e,r)=>{const i=()=>{n.removeEventListener("success",o),n.removeEventListener("error",c)},o=()=>{e(Ht(n.result)),i()},c=()=>{r(n.error),i()};n.addEventListener("success",o),n.addEventListener("error",c)});return t.then(e=>{e instanceof IDBCursor&&_a.set(e,n)}).catch(()=>{}),As.set(t,n),t}function _u(n){if(ns.has(n))return;const t=new Promise((e,r)=>{const i=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",c),n.removeEventListener("abort",c)},o=()=>{e(),i()},c=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",o),n.addEventListener("error",c),n.addEventListener("abort",c)});ns.set(n,t)}let rs={get(n,t,e){if(n instanceof IDBTransaction){if(t==="done")return ns.get(n);if(t==="objectStoreNames")return n.objectStoreNames||ya.get(n);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return Ht(n[t])},set(n,t,e){return n[t]=e,!0},has(n,t){return n instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in n}};function yu(n){rs=n(rs)}function Eu(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...e){const r=n.call(Gr(this),t,...e);return ya.set(r,t.sort?t.sort():[t]),Ht(r)}:mu().includes(n)?function(...t){return n.apply(Gr(this),t),Ht(_a.get(this))}:function(...t){return Ht(n.apply(Gr(this),t))}}function Tu(n){return typeof n=="function"?Eu(n):(n instanceof IDBTransaction&&_u(n),du(n,pu())?new Proxy(n,rs):n)}function Ht(n){if(n instanceof IDBRequest)return gu(n);if(Hr.has(n))return Hr.get(n);const t=Tu(n);return t!==n&&(Hr.set(n,t),As.set(t,n)),t}const Gr=n=>As.get(n);function Ea(n,t,{blocked:e,upgrade:r,blocking:i,terminated:o}={}){const c=indexedDB.open(n,t),u=Ht(c);return r&&c.addEventListener("upgradeneeded",f=>{r(Ht(c.result),f.oldVersion,f.newVersion,Ht(c.transaction),f)}),e&&c.addEventListener("blocked",f=>e(f.oldVersion,f.newVersion,f)),u.then(f=>{o&&f.addEventListener("close",()=>o()),i&&f.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}const Iu=["get","getKey","getAll","getAllKeys","count"],vu=["put","add","delete","clear"],Kr=new Map;function uo(n,t){if(!(n instanceof IDBDatabase&&!(t in n)&&typeof t=="string"))return;if(Kr.get(t))return Kr.get(t);const e=t.replace(/FromIndex$/,""),r=t!==e,i=vu.includes(e);if(!(e in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Iu.includes(e)))return;const o=async function(c,...u){const f=this.transaction(c,i?"readwrite":"readonly");let d=f.store;return r&&(d=d.index(u.shift())),(await Promise.all([d[e](...u),i&&f.done]))[0]};return Kr.set(t,o),o}yu(n=>({...n,get:(t,e,r)=>uo(t,e)||n.get(t,e,r),has:(t,e)=>!!uo(t,e)||n.has(t,e)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wu{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(Au(e)){const r=e.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(e=>e).join(" ")}}function Au(n){return n.getComponent()?.type==="VERSION"}const ss="@firebase/app",ho="0.14.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ft=new ws("@firebase/app"),Ru="@firebase/app-compat",Su="@firebase/analytics-compat",bu="@firebase/analytics",Cu="@firebase/app-check-compat",Pu="@firebase/app-check",Vu="@firebase/auth",Du="@firebase/auth-compat",Nu="@firebase/database",ku="@firebase/data-connect",Ou="@firebase/database-compat",xu="@firebase/functions",Mu="@firebase/functions-compat",Lu="@firebase/installations",Fu="@firebase/installations-compat",Uu="@firebase/messaging",Bu="@firebase/messaging-compat",ju="@firebase/performance",$u="@firebase/performance-compat",qu="@firebase/remote-config",zu="@firebase/remote-config-compat",Hu="@firebase/storage",Gu="@firebase/storage-compat",Ku="@firebase/firestore",Wu="@firebase/ai",Qu="@firebase/firestore-compat",Ju="firebase",Xu="12.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const is="[DEFAULT]",Yu={[ss]:"fire-core",[Ru]:"fire-core-compat",[bu]:"fire-analytics",[Su]:"fire-analytics-compat",[Pu]:"fire-app-check",[Cu]:"fire-app-check-compat",[Vu]:"fire-auth",[Du]:"fire-auth-compat",[Nu]:"fire-rtdb",[ku]:"fire-data-connect",[Ou]:"fire-rtdb-compat",[xu]:"fire-fn",[Mu]:"fire-fn-compat",[Lu]:"fire-iid",[Fu]:"fire-iid-compat",[Uu]:"fire-fcm",[Bu]:"fire-fcm-compat",[ju]:"fire-perf",[$u]:"fire-perf-compat",[qu]:"fire-rc",[zu]:"fire-rc-compat",[Hu]:"fire-gcs",[Gu]:"fire-gcs-compat",[Ku]:"fire-fst",[Qu]:"fire-fst-compat",[Wu]:"fire-vertex","fire-js":"fire-js",[Ju]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xn=new Map,Zu=new Map,os=new Map;function fo(n,t){try{n.container.addComponent(t)}catch(e){Ft.debug(`Component ${t.name} failed to register with FirebaseApp ${n.name}`,e)}}function Kt(n){const t=n.name;if(os.has(t))return Ft.debug(`There were multiple attempts to register component ${t}.`),!1;os.set(t,n);for(const e of Xn.values())fo(e,n);for(const e of Zu.values())fo(e,n);return!0}function _n(n,t){const e=n.container.getProvider("heartbeat").getImmediate({optional:!0});return e&&e.triggerHeartbeat(),n.container.getProvider(t)}function th(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eh={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Gt=new ur("app","Firebase",eh);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nh{constructor(t,e,r){this._isDeleted=!1,this._options={...t},this._config={...e},this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Lt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw Gt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rh=Xu;function sh(n,t={}){let e=n;typeof t!="object"&&(t={name:t});const r={name:is,automaticDataCollectionEnabled:!0,...t},i=r.name;if(typeof i!="string"||!i)throw Gt.create("bad-app-name",{appName:String(i)});if(e||(e=pa()),!e)throw Gt.create("no-options");const o=Xn.get(i);if(o){if(an(e,o.options)&&an(r,o.config))return o;throw Gt.create("duplicate-app",{appName:i})}const c=new cu(i);for(const f of os.values())c.addComponent(f);const u=new nh(e,r,c);return Xn.set(i,u),u}function Ta(n=is){const t=Xn.get(n);if(!t&&n===is&&pa())return sh();if(!t)throw Gt.create("no-app",{appName:n});return t}function Vt(n,t,e){let r=Yu[n]??n;e&&(r+=`-${e}`);const i=r.match(/\s|\//),o=t.match(/\s|\//);if(i||o){const c=[`Unable to register library "${r}" with version "${t}":`];i&&c.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&o&&c.push("and"),o&&c.push(`version name "${t}" contains illegal characters (whitespace or "/")`),Ft.warn(c.join(" "));return}Kt(new Lt(`${r}-version`,()=>({library:r,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ih="firebase-heartbeat-database",oh=1,cn="firebase-heartbeat-store";let Wr=null;function Ia(){return Wr||(Wr=Ea(ih,oh,{upgrade:(n,t)=>{switch(t){case 0:try{n.createObjectStore(cn)}catch(e){console.warn(e)}}}}).catch(n=>{throw Gt.create("idb-open",{originalErrorMessage:n.message})})),Wr}async function ah(n){try{const e=(await Ia()).transaction(cn),r=await e.objectStore(cn).get(va(n));return await e.done,r}catch(t){if(t instanceof Yt)Ft.warn(t.message);else{const e=Gt.create("idb-get",{originalErrorMessage:t?.message});Ft.warn(e.message)}}}async function po(n,t){try{const r=(await Ia()).transaction(cn,"readwrite");await r.objectStore(cn).put(t,va(n)),await r.done}catch(e){if(e instanceof Yt)Ft.warn(e.message);else{const r=Gt.create("idb-set",{originalErrorMessage:e?.message});Ft.warn(r.message)}}}function va(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ch=1024,lh=30;class uh{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new fh(e),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){try{const e=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=mo();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(i=>i.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:e}),this._heartbeatsCache.heartbeats.length>lh){const i=dh(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){Ft.warn(t)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=mo(),{heartbeatsToSend:e,unsentEntries:r}=hh(this._heartbeatsCache.heartbeats),i=Jn(JSON.stringify({version:2,heartbeats:e}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Ft.warn(t),""}}}function mo(){return new Date().toISOString().substring(0,10)}function hh(n,t=ch){const e=[];let r=n.slice();for(const i of n){const o=e.find(c=>c.agent===i.agent);if(o){if(o.dates.push(i.date),go(e)>t){o.dates.pop();break}}else if(e.push({agent:i.agent,dates:[i.date]}),go(e)>t){e.pop();break}r=r.slice(1)}return{heartbeatsToSend:e,unsentEntries:r}}class fh{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ma()?ga().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const e=await ah(this.app);return e?.heartbeats?e:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){const r=await this.read();return po(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){const r=await this.read();return po(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...t.heartbeats]})}else return}}function go(n){return Jn(JSON.stringify({version:2,heartbeats:n})).length}function dh(n){if(n.length===0)return-1;let t=0,e=n[0].date;for(let r=1;r<n.length;r++)n[r].date<e&&(e=n[r].date,t=r);return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ph(n){Kt(new Lt("platform-logger",t=>new wu(t),"PRIVATE")),Kt(new Lt("heartbeat",t=>new uh(t),"PRIVATE")),Vt(ss,ho,n),Vt(ss,ho,"esm2020"),Vt("fire-js","")}ph("");var _o=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Rs;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(y,p){function g(){}g.prototype=p.prototype,y.F=p.prototype,y.prototype=new g,y.prototype.constructor=y,y.D=function(E,_,v){for(var m=Array(arguments.length-2),yt=2;yt<arguments.length;yt++)m[yt-2]=arguments[yt];return p.prototype[_].apply(E,m)}}function e(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}t(r,e),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(y,p,g){g||(g=0);const E=Array(16);if(typeof p=="string")for(var _=0;_<16;++_)E[_]=p.charCodeAt(g++)|p.charCodeAt(g++)<<8|p.charCodeAt(g++)<<16|p.charCodeAt(g++)<<24;else for(_=0;_<16;++_)E[_]=p[g++]|p[g++]<<8|p[g++]<<16|p[g++]<<24;p=y.g[0],g=y.g[1],_=y.g[2];let v=y.g[3],m;m=p+(v^g&(_^v))+E[0]+3614090360&4294967295,p=g+(m<<7&4294967295|m>>>25),m=v+(_^p&(g^_))+E[1]+3905402710&4294967295,v=p+(m<<12&4294967295|m>>>20),m=_+(g^v&(p^g))+E[2]+606105819&4294967295,_=v+(m<<17&4294967295|m>>>15),m=g+(p^_&(v^p))+E[3]+3250441966&4294967295,g=_+(m<<22&4294967295|m>>>10),m=p+(v^g&(_^v))+E[4]+4118548399&4294967295,p=g+(m<<7&4294967295|m>>>25),m=v+(_^p&(g^_))+E[5]+1200080426&4294967295,v=p+(m<<12&4294967295|m>>>20),m=_+(g^v&(p^g))+E[6]+2821735955&4294967295,_=v+(m<<17&4294967295|m>>>15),m=g+(p^_&(v^p))+E[7]+4249261313&4294967295,g=_+(m<<22&4294967295|m>>>10),m=p+(v^g&(_^v))+E[8]+1770035416&4294967295,p=g+(m<<7&4294967295|m>>>25),m=v+(_^p&(g^_))+E[9]+2336552879&4294967295,v=p+(m<<12&4294967295|m>>>20),m=_+(g^v&(p^g))+E[10]+4294925233&4294967295,_=v+(m<<17&4294967295|m>>>15),m=g+(p^_&(v^p))+E[11]+2304563134&4294967295,g=_+(m<<22&4294967295|m>>>10),m=p+(v^g&(_^v))+E[12]+1804603682&4294967295,p=g+(m<<7&4294967295|m>>>25),m=v+(_^p&(g^_))+E[13]+4254626195&4294967295,v=p+(m<<12&4294967295|m>>>20),m=_+(g^v&(p^g))+E[14]+2792965006&4294967295,_=v+(m<<17&4294967295|m>>>15),m=g+(p^_&(v^p))+E[15]+1236535329&4294967295,g=_+(m<<22&4294967295|m>>>10),m=p+(_^v&(g^_))+E[1]+4129170786&4294967295,p=g+(m<<5&4294967295|m>>>27),m=v+(g^_&(p^g))+E[6]+3225465664&4294967295,v=p+(m<<9&4294967295|m>>>23),m=_+(p^g&(v^p))+E[11]+643717713&4294967295,_=v+(m<<14&4294967295|m>>>18),m=g+(v^p&(_^v))+E[0]+3921069994&4294967295,g=_+(m<<20&4294967295|m>>>12),m=p+(_^v&(g^_))+E[5]+3593408605&4294967295,p=g+(m<<5&4294967295|m>>>27),m=v+(g^_&(p^g))+E[10]+38016083&4294967295,v=p+(m<<9&4294967295|m>>>23),m=_+(p^g&(v^p))+E[15]+3634488961&4294967295,_=v+(m<<14&4294967295|m>>>18),m=g+(v^p&(_^v))+E[4]+3889429448&4294967295,g=_+(m<<20&4294967295|m>>>12),m=p+(_^v&(g^_))+E[9]+568446438&4294967295,p=g+(m<<5&4294967295|m>>>27),m=v+(g^_&(p^g))+E[14]+3275163606&4294967295,v=p+(m<<9&4294967295|m>>>23),m=_+(p^g&(v^p))+E[3]+4107603335&4294967295,_=v+(m<<14&4294967295|m>>>18),m=g+(v^p&(_^v))+E[8]+1163531501&4294967295,g=_+(m<<20&4294967295|m>>>12),m=p+(_^v&(g^_))+E[13]+2850285829&4294967295,p=g+(m<<5&4294967295|m>>>27),m=v+(g^_&(p^g))+E[2]+4243563512&4294967295,v=p+(m<<9&4294967295|m>>>23),m=_+(p^g&(v^p))+E[7]+1735328473&4294967295,_=v+(m<<14&4294967295|m>>>18),m=g+(v^p&(_^v))+E[12]+2368359562&4294967295,g=_+(m<<20&4294967295|m>>>12),m=p+(g^_^v)+E[5]+4294588738&4294967295,p=g+(m<<4&4294967295|m>>>28),m=v+(p^g^_)+E[8]+2272392833&4294967295,v=p+(m<<11&4294967295|m>>>21),m=_+(v^p^g)+E[11]+1839030562&4294967295,_=v+(m<<16&4294967295|m>>>16),m=g+(_^v^p)+E[14]+4259657740&4294967295,g=_+(m<<23&4294967295|m>>>9),m=p+(g^_^v)+E[1]+2763975236&4294967295,p=g+(m<<4&4294967295|m>>>28),m=v+(p^g^_)+E[4]+1272893353&4294967295,v=p+(m<<11&4294967295|m>>>21),m=_+(v^p^g)+E[7]+4139469664&4294967295,_=v+(m<<16&4294967295|m>>>16),m=g+(_^v^p)+E[10]+3200236656&4294967295,g=_+(m<<23&4294967295|m>>>9),m=p+(g^_^v)+E[13]+681279174&4294967295,p=g+(m<<4&4294967295|m>>>28),m=v+(p^g^_)+E[0]+3936430074&4294967295,v=p+(m<<11&4294967295|m>>>21),m=_+(v^p^g)+E[3]+3572445317&4294967295,_=v+(m<<16&4294967295|m>>>16),m=g+(_^v^p)+E[6]+76029189&4294967295,g=_+(m<<23&4294967295|m>>>9),m=p+(g^_^v)+E[9]+3654602809&4294967295,p=g+(m<<4&4294967295|m>>>28),m=v+(p^g^_)+E[12]+3873151461&4294967295,v=p+(m<<11&4294967295|m>>>21),m=_+(v^p^g)+E[15]+530742520&4294967295,_=v+(m<<16&4294967295|m>>>16),m=g+(_^v^p)+E[2]+3299628645&4294967295,g=_+(m<<23&4294967295|m>>>9),m=p+(_^(g|~v))+E[0]+4096336452&4294967295,p=g+(m<<6&4294967295|m>>>26),m=v+(g^(p|~_))+E[7]+1126891415&4294967295,v=p+(m<<10&4294967295|m>>>22),m=_+(p^(v|~g))+E[14]+2878612391&4294967295,_=v+(m<<15&4294967295|m>>>17),m=g+(v^(_|~p))+E[5]+4237533241&4294967295,g=_+(m<<21&4294967295|m>>>11),m=p+(_^(g|~v))+E[12]+1700485571&4294967295,p=g+(m<<6&4294967295|m>>>26),m=v+(g^(p|~_))+E[3]+2399980690&4294967295,v=p+(m<<10&4294967295|m>>>22),m=_+(p^(v|~g))+E[10]+4293915773&4294967295,_=v+(m<<15&4294967295|m>>>17),m=g+(v^(_|~p))+E[1]+2240044497&4294967295,g=_+(m<<21&4294967295|m>>>11),m=p+(_^(g|~v))+E[8]+1873313359&4294967295,p=g+(m<<6&4294967295|m>>>26),m=v+(g^(p|~_))+E[15]+4264355552&4294967295,v=p+(m<<10&4294967295|m>>>22),m=_+(p^(v|~g))+E[6]+2734768916&4294967295,_=v+(m<<15&4294967295|m>>>17),m=g+(v^(_|~p))+E[13]+1309151649&4294967295,g=_+(m<<21&4294967295|m>>>11),m=p+(_^(g|~v))+E[4]+4149444226&4294967295,p=g+(m<<6&4294967295|m>>>26),m=v+(g^(p|~_))+E[11]+3174756917&4294967295,v=p+(m<<10&4294967295|m>>>22),m=_+(p^(v|~g))+E[2]+718787259&4294967295,_=v+(m<<15&4294967295|m>>>17),m=g+(v^(_|~p))+E[9]+3951481745&4294967295,y.g[0]=y.g[0]+p&4294967295,y.g[1]=y.g[1]+(_+(m<<21&4294967295|m>>>11))&4294967295,y.g[2]=y.g[2]+_&4294967295,y.g[3]=y.g[3]+v&4294967295}r.prototype.v=function(y,p){p===void 0&&(p=y.length);const g=p-this.blockSize,E=this.C;let _=this.h,v=0;for(;v<p;){if(_==0)for(;v<=g;)i(this,y,v),v+=this.blockSize;if(typeof y=="string"){for(;v<p;)if(E[_++]=y.charCodeAt(v++),_==this.blockSize){i(this,E),_=0;break}}else for(;v<p;)if(E[_++]=y[v++],_==this.blockSize){i(this,E),_=0;break}}this.h=_,this.o+=p},r.prototype.A=function(){var y=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);y[0]=128;for(var p=1;p<y.length-8;++p)y[p]=0;p=this.o*8;for(var g=y.length-8;g<y.length;++g)y[g]=p&255,p/=256;for(this.v(y),y=Array(16),p=0,g=0;g<4;++g)for(let E=0;E<32;E+=8)y[p++]=this.g[g]>>>E&255;return y};function o(y,p){var g=u;return Object.prototype.hasOwnProperty.call(g,y)?g[y]:g[y]=p(y)}function c(y,p){this.h=p;const g=[];let E=!0;for(let _=y.length-1;_>=0;_--){const v=y[_]|0;E&&v==p||(g[_]=v,E=!1)}this.g=g}var u={};function f(y){return-128<=y&&y<128?o(y,function(p){return new c([p|0],p<0?-1:0)}):new c([y|0],y<0?-1:0)}function d(y){if(isNaN(y)||!isFinite(y))return w;if(y<0)return x(d(-y));const p=[];let g=1;for(let E=0;y>=g;E++)p[E]=y/g|0,g*=4294967296;return new c(p,0)}function T(y,p){if(y.length==0)throw Error("number format error: empty string");if(p=p||10,p<2||36<p)throw Error("radix out of range: "+p);if(y.charAt(0)=="-")return x(T(y.substring(1),p));if(y.indexOf("-")>=0)throw Error('number format error: interior "-" character');const g=d(Math.pow(p,8));let E=w;for(let v=0;v<y.length;v+=8){var _=Math.min(8,y.length-v);const m=parseInt(y.substring(v,v+_),p);_<8?(_=d(Math.pow(p,_)),E=E.j(_).add(d(m))):(E=E.j(g),E=E.add(d(m)))}return E}var w=f(0),R=f(1),V=f(16777216);n=c.prototype,n.m=function(){if(L(this))return-x(this).m();let y=0,p=1;for(let g=0;g<this.g.length;g++){const E=this.i(g);y+=(E>=0?E:4294967296+E)*p,p*=4294967296}return y},n.toString=function(y){if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(N(this))return"0";if(L(this))return"-"+x(this).toString(y);const p=d(Math.pow(y,6));var g=this;let E="";for(;;){const _=gt(g,p).g;g=z(g,_.j(p));let v=((g.g.length>0?g.g[0]:g.h)>>>0).toString(y);if(g=_,N(g))return v+E;for(;v.length<6;)v="0"+v;E=v+E}},n.i=function(y){return y<0?0:y<this.g.length?this.g[y]:this.h};function N(y){if(y.h!=0)return!1;for(let p=0;p<y.g.length;p++)if(y.g[p]!=0)return!1;return!0}function L(y){return y.h==-1}n.l=function(y){return y=z(this,y),L(y)?-1:N(y)?0:1};function x(y){const p=y.g.length,g=[];for(let E=0;E<p;E++)g[E]=~y.g[E];return new c(g,~y.h).add(R)}n.abs=function(){return L(this)?x(this):this},n.add=function(y){const p=Math.max(this.g.length,y.g.length),g=[];let E=0;for(let _=0;_<=p;_++){let v=E+(this.i(_)&65535)+(y.i(_)&65535),m=(v>>>16)+(this.i(_)>>>16)+(y.i(_)>>>16);E=m>>>16,v&=65535,m&=65535,g[_]=m<<16|v}return new c(g,g[g.length-1]&-2147483648?-1:0)};function z(y,p){return y.add(x(p))}n.j=function(y){if(N(this)||N(y))return w;if(L(this))return L(y)?x(this).j(x(y)):x(x(this).j(y));if(L(y))return x(this.j(x(y)));if(this.l(V)<0&&y.l(V)<0)return d(this.m()*y.m());const p=this.g.length+y.g.length,g=[];for(var E=0;E<2*p;E++)g[E]=0;for(E=0;E<this.g.length;E++)for(let _=0;_<y.g.length;_++){const v=this.i(E)>>>16,m=this.i(E)&65535,yt=y.i(_)>>>16,Zt=y.i(_)&65535;g[2*E+2*_]+=m*Zt,H(g,2*E+2*_),g[2*E+2*_+1]+=v*Zt,H(g,2*E+2*_+1),g[2*E+2*_+1]+=m*yt,H(g,2*E+2*_+1),g[2*E+2*_+2]+=v*yt,H(g,2*E+2*_+2)}for(y=0;y<p;y++)g[y]=g[2*y+1]<<16|g[2*y];for(y=p;y<2*p;y++)g[y]=0;return new c(g,0)};function H(y,p){for(;(y[p]&65535)!=y[p];)y[p+1]+=y[p]>>>16,y[p]&=65535,p++}function X(y,p){this.g=y,this.h=p}function gt(y,p){if(N(p))throw Error("division by zero");if(N(y))return new X(w,w);if(L(y))return p=gt(x(y),p),new X(x(p.g),x(p.h));if(L(p))return p=gt(y,x(p)),new X(x(p.g),p.h);if(y.g.length>30){if(L(y)||L(p))throw Error("slowDivide_ only works with positive integers.");for(var g=R,E=p;E.l(y)<=0;)g=Ot(g),E=Ot(E);var _=_t(g,1),v=_t(E,1);for(E=_t(E,2),g=_t(g,2);!N(E);){var m=v.add(E);m.l(y)<=0&&(_=_.add(g),v=m),E=_t(E,1),g=_t(g,1)}return p=z(y,_.j(p)),new X(_,p)}for(_=w;y.l(p)>=0;){for(g=Math.max(1,Math.floor(y.m()/p.m())),E=Math.ceil(Math.log(g)/Math.LN2),E=E<=48?1:Math.pow(2,E-48),v=d(g),m=v.j(p);L(m)||m.l(y)>0;)g-=E,v=d(g),m=v.j(p);N(v)&&(v=R),_=_.add(v),y=z(y,m)}return new X(_,y)}n.B=function(y){return gt(this,y).h},n.and=function(y){const p=Math.max(this.g.length,y.g.length),g=[];for(let E=0;E<p;E++)g[E]=this.i(E)&y.i(E);return new c(g,this.h&y.h)},n.or=function(y){const p=Math.max(this.g.length,y.g.length),g=[];for(let E=0;E<p;E++)g[E]=this.i(E)|y.i(E);return new c(g,this.h|y.h)},n.xor=function(y){const p=Math.max(this.g.length,y.g.length),g=[];for(let E=0;E<p;E++)g[E]=this.i(E)^y.i(E);return new c(g,this.h^y.h)};function Ot(y){const p=y.g.length+1,g=[];for(let E=0;E<p;E++)g[E]=y.i(E)<<1|y.i(E-1)>>>31;return new c(g,y.h)}function _t(y,p){const g=p>>5;p%=32;const E=y.g.length-g,_=[];for(let v=0;v<E;v++)_[v]=p>0?y.i(v+g)>>>p|y.i(v+g+1)<<32-p:y.i(v+g);return new c(_,y.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,c.prototype.add=c.prototype.add,c.prototype.multiply=c.prototype.j,c.prototype.modulo=c.prototype.B,c.prototype.compare=c.prototype.l,c.prototype.toNumber=c.prototype.m,c.prototype.toString=c.prototype.toString,c.prototype.getBits=c.prototype.i,c.fromNumber=d,c.fromString=T,Rs=c}).apply(typeof _o<"u"?_o:typeof self<"u"?self:typeof window<"u"?window:{});var Un=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var wa,Ze,Aa,Hn,as,Ra,Sa,ba;(function(){var n,t=Object.defineProperty;function e(s){s=[typeof globalThis=="object"&&globalThis,s,typeof window=="object"&&window,typeof self=="object"&&self,typeof Un=="object"&&Un];for(var a=0;a<s.length;++a){var l=s[a];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var r=e(this);function i(s,a){if(a)t:{var l=r;s=s.split(".");for(var h=0;h<s.length-1;h++){var I=s[h];if(!(I in l))break t;l=l[I]}s=s[s.length-1],h=l[s],a=a(h),a!=h&&a!=null&&t(l,s,{configurable:!0,writable:!0,value:a})}}i("Symbol.dispose",function(s){return s||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(s){return s||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(s){return s||function(a){var l=[],h;for(h in a)Object.prototype.hasOwnProperty.call(a,h)&&l.push([h,a[h]]);return l}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},c=this||self;function u(s){var a=typeof s;return a=="object"&&s!=null||a=="function"}function f(s,a,l){return s.call.apply(s.bind,arguments)}function d(s,a,l){return d=f,d.apply(null,arguments)}function T(s,a){var l=Array.prototype.slice.call(arguments,1);return function(){var h=l.slice();return h.push.apply(h,arguments),s.apply(this,h)}}function w(s,a){function l(){}l.prototype=a.prototype,s.Z=a.prototype,s.prototype=new l,s.prototype.constructor=s,s.Ob=function(h,I,A){for(var C=Array(arguments.length-2),k=2;k<arguments.length;k++)C[k-2]=arguments[k];return a.prototype[I].apply(h,C)}}var R=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?s=>s&&AsyncContext.Snapshot.wrap(s):s=>s;function V(s){const a=s.length;if(a>0){const l=Array(a);for(let h=0;h<a;h++)l[h]=s[h];return l}return[]}function N(s,a){for(let h=1;h<arguments.length;h++){const I=arguments[h];var l=typeof I;if(l=l!="object"?l:I?Array.isArray(I)?"array":l:"null",l=="array"||l=="object"&&typeof I.length=="number"){l=s.length||0;const A=I.length||0;s.length=l+A;for(let C=0;C<A;C++)s[l+C]=I[C]}else s.push(I)}}class L{constructor(a,l){this.i=a,this.j=l,this.h=0,this.g=null}get(){let a;return this.h>0?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.i(),a}}function x(s){c.setTimeout(()=>{throw s},0)}function z(){var s=y;let a=null;return s.g&&(a=s.g,s.g=s.g.next,s.g||(s.h=null),a.next=null),a}class H{constructor(){this.h=this.g=null}add(a,l){const h=X.get();h.set(a,l),this.h?this.h.next=h:this.g=h,this.h=h}}var X=new L(()=>new gt,s=>s.reset());class gt{constructor(){this.next=this.g=this.h=null}set(a,l){this.h=a,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let Ot,_t=!1,y=new H,p=()=>{const s=Promise.resolve(void 0);Ot=()=>{s.then(g)}};function g(){for(var s;s=z();){try{s.h.call(s.g)}catch(l){x(l)}var a=X;a.j(s),a.h<100&&(a.h++,s.next=a.g,a.g=s)}_t=!1}function E(){this.u=this.u,this.C=this.C}E.prototype.u=!1,E.prototype.dispose=function(){this.u||(this.u=!0,this.N())},E.prototype[Symbol.dispose]=function(){this.dispose()},E.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function _(s,a){this.type=s,this.g=this.target=a,this.defaultPrevented=!1}_.prototype.h=function(){this.defaultPrevented=!0};var v=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var s=!1,a=Object.defineProperty({},"passive",{get:function(){s=!0}});try{const l=()=>{};c.addEventListener("test",l,a),c.removeEventListener("test",l,a)}catch{}return s}();function m(s){return/^[\s\xa0]*$/.test(s)}function yt(s,a){_.call(this,s?s.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,s&&this.init(s,a)}w(yt,_),yt.prototype.init=function(s,a){const l=this.type=s.type,h=s.changedTouches&&s.changedTouches.length?s.changedTouches[0]:null;this.target=s.target||s.srcElement,this.g=a,a=s.relatedTarget,a||(l=="mouseover"?a=s.fromElement:l=="mouseout"&&(a=s.toElement)),this.relatedTarget=a,h?(this.clientX=h.clientX!==void 0?h.clientX:h.pageX,this.clientY=h.clientY!==void 0?h.clientY:h.pageY,this.screenX=h.screenX||0,this.screenY=h.screenY||0):(this.clientX=s.clientX!==void 0?s.clientX:s.pageX,this.clientY=s.clientY!==void 0?s.clientY:s.pageY,this.screenX=s.screenX||0,this.screenY=s.screenY||0),this.button=s.button,this.key=s.key||"",this.ctrlKey=s.ctrlKey,this.altKey=s.altKey,this.shiftKey=s.shiftKey,this.metaKey=s.metaKey,this.pointerId=s.pointerId||0,this.pointerType=s.pointerType,this.state=s.state,this.i=s,s.defaultPrevented&&yt.Z.h.call(this)},yt.prototype.h=function(){yt.Z.h.call(this);const s=this.i;s.preventDefault?s.preventDefault():s.returnValue=!1};var Zt="closure_listenable_"+(Math.random()*1e6|0),Yc=0;function Zc(s,a,l,h,I){this.listener=s,this.proxy=null,this.src=a,this.type=l,this.capture=!!h,this.ha=I,this.key=++Yc,this.da=this.fa=!1}function An(s){s.da=!0,s.listener=null,s.proxy=null,s.src=null,s.ha=null}function Rn(s,a,l){for(const h in s)a.call(l,s[h],h,s)}function tl(s,a){for(const l in s)a.call(void 0,s[l],l,s)}function ri(s){const a={};for(const l in s)a[l]=s[l];return a}const si="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function ii(s,a){let l,h;for(let I=1;I<arguments.length;I++){h=arguments[I];for(l in h)s[l]=h[l];for(let A=0;A<si.length;A++)l=si[A],Object.prototype.hasOwnProperty.call(h,l)&&(s[l]=h[l])}}function Sn(s){this.src=s,this.g={},this.h=0}Sn.prototype.add=function(s,a,l,h,I){const A=s.toString();s=this.g[A],s||(s=this.g[A]=[],this.h++);const C=vr(s,a,h,I);return C>-1?(a=s[C],l||(a.fa=!1)):(a=new Zc(a,this.src,A,!!h,I),a.fa=l,s.push(a)),a};function Ir(s,a){const l=a.type;if(l in s.g){var h=s.g[l],I=Array.prototype.indexOf.call(h,a,void 0),A;(A=I>=0)&&Array.prototype.splice.call(h,I,1),A&&(An(a),s.g[l].length==0&&(delete s.g[l],s.h--))}}function vr(s,a,l,h){for(let I=0;I<s.length;++I){const A=s[I];if(!A.da&&A.listener==a&&A.capture==!!l&&A.ha==h)return I}return-1}var wr="closure_lm_"+(Math.random()*1e6|0),Ar={};function oi(s,a,l,h,I){if(Array.isArray(a)){for(let A=0;A<a.length;A++)oi(s,a[A],l,h,I);return null}return l=li(l),s&&s[Zt]?s.J(a,l,u(h)?!!h.capture:!1,I):el(s,a,l,!1,h,I)}function el(s,a,l,h,I,A){if(!a)throw Error("Invalid event type");const C=u(I)?!!I.capture:!!I;let k=Sr(s);if(k||(s[wr]=k=new Sn(s)),l=k.add(a,l,h,C,A),l.proxy)return l;if(h=nl(),l.proxy=h,h.src=s,h.listener=l,s.addEventListener)v||(I=C),I===void 0&&(I=!1),s.addEventListener(a.toString(),h,I);else if(s.attachEvent)s.attachEvent(ci(a.toString()),h);else if(s.addListener&&s.removeListener)s.addListener(h);else throw Error("addEventListener and attachEvent are unavailable.");return l}function nl(){function s(l){return a.call(s.src,s.listener,l)}const a=rl;return s}function ai(s,a,l,h,I){if(Array.isArray(a))for(var A=0;A<a.length;A++)ai(s,a[A],l,h,I);else h=u(h)?!!h.capture:!!h,l=li(l),s&&s[Zt]?(s=s.i,A=String(a).toString(),A in s.g&&(a=s.g[A],l=vr(a,l,h,I),l>-1&&(An(a[l]),Array.prototype.splice.call(a,l,1),a.length==0&&(delete s.g[A],s.h--)))):s&&(s=Sr(s))&&(a=s.g[a.toString()],s=-1,a&&(s=vr(a,l,h,I)),(l=s>-1?a[s]:null)&&Rr(l))}function Rr(s){if(typeof s!="number"&&s&&!s.da){var a=s.src;if(a&&a[Zt])Ir(a.i,s);else{var l=s.type,h=s.proxy;a.removeEventListener?a.removeEventListener(l,h,s.capture):a.detachEvent?a.detachEvent(ci(l),h):a.addListener&&a.removeListener&&a.removeListener(h),(l=Sr(a))?(Ir(l,s),l.h==0&&(l.src=null,a[wr]=null)):An(s)}}}function ci(s){return s in Ar?Ar[s]:Ar[s]="on"+s}function rl(s,a){if(s.da)s=!0;else{a=new yt(a,this);const l=s.listener,h=s.ha||s.src;s.fa&&Rr(s),s=l.call(h,a)}return s}function Sr(s){return s=s[wr],s instanceof Sn?s:null}var br="__closure_events_fn_"+(Math.random()*1e9>>>0);function li(s){return typeof s=="function"?s:(s[br]||(s[br]=function(a){return s.handleEvent(a)}),s[br])}function ct(){E.call(this),this.i=new Sn(this),this.M=this,this.G=null}w(ct,E),ct.prototype[Zt]=!0,ct.prototype.removeEventListener=function(s,a,l,h){ai(this,s,a,l,h)};function dt(s,a){var l,h=s.G;if(h)for(l=[];h;h=h.G)l.push(h);if(s=s.M,h=a.type||a,typeof a=="string")a=new _(a,s);else if(a instanceof _)a.target=a.target||s;else{var I=a;a=new _(h,s),ii(a,I)}I=!0;let A,C;if(l)for(C=l.length-1;C>=0;C--)A=a.g=l[C],I=bn(A,h,!0,a)&&I;if(A=a.g=s,I=bn(A,h,!0,a)&&I,I=bn(A,h,!1,a)&&I,l)for(C=0;C<l.length;C++)A=a.g=l[C],I=bn(A,h,!1,a)&&I}ct.prototype.N=function(){if(ct.Z.N.call(this),this.i){var s=this.i;for(const a in s.g){const l=s.g[a];for(let h=0;h<l.length;h++)An(l[h]);delete s.g[a],s.h--}}this.G=null},ct.prototype.J=function(s,a,l,h){return this.i.add(String(s),a,!1,l,h)},ct.prototype.K=function(s,a,l,h){return this.i.add(String(s),a,!0,l,h)};function bn(s,a,l,h){if(a=s.i.g[String(a)],!a)return!0;a=a.concat();let I=!0;for(let A=0;A<a.length;++A){const C=a[A];if(C&&!C.da&&C.capture==l){const k=C.listener,tt=C.ha||C.src;C.fa&&Ir(s.i,C),I=k.call(tt,h)!==!1&&I}}return I&&!h.defaultPrevented}function sl(s,a){if(typeof s!="function")if(s&&typeof s.handleEvent=="function")s=d(s.handleEvent,s);else throw Error("Invalid listener argument");return Number(a)>2147483647?-1:c.setTimeout(s,a||0)}function ui(s){s.g=sl(()=>{s.g=null,s.i&&(s.i=!1,ui(s))},s.l);const a=s.h;s.h=null,s.m.apply(null,a)}class il extends E{constructor(a,l){super(),this.m=a,this.l=l,this.h=null,this.i=!1,this.g=null}j(a){this.h=arguments,this.g?this.i=!0:ui(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function xe(s){E.call(this),this.h=s,this.g={}}w(xe,E);var hi=[];function fi(s){Rn(s.g,function(a,l){this.g.hasOwnProperty(l)&&Rr(a)},s),s.g={}}xe.prototype.N=function(){xe.Z.N.call(this),fi(this)},xe.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Cr=c.JSON.stringify,ol=c.JSON.parse,al=class{stringify(s){return c.JSON.stringify(s,void 0)}parse(s){return c.JSON.parse(s,void 0)}};function di(){}function pi(){}var Me={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Pr(){_.call(this,"d")}w(Pr,_);function Vr(){_.call(this,"c")}w(Vr,_);var te={},mi=null;function Cn(){return mi=mi||new ct}te.Ia="serverreachability";function gi(s){_.call(this,te.Ia,s)}w(gi,_);function Le(s){const a=Cn();dt(a,new gi(a))}te.STAT_EVENT="statevent";function _i(s,a){_.call(this,te.STAT_EVENT,s),this.stat=a}w(_i,_);function pt(s){const a=Cn();dt(a,new _i(a,s))}te.Ja="timingevent";function yi(s,a){_.call(this,te.Ja,s),this.size=a}w(yi,_);function Fe(s,a){if(typeof s!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){s()},a)}function Ue(){this.g=!0}Ue.prototype.ua=function(){this.g=!1};function cl(s,a,l,h,I,A){s.info(function(){if(s.g)if(A){var C="",k=A.split("&");for(let j=0;j<k.length;j++){var tt=k[j].split("=");if(tt.length>1){const et=tt[0];tt=tt[1];const Ct=et.split("_");C=Ct.length>=2&&Ct[1]=="type"?C+(et+"="+tt+"&"):C+(et+"=redacted&")}}}else C=null;else C=A;return"XMLHTTP REQ ("+h+") [attempt "+I+"]: "+a+`
`+l+`
`+C})}function ll(s,a,l,h,I,A,C){s.info(function(){return"XMLHTTP RESP ("+h+") [ attempt "+I+"]: "+a+`
`+l+`
`+A+" "+C})}function Ee(s,a,l,h){s.info(function(){return"XMLHTTP TEXT ("+a+"): "+hl(s,l)+(h?" "+h:"")})}function ul(s,a){s.info(function(){return"TIMEOUT: "+a})}Ue.prototype.info=function(){};function hl(s,a){if(!s.g)return a;if(!a)return null;try{const A=JSON.parse(a);if(A){for(s=0;s<A.length;s++)if(Array.isArray(A[s])){var l=A[s];if(!(l.length<2)){var h=l[1];if(Array.isArray(h)&&!(h.length<1)){var I=h[0];if(I!="noop"&&I!="stop"&&I!="close")for(let C=1;C<h.length;C++)h[C]=""}}}}return Cr(A)}catch{return a}}var Pn={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Ei={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Ti;function Dr(){}w(Dr,di),Dr.prototype.g=function(){return new XMLHttpRequest},Ti=new Dr;function Be(s){return encodeURIComponent(String(s))}function fl(s){var a=1;s=s.split(":");const l=[];for(;a>0&&s.length;)l.push(s.shift()),a--;return s.length&&l.push(s.join(":")),l}function Ut(s,a,l,h){this.j=s,this.i=a,this.l=l,this.S=h||1,this.V=new xe(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Ii}function Ii(){this.i=null,this.g="",this.h=!1}var vi={},Nr={};function kr(s,a,l){s.M=1,s.A=Dn(bt(a)),s.u=l,s.R=!0,wi(s,null)}function wi(s,a){s.F=Date.now(),Vn(s),s.B=bt(s.A);var l=s.B,h=s.S;Array.isArray(h)||(h=[String(h)]),Mi(l.i,"t",h),s.C=0,l=s.j.L,s.h=new Ii,s.g=to(s.j,l?a:null,!s.u),s.P>0&&(s.O=new il(d(s.Y,s,s.g),s.P)),a=s.V,l=s.g,h=s.ba;var I="readystatechange";Array.isArray(I)||(I&&(hi[0]=I.toString()),I=hi);for(let A=0;A<I.length;A++){const C=oi(l,I[A],h||a.handleEvent,!1,a.h||a);if(!C)break;a.g[C.key]=C}a=s.J?ri(s.J):{},s.u?(s.v||(s.v="POST"),a["Content-Type"]="application/x-www-form-urlencoded",s.g.ea(s.B,s.v,s.u,a)):(s.v="GET",s.g.ea(s.B,s.v,null,a)),Le(),cl(s.i,s.v,s.B,s.l,s.S,s.u)}Ut.prototype.ba=function(s){s=s.target;const a=this.O;a&&$t(s)==3?a.j():this.Y(s)},Ut.prototype.Y=function(s){try{if(s==this.g)t:{const k=$t(this.g),tt=this.g.ya(),j=this.g.ca();if(!(k<3)&&(k!=3||this.g&&(this.h.h||this.g.la()||qi(this.g)))){this.K||k!=4||tt==7||(tt==8||j<=0?Le(3):Le(2)),Or(this);var a=this.g.ca();this.X=a;var l=dl(this);if(this.o=a==200,ll(this.i,this.v,this.B,this.l,this.S,k,a),this.o){if(this.U&&!this.L){e:{if(this.g){var h,I=this.g;if((h=I.g?I.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!m(h)){var A=h;break e}}A=null}if(s=A)Ee(this.i,this.l,s,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,xr(this,s);else{this.o=!1,this.m=3,pt(12),ee(this),je(this);break t}}if(this.R){s=!0;let et;for(;!this.K&&this.C<l.length;)if(et=pl(this,l),et==Nr){k==4&&(this.m=4,pt(14),s=!1),Ee(this.i,this.l,null,"[Incomplete Response]");break}else if(et==vi){this.m=4,pt(15),Ee(this.i,this.l,l,"[Invalid Chunk]"),s=!1;break}else Ee(this.i,this.l,et,null),xr(this,et);if(Ai(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),k!=4||l.length!=0||this.h.h||(this.m=1,pt(16),s=!1),this.o=this.o&&s,!s)Ee(this.i,this.l,l,"[Invalid Chunked Response]"),ee(this),je(this);else if(l.length>0&&!this.W){this.W=!0;var C=this.j;C.g==this&&C.aa&&!C.P&&(C.j.info("Great, no buffering proxy detected. Bytes received: "+l.length),qr(C),C.P=!0,pt(11))}}else Ee(this.i,this.l,l,null),xr(this,l);k==4&&ee(this),this.o&&!this.K&&(k==4?Ji(this.j,this):(this.o=!1,Vn(this)))}else Cl(this.g),a==400&&l.indexOf("Unknown SID")>0?(this.m=3,pt(12)):(this.m=0,pt(13)),ee(this),je(this)}}}catch{}finally{}};function dl(s){if(!Ai(s))return s.g.la();const a=qi(s.g);if(a==="")return"";let l="";const h=a.length,I=$t(s.g)==4;if(!s.h.i){if(typeof TextDecoder>"u")return ee(s),je(s),"";s.h.i=new c.TextDecoder}for(let A=0;A<h;A++)s.h.h=!0,l+=s.h.i.decode(a[A],{stream:!(I&&A==h-1)});return a.length=0,s.h.g+=l,s.C=0,s.h.g}function Ai(s){return s.g?s.v=="GET"&&s.M!=2&&s.j.Aa:!1}function pl(s,a){var l=s.C,h=a.indexOf(`
`,l);return h==-1?Nr:(l=Number(a.substring(l,h)),isNaN(l)?vi:(h+=1,h+l>a.length?Nr:(a=a.slice(h,h+l),s.C=h+l,a)))}Ut.prototype.cancel=function(){this.K=!0,ee(this)};function Vn(s){s.T=Date.now()+s.H,Ri(s,s.H)}function Ri(s,a){if(s.D!=null)throw Error("WatchDog timer not null");s.D=Fe(d(s.aa,s),a)}function Or(s){s.D&&(c.clearTimeout(s.D),s.D=null)}Ut.prototype.aa=function(){this.D=null;const s=Date.now();s-this.T>=0?(ul(this.i,this.B),this.M!=2&&(Le(),pt(17)),ee(this),this.m=2,je(this)):Ri(this,this.T-s)};function je(s){s.j.I==0||s.K||Ji(s.j,s)}function ee(s){Or(s);var a=s.O;a&&typeof a.dispose=="function"&&a.dispose(),s.O=null,fi(s.V),s.g&&(a=s.g,s.g=null,a.abort(),a.dispose())}function xr(s,a){try{var l=s.j;if(l.I!=0&&(l.g==s||Mr(l.h,s))){if(!s.L&&Mr(l.h,s)&&l.I==3){try{var h=l.Ba.g.parse(a)}catch{h=null}if(Array.isArray(h)&&h.length==3){var I=h;if(I[0]==0){t:if(!l.v){if(l.g)if(l.g.F+3e3<s.F)Mn(l),On(l);else break t;$r(l),pt(18)}}else l.xa=I[1],0<l.xa-l.K&&I[2]<37500&&l.F&&l.A==0&&!l.C&&(l.C=Fe(d(l.Va,l),6e3));Ci(l.h)<=1&&l.ta&&(l.ta=void 0)}else re(l,11)}else if((s.L||l.g==s)&&Mn(l),!m(a))for(I=l.Ba.g.parse(a),a=0;a<I.length;a++){let j=I[a];const et=j[0];if(!(et<=l.K))if(l.K=et,j=j[1],l.I==2)if(j[0]=="c"){l.M=j[1],l.ba=j[2];const Ct=j[3];Ct!=null&&(l.ka=Ct,l.j.info("VER="+l.ka));const se=j[4];se!=null&&(l.za=se,l.j.info("SVER="+l.za));const qt=j[5];qt!=null&&typeof qt=="number"&&qt>0&&(h=1.5*qt,l.O=h,l.j.info("backChannelRequestTimeoutMs_="+h)),h=l;const zt=s.g;if(zt){const Fn=zt.g?zt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Fn){var A=h.h;A.g||Fn.indexOf("spdy")==-1&&Fn.indexOf("quic")==-1&&Fn.indexOf("h2")==-1||(A.j=A.l,A.g=new Set,A.h&&(Lr(A,A.h),A.h=null))}if(h.G){const zr=zt.g?zt.g.getResponseHeader("X-HTTP-Session-Id"):null;zr&&(h.wa=zr,q(h.J,h.G,zr))}}l.I=3,l.l&&l.l.ra(),l.aa&&(l.T=Date.now()-s.F,l.j.info("Handshake RTT: "+l.T+"ms")),h=l;var C=s;if(h.na=Zi(h,h.L?h.ba:null,h.W),C.L){Pi(h.h,C);var k=C,tt=h.O;tt&&(k.H=tt),k.D&&(Or(k),Vn(k)),h.g=C}else Wi(h);l.i.length>0&&xn(l)}else j[0]!="stop"&&j[0]!="close"||re(l,7);else l.I==3&&(j[0]=="stop"||j[0]=="close"?j[0]=="stop"?re(l,7):jr(l):j[0]!="noop"&&l.l&&l.l.qa(j),l.A=0)}}Le(4)}catch{}}var ml=class{constructor(s,a){this.g=s,this.map=a}};function Si(s){this.l=s||10,c.PerformanceNavigationTiming?(s=c.performance.getEntriesByType("navigation"),s=s.length>0&&(s[0].nextHopProtocol=="hq"||s[0].nextHopProtocol=="h2")):s=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=s?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function bi(s){return s.h?!0:s.g?s.g.size>=s.j:!1}function Ci(s){return s.h?1:s.g?s.g.size:0}function Mr(s,a){return s.h?s.h==a:s.g?s.g.has(a):!1}function Lr(s,a){s.g?s.g.add(a):s.h=a}function Pi(s,a){s.h&&s.h==a?s.h=null:s.g&&s.g.has(a)&&s.g.delete(a)}Si.prototype.cancel=function(){if(this.i=Vi(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const s of this.g.values())s.cancel();this.g.clear()}};function Vi(s){if(s.h!=null)return s.i.concat(s.h.G);if(s.g!=null&&s.g.size!==0){let a=s.i;for(const l of s.g.values())a=a.concat(l.G);return a}return V(s.i)}var Di=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function gl(s,a){if(s){s=s.split("&");for(let l=0;l<s.length;l++){const h=s[l].indexOf("=");let I,A=null;h>=0?(I=s[l].substring(0,h),A=s[l].substring(h+1)):I=s[l],a(I,A?decodeURIComponent(A.replace(/\+/g," ")):"")}}}function Bt(s){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let a;s instanceof Bt?(this.l=s.l,$e(this,s.j),this.o=s.o,this.g=s.g,qe(this,s.u),this.h=s.h,Fr(this,Li(s.i)),this.m=s.m):s&&(a=String(s).match(Di))?(this.l=!1,$e(this,a[1]||"",!0),this.o=ze(a[2]||""),this.g=ze(a[3]||"",!0),qe(this,a[4]),this.h=ze(a[5]||"",!0),Fr(this,a[6]||"",!0),this.m=ze(a[7]||"")):(this.l=!1,this.i=new Ge(null,this.l))}Bt.prototype.toString=function(){const s=[];var a=this.j;a&&s.push(He(a,Ni,!0),":");var l=this.g;return(l||a=="file")&&(s.push("//"),(a=this.o)&&s.push(He(a,Ni,!0),"@"),s.push(Be(l).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.u,l!=null&&s.push(":",String(l))),(l=this.h)&&(this.g&&l.charAt(0)!="/"&&s.push("/"),s.push(He(l,l.charAt(0)=="/"?El:yl,!0))),(l=this.i.toString())&&s.push("?",l),(l=this.m)&&s.push("#",He(l,Il)),s.join("")},Bt.prototype.resolve=function(s){const a=bt(this);let l=!!s.j;l?$e(a,s.j):l=!!s.o,l?a.o=s.o:l=!!s.g,l?a.g=s.g:l=s.u!=null;var h=s.h;if(l)qe(a,s.u);else if(l=!!s.h){if(h.charAt(0)!="/")if(this.g&&!this.h)h="/"+h;else{var I=a.h.lastIndexOf("/");I!=-1&&(h=a.h.slice(0,I+1)+h)}if(I=h,I==".."||I==".")h="";else if(I.indexOf("./")!=-1||I.indexOf("/.")!=-1){h=I.lastIndexOf("/",0)==0,I=I.split("/");const A=[];for(let C=0;C<I.length;){const k=I[C++];k=="."?h&&C==I.length&&A.push(""):k==".."?((A.length>1||A.length==1&&A[0]!="")&&A.pop(),h&&C==I.length&&A.push("")):(A.push(k),h=!0)}h=A.join("/")}else h=I}return l?a.h=h:l=s.i.toString()!=="",l?Fr(a,Li(s.i)):l=!!s.m,l&&(a.m=s.m),a};function bt(s){return new Bt(s)}function $e(s,a,l){s.j=l?ze(a,!0):a,s.j&&(s.j=s.j.replace(/:$/,""))}function qe(s,a){if(a){if(a=Number(a),isNaN(a)||a<0)throw Error("Bad port number "+a);s.u=a}else s.u=null}function Fr(s,a,l){a instanceof Ge?(s.i=a,vl(s.i,s.l)):(l||(a=He(a,Tl)),s.i=new Ge(a,s.l))}function q(s,a,l){s.i.set(a,l)}function Dn(s){return q(s,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),s}function ze(s,a){return s?a?decodeURI(s.replace(/%25/g,"%2525")):decodeURIComponent(s):""}function He(s,a,l){return typeof s=="string"?(s=encodeURI(s).replace(a,_l),l&&(s=s.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),s):null}function _l(s){return s=s.charCodeAt(0),"%"+(s>>4&15).toString(16)+(s&15).toString(16)}var Ni=/[#\/\?@]/g,yl=/[#\?:]/g,El=/[#\?]/g,Tl=/[#\?@]/g,Il=/#/g;function Ge(s,a){this.h=this.g=null,this.i=s||null,this.j=!!a}function ne(s){s.g||(s.g=new Map,s.h=0,s.i&&gl(s.i,function(a,l){s.add(decodeURIComponent(a.replace(/\+/g," ")),l)}))}n=Ge.prototype,n.add=function(s,a){ne(this),this.i=null,s=Te(this,s);let l=this.g.get(s);return l||this.g.set(s,l=[]),l.push(a),this.h+=1,this};function ki(s,a){ne(s),a=Te(s,a),s.g.has(a)&&(s.i=null,s.h-=s.g.get(a).length,s.g.delete(a))}function Oi(s,a){return ne(s),a=Te(s,a),s.g.has(a)}n.forEach=function(s,a){ne(this),this.g.forEach(function(l,h){l.forEach(function(I){s.call(a,I,h,this)},this)},this)};function xi(s,a){ne(s);let l=[];if(typeof a=="string")Oi(s,a)&&(l=l.concat(s.g.get(Te(s,a))));else for(s=Array.from(s.g.values()),a=0;a<s.length;a++)l=l.concat(s[a]);return l}n.set=function(s,a){return ne(this),this.i=null,s=Te(this,s),Oi(this,s)&&(this.h-=this.g.get(s).length),this.g.set(s,[a]),this.h+=1,this},n.get=function(s,a){return s?(s=xi(this,s),s.length>0?String(s[0]):a):a};function Mi(s,a,l){ki(s,a),l.length>0&&(s.i=null,s.g.set(Te(s,a),V(l)),s.h+=l.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const s=[],a=Array.from(this.g.keys());for(let h=0;h<a.length;h++){var l=a[h];const I=Be(l);l=xi(this,l);for(let A=0;A<l.length;A++){let C=I;l[A]!==""&&(C+="="+Be(l[A])),s.push(C)}}return this.i=s.join("&")};function Li(s){const a=new Ge;return a.i=s.i,s.g&&(a.g=new Map(s.g),a.h=s.h),a}function Te(s,a){return a=String(a),s.j&&(a=a.toLowerCase()),a}function vl(s,a){a&&!s.j&&(ne(s),s.i=null,s.g.forEach(function(l,h){const I=h.toLowerCase();h!=I&&(ki(this,h),Mi(this,I,l))},s)),s.j=a}function wl(s,a){const l=new Ue;if(c.Image){const h=new Image;h.onload=T(jt,l,"TestLoadImage: loaded",!0,a,h),h.onerror=T(jt,l,"TestLoadImage: error",!1,a,h),h.onabort=T(jt,l,"TestLoadImage: abort",!1,a,h),h.ontimeout=T(jt,l,"TestLoadImage: timeout",!1,a,h),c.setTimeout(function(){h.ontimeout&&h.ontimeout()},1e4),h.src=s}else a(!1)}function Al(s,a){const l=new Ue,h=new AbortController,I=setTimeout(()=>{h.abort(),jt(l,"TestPingServer: timeout",!1,a)},1e4);fetch(s,{signal:h.signal}).then(A=>{clearTimeout(I),A.ok?jt(l,"TestPingServer: ok",!0,a):jt(l,"TestPingServer: server error",!1,a)}).catch(()=>{clearTimeout(I),jt(l,"TestPingServer: error",!1,a)})}function jt(s,a,l,h,I){try{I&&(I.onload=null,I.onerror=null,I.onabort=null,I.ontimeout=null),h(l)}catch{}}function Rl(){this.g=new al}function Ur(s){this.i=s.Sb||null,this.h=s.ab||!1}w(Ur,di),Ur.prototype.g=function(){return new Nn(this.i,this.h)};function Nn(s,a){ct.call(this),this.H=s,this.o=a,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}w(Nn,ct),n=Nn.prototype,n.open=function(s,a){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=s,this.D=a,this.readyState=1,We(this)},n.send=function(s){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const a={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};s&&(a.body=s),(this.H||c).fetch(new Request(this.D,a)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Ke(this)),this.readyState=0},n.Pa=function(s){if(this.g&&(this.l=s,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=s.headers,this.readyState=2,We(this)),this.g&&(this.readyState=3,We(this),this.g)))if(this.responseType==="arraybuffer")s.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in s){if(this.j=s.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Fi(this)}else s.text().then(this.Oa.bind(this),this.ga.bind(this))};function Fi(s){s.j.read().then(s.Ma.bind(s)).catch(s.ga.bind(s))}n.Ma=function(s){if(this.g){if(this.o&&s.value)this.response.push(s.value);else if(!this.o){var a=s.value?s.value:new Uint8Array(0);(a=this.B.decode(a,{stream:!s.done}))&&(this.response=this.responseText+=a)}s.done?Ke(this):We(this),this.readyState==3&&Fi(this)}},n.Oa=function(s){this.g&&(this.response=this.responseText=s,Ke(this))},n.Na=function(s){this.g&&(this.response=s,Ke(this))},n.ga=function(){this.g&&Ke(this)};function Ke(s){s.readyState=4,s.l=null,s.j=null,s.B=null,We(s)}n.setRequestHeader=function(s,a){this.A.append(s,a)},n.getResponseHeader=function(s){return this.h&&this.h.get(s.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const s=[],a=this.h.entries();for(var l=a.next();!l.done;)l=l.value,s.push(l[0]+": "+l[1]),l=a.next();return s.join(`\r
`)};function We(s){s.onreadystatechange&&s.onreadystatechange.call(s)}Object.defineProperty(Nn.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(s){this.m=s?"include":"same-origin"}});function Ui(s){let a="";return Rn(s,function(l,h){a+=h,a+=":",a+=l,a+=`\r
`}),a}function Br(s,a,l){t:{for(h in l){var h=!1;break t}h=!0}h||(l=Ui(l),typeof s=="string"?l!=null&&Be(l):q(s,a,l))}function W(s){ct.call(this),this.headers=new Map,this.L=s||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}w(W,ct);var Sl=/^https?$/i,bl=["POST","PUT"];n=W.prototype,n.Fa=function(s){this.H=s},n.ea=function(s,a,l,h){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+s);a=a?a.toUpperCase():"GET",this.D=s,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Ti.g(),this.g.onreadystatechange=R(d(this.Ca,this));try{this.B=!0,this.g.open(a,String(s),!0),this.B=!1}catch(A){Bi(this,A);return}if(s=l||"",l=new Map(this.headers),h)if(Object.getPrototypeOf(h)===Object.prototype)for(var I in h)l.set(I,h[I]);else if(typeof h.keys=="function"&&typeof h.get=="function")for(const A of h.keys())l.set(A,h.get(A));else throw Error("Unknown input type for opt_headers: "+String(h));h=Array.from(l.keys()).find(A=>A.toLowerCase()=="content-type"),I=c.FormData&&s instanceof c.FormData,!(Array.prototype.indexOf.call(bl,a,void 0)>=0)||h||I||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[A,C]of l)this.g.setRequestHeader(A,C);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(s),this.v=!1}catch(A){Bi(this,A)}};function Bi(s,a){s.h=!1,s.g&&(s.j=!0,s.g.abort(),s.j=!1),s.l=a,s.o=5,ji(s),kn(s)}function ji(s){s.A||(s.A=!0,dt(s,"complete"),dt(s,"error"))}n.abort=function(s){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=s||7,dt(this,"complete"),dt(this,"abort"),kn(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),kn(this,!0)),W.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?$i(this):this.Xa())},n.Xa=function(){$i(this)};function $i(s){if(s.h&&typeof o<"u"){if(s.v&&$t(s)==4)setTimeout(s.Ca.bind(s),0);else if(dt(s,"readystatechange"),$t(s)==4){s.h=!1;try{const A=s.ca();t:switch(A){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var a=!0;break t;default:a=!1}var l;if(!(l=a)){var h;if(h=A===0){let C=String(s.D).match(Di)[1]||null;!C&&c.self&&c.self.location&&(C=c.self.location.protocol.slice(0,-1)),h=!Sl.test(C?C.toLowerCase():"")}l=h}if(l)dt(s,"complete"),dt(s,"success");else{s.o=6;try{var I=$t(s)>2?s.g.statusText:""}catch{I=""}s.l=I+" ["+s.ca()+"]",ji(s)}}finally{kn(s)}}}}function kn(s,a){if(s.g){s.m&&(clearTimeout(s.m),s.m=null);const l=s.g;s.g=null,a||dt(s,"ready");try{l.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function $t(s){return s.g?s.g.readyState:0}n.ca=function(){try{return $t(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(s){if(this.g){var a=this.g.responseText;return s&&a.indexOf(s)==0&&(a=a.substring(s.length)),ol(a)}};function qi(s){try{if(!s.g)return null;if("response"in s.g)return s.g.response;switch(s.F){case"":case"text":return s.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in s.g)return s.g.mozResponseArrayBuffer}return null}catch{return null}}function Cl(s){const a={};s=(s.g&&$t(s)>=2&&s.g.getAllResponseHeaders()||"").split(`\r
`);for(let h=0;h<s.length;h++){if(m(s[h]))continue;var l=fl(s[h]);const I=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();const A=a[I]||[];a[I]=A,A.push(l)}tl(a,function(h){return h.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Qe(s,a,l){return l&&l.internalChannelParams&&l.internalChannelParams[s]||a}function zi(s){this.za=0,this.i=[],this.j=new Ue,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Qe("failFast",!1,s),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Qe("baseRetryDelayMs",5e3,s),this.Za=Qe("retryDelaySeedMs",1e4,s),this.Ta=Qe("forwardChannelMaxRetries",2,s),this.va=Qe("forwardChannelRequestTimeoutMs",2e4,s),this.ma=s&&s.xmlHttpFactory||void 0,this.Ua=s&&s.Rb||void 0,this.Aa=s&&s.useFetchStreams||!1,this.O=void 0,this.L=s&&s.supportsCrossDomainXhr||!1,this.M="",this.h=new Si(s&&s.concurrentRequestLimit),this.Ba=new Rl,this.S=s&&s.fastHandshake||!1,this.R=s&&s.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=s&&s.Pb||!1,s&&s.ua&&this.j.ua(),s&&s.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&s&&s.detectBufferingProxy||!1,this.ia=void 0,s&&s.longPollingTimeout&&s.longPollingTimeout>0&&(this.ia=s.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=zi.prototype,n.ka=8,n.I=1,n.connect=function(s,a,l,h){pt(0),this.W=s,this.H=a||{},l&&h!==void 0&&(this.H.OSID=l,this.H.OAID=h),this.F=this.X,this.J=Zi(this,null,this.W),xn(this)};function jr(s){if(Hi(s),s.I==3){var a=s.V++,l=bt(s.J);if(q(l,"SID",s.M),q(l,"RID",a),q(l,"TYPE","terminate"),Je(s,l),a=new Ut(s,s.j,a),a.M=2,a.A=Dn(bt(l)),l=!1,c.navigator&&c.navigator.sendBeacon)try{l=c.navigator.sendBeacon(a.A.toString(),"")}catch{}!l&&c.Image&&(new Image().src=a.A,l=!0),l||(a.g=to(a.j,null),a.g.ea(a.A)),a.F=Date.now(),Vn(a)}Yi(s)}function On(s){s.g&&(qr(s),s.g.cancel(),s.g=null)}function Hi(s){On(s),s.v&&(c.clearTimeout(s.v),s.v=null),Mn(s),s.h.cancel(),s.m&&(typeof s.m=="number"&&c.clearTimeout(s.m),s.m=null)}function xn(s){if(!bi(s.h)&&!s.m){s.m=!0;var a=s.Ea;Ot||p(),_t||(Ot(),_t=!0),y.add(a,s),s.D=0}}function Pl(s,a){return Ci(s.h)>=s.h.j-(s.m?1:0)?!1:s.m?(s.i=a.G.concat(s.i),!0):s.I==1||s.I==2||s.D>=(s.Sa?0:s.Ta)?!1:(s.m=Fe(d(s.Ea,s,a),Xi(s,s.D)),s.D++,!0)}n.Ea=function(s){if(this.m)if(this.m=null,this.I==1){if(!s){this.V=Math.floor(Math.random()*1e5),s=this.V++;const I=new Ut(this,this.j,s);let A=this.o;if(this.U&&(A?(A=ri(A),ii(A,this.U)):A=this.U),this.u!==null||this.R||(I.J=A,A=null),this.S)t:{for(var a=0,l=0;l<this.i.length;l++){e:{var h=this.i[l];if("__data__"in h.map&&(h=h.map.__data__,typeof h=="string")){h=h.length;break e}h=void 0}if(h===void 0)break;if(a+=h,a>4096){a=l;break t}if(a===4096||l===this.i.length-1){a=l+1;break t}}a=1e3}else a=1e3;a=Ki(this,I,a),l=bt(this.J),q(l,"RID",s),q(l,"CVER",22),this.G&&q(l,"X-HTTP-Session-Id",this.G),Je(this,l),A&&(this.R?a="headers="+Be(Ui(A))+"&"+a:this.u&&Br(l,this.u,A)),Lr(this.h,I),this.Ra&&q(l,"TYPE","init"),this.S?(q(l,"$req",a),q(l,"SID","null"),I.U=!0,kr(I,l,null)):kr(I,l,a),this.I=2}}else this.I==3&&(s?Gi(this,s):this.i.length==0||bi(this.h)||Gi(this))};function Gi(s,a){var l;a?l=a.l:l=s.V++;const h=bt(s.J);q(h,"SID",s.M),q(h,"RID",l),q(h,"AID",s.K),Je(s,h),s.u&&s.o&&Br(h,s.u,s.o),l=new Ut(s,s.j,l,s.D+1),s.u===null&&(l.J=s.o),a&&(s.i=a.G.concat(s.i)),a=Ki(s,l,1e3),l.H=Math.round(s.va*.5)+Math.round(s.va*.5*Math.random()),Lr(s.h,l),kr(l,h,a)}function Je(s,a){s.H&&Rn(s.H,function(l,h){q(a,h,l)}),s.l&&Rn({},function(l,h){q(a,h,l)})}function Ki(s,a,l){l=Math.min(s.i.length,l);const h=s.l?d(s.l.Ka,s.l,s):null;t:{var I=s.i;let k=-1;for(;;){const tt=["count="+l];k==-1?l>0?(k=I[0].g,tt.push("ofs="+k)):k=0:tt.push("ofs="+k);let j=!0;for(let et=0;et<l;et++){var A=I[et].g;const Ct=I[et].map;if(A-=k,A<0)k=Math.max(0,I[et].g-100),j=!1;else try{A="req"+A+"_"||"";try{var C=Ct instanceof Map?Ct:Object.entries(Ct);for(const[se,qt]of C){let zt=qt;u(qt)&&(zt=Cr(qt)),tt.push(A+se+"="+encodeURIComponent(zt))}}catch(se){throw tt.push(A+"type="+encodeURIComponent("_badmap")),se}}catch{h&&h(Ct)}}if(j){C=tt.join("&");break t}}C=void 0}return s=s.i.splice(0,l),a.G=s,C}function Wi(s){if(!s.g&&!s.v){s.Y=1;var a=s.Da;Ot||p(),_t||(Ot(),_t=!0),y.add(a,s),s.A=0}}function $r(s){return s.g||s.v||s.A>=3?!1:(s.Y++,s.v=Fe(d(s.Da,s),Xi(s,s.A)),s.A++,!0)}n.Da=function(){if(this.v=null,Qi(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var s=4*this.T;this.j.info("BP detection timer enabled: "+s),this.B=Fe(d(this.Wa,this),s)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,pt(10),On(this),Qi(this))};function qr(s){s.B!=null&&(c.clearTimeout(s.B),s.B=null)}function Qi(s){s.g=new Ut(s,s.j,"rpc",s.Y),s.u===null&&(s.g.J=s.o),s.g.P=0;var a=bt(s.na);q(a,"RID","rpc"),q(a,"SID",s.M),q(a,"AID",s.K),q(a,"CI",s.F?"0":"1"),!s.F&&s.ia&&q(a,"TO",s.ia),q(a,"TYPE","xmlhttp"),Je(s,a),s.u&&s.o&&Br(a,s.u,s.o),s.O&&(s.g.H=s.O);var l=s.g;s=s.ba,l.M=1,l.A=Dn(bt(a)),l.u=null,l.R=!0,wi(l,s)}n.Va=function(){this.C!=null&&(this.C=null,On(this),$r(this),pt(19))};function Mn(s){s.C!=null&&(c.clearTimeout(s.C),s.C=null)}function Ji(s,a){var l=null;if(s.g==a){Mn(s),qr(s),s.g=null;var h=2}else if(Mr(s.h,a))l=a.G,Pi(s.h,a),h=1;else return;if(s.I!=0){if(a.o)if(h==1){l=a.u?a.u.length:0,a=Date.now()-a.F;var I=s.D;h=Cn(),dt(h,new yi(h,l)),xn(s)}else Wi(s);else if(I=a.m,I==3||I==0&&a.X>0||!(h==1&&Pl(s,a)||h==2&&$r(s)))switch(l&&l.length>0&&(a=s.h,a.i=a.i.concat(l)),I){case 1:re(s,5);break;case 4:re(s,10);break;case 3:re(s,6);break;default:re(s,2)}}}function Xi(s,a){let l=s.Qa+Math.floor(Math.random()*s.Za);return s.isActive()||(l*=2),l*a}function re(s,a){if(s.j.info("Error code "+a),a==2){var l=d(s.bb,s),h=s.Ua;const I=!h;h=new Bt(h||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||$e(h,"https"),Dn(h),I?wl(h.toString(),l):Al(h.toString(),l)}else pt(2);s.I=0,s.l&&s.l.pa(a),Yi(s),Hi(s)}n.bb=function(s){s?(this.j.info("Successfully pinged google.com"),pt(2)):(this.j.info("Failed to ping google.com"),pt(1))};function Yi(s){if(s.I=0,s.ja=[],s.l){const a=Vi(s.h);(a.length!=0||s.i.length!=0)&&(N(s.ja,a),N(s.ja,s.i),s.h.i.length=0,V(s.i),s.i.length=0),s.l.oa()}}function Zi(s,a,l){var h=l instanceof Bt?bt(l):new Bt(l);if(h.g!="")a&&(h.g=a+"."+h.g),qe(h,h.u);else{var I=c.location;h=I.protocol,a=a?a+"."+I.hostname:I.hostname,I=+I.port;const A=new Bt(null);h&&$e(A,h),a&&(A.g=a),I&&qe(A,I),l&&(A.h=l),h=A}return l=s.G,a=s.wa,l&&a&&q(h,l,a),q(h,"VER",s.ka),Je(s,h),h}function to(s,a,l){if(a&&!s.L)throw Error("Can't create secondary domain capable XhrIo object.");return a=s.Aa&&!s.ma?new W(new Ur({ab:l})):new W(s.ma),a.Fa(s.L),a}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function eo(){}n=eo.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Ln(){}Ln.prototype.g=function(s,a){return new It(s,a)};function It(s,a){ct.call(this),this.g=new zi(a),this.l=s,this.h=a&&a.messageUrlParams||null,s=a&&a.messageHeaders||null,a&&a.clientProtocolHeaderRequired&&(s?s["X-Client-Protocol"]="webchannel":s={"X-Client-Protocol":"webchannel"}),this.g.o=s,s=a&&a.initMessageHeaders||null,a&&a.messageContentType&&(s?s["X-WebChannel-Content-Type"]=a.messageContentType:s={"X-WebChannel-Content-Type":a.messageContentType}),a&&a.sa&&(s?s["X-WebChannel-Client-Profile"]=a.sa:s={"X-WebChannel-Client-Profile":a.sa}),this.g.U=s,(s=a&&a.Qb)&&!m(s)&&(this.g.u=s),this.A=a&&a.supportsCrossDomainXhr||!1,this.v=a&&a.sendRawJson||!1,(a=a&&a.httpSessionIdParam)&&!m(a)&&(this.g.G=a,s=this.h,s!==null&&a in s&&(s=this.h,a in s&&delete s[a])),this.j=new Ie(this)}w(It,ct),It.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},It.prototype.close=function(){jr(this.g)},It.prototype.o=function(s){var a=this.g;if(typeof s=="string"){var l={};l.__data__=s,s=l}else this.v&&(l={},l.__data__=Cr(s),s=l);a.i.push(new ml(a.Ya++,s)),a.I==3&&xn(a)},It.prototype.N=function(){this.g.l=null,delete this.j,jr(this.g),delete this.g,It.Z.N.call(this)};function no(s){Pr.call(this),s.__headers__&&(this.headers=s.__headers__,this.statusCode=s.__status__,delete s.__headers__,delete s.__status__);var a=s.__sm__;if(a){t:{for(const l in a){s=l;break t}s=void 0}(this.i=s)&&(s=this.i,a=a!==null&&s in a?a[s]:void 0),this.data=a}else this.data=s}w(no,Pr);function ro(){Vr.call(this),this.status=1}w(ro,Vr);function Ie(s){this.g=s}w(Ie,eo),Ie.prototype.ra=function(){dt(this.g,"a")},Ie.prototype.qa=function(s){dt(this.g,new no(s))},Ie.prototype.pa=function(s){dt(this.g,new ro)},Ie.prototype.oa=function(){dt(this.g,"b")},Ln.prototype.createWebChannel=Ln.prototype.g,It.prototype.send=It.prototype.o,It.prototype.open=It.prototype.m,It.prototype.close=It.prototype.close,ba=function(){return new Ln},Sa=function(){return Cn()},Ra=te,as={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Pn.NO_ERROR=0,Pn.TIMEOUT=8,Pn.HTTP_ERROR=6,Hn=Pn,Ei.COMPLETE="complete",Aa=Ei,pi.EventType=Me,Me.OPEN="a",Me.CLOSE="b",Me.ERROR="c",Me.MESSAGE="d",ct.prototype.listen=ct.prototype.J,Ze=pi,W.prototype.listenOnce=W.prototype.K,W.prototype.getLastError=W.prototype.Ha,W.prototype.getLastErrorCode=W.prototype.ya,W.prototype.getStatus=W.prototype.ca,W.prototype.getResponseJson=W.prototype.La,W.prototype.getResponseText=W.prototype.la,W.prototype.send=W.prototype.ea,W.prototype.setWithCredentials=W.prototype.Fa,wa=W}).apply(typeof Un<"u"?Un:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}ut.UNAUTHENTICATED=new ut(null),ut.GOOGLE_CREDENTIALS=new ut("google-credentials-uid"),ut.FIRST_PARTY=new ut("first-party-uid"),ut.MOCK_USER=new ut("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ke="12.10.0";function mh(n){ke=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const he=new ws("@firebase/firestore");function ve(){return he.logLevel}function P(n,...t){if(he.logLevel<=U.DEBUG){const e=t.map(Ss);he.debug(`Firestore (${ke}): ${n}`,...e)}}function fe(n,...t){if(he.logLevel<=U.ERROR){const e=t.map(Ss);he.error(`Firestore (${ke}): ${n}`,...e)}}function ln(n,...t){if(he.logLevel<=U.WARN){const e=t.map(Ss);he.warn(`Firestore (${ke}): ${n}`,...e)}}function Ss(n){if(typeof n=="string")return n;try{return function(e){return JSON.stringify(e)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M(n,t,e){let r="Unexpected state";typeof t=="string"?r=t:e=t,Ca(n,r,e)}function Ca(n,t,e){let r=`FIRESTORE (${ke}) INTERNAL ASSERTION FAILED: ${t} (ID: ${n.toString(16)})`;if(e!==void 0)try{r+=" CONTEXT: "+JSON.stringify(e)}catch{r+=" CONTEXT: "+e}throw fe(r),new Error(r)}function Q(n,t,e,r){let i="Unexpected state";typeof e=="string"?i=e:r=e,n||Ca(t,i,r)}function $(n,t){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class D extends Yt{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ce{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pa{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class gh{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(ut.UNAUTHENTICATED))}shutdown(){}}class _h{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class yh{constructor(t){this.t=t,this.currentUser=ut.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){Q(this.o===void 0,42304);let r=this.i;const i=f=>this.i!==r?(r=this.i,e(f)):Promise.resolve();let o=new ce;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new ce,t.enqueueRetryable(()=>i(this.currentUser))};const c=()=>{const f=o;t.enqueueRetryable(async()=>{await f.promise,await i(this.currentUser)})},u=f=>{P("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=f,this.o&&(this.auth.addAuthTokenListener(this.o),c())};this.t.onInit(f=>u(f)),setTimeout(()=>{if(!this.auth){const f=this.t.getImmediate({optional:!0});f?u(f):(P("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new ce)}},0),c()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(r=>this.i!==t?(P("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Q(typeof r.accessToken=="string",31837,{l:r}),new Pa(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return Q(t===null||typeof t=="string",2055,{h:t}),new ut(t)}}class Eh{constructor(t,e,r){this.P=t,this.T=e,this.I=r,this.type="FirstParty",this.user=ut.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const t=this.A();return t&&this.R.set("Authorization",t),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class Th{constructor(t,e,r){this.P=t,this.T=e,this.I=r}getToken(){return Promise.resolve(new Eh(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable(()=>e(ut.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class yo{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Ih{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,th(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){Q(this.o===void 0,3512);const r=o=>{o.error!=null&&P("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const c=o.token!==this.m;return this.m=o.token,P("FirebaseAppCheckTokenProvider",`Received ${c?"new":"existing"} token.`),c?e(o.token):Promise.resolve()};this.o=o=>{t.enqueueRetryable(()=>r(o))};const i=o=>{P("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(o=>i(o)),setTimeout(()=>{if(!this.appCheck){const o=this.V.getImmediate({optional:!0});o?i(o):P("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new yo(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(e=>e?(Q(typeof e.token=="string",44558,{tokenResult:e}),this.m=e.token,new yo(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vh(n){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(n);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let r=0;r<n;r++)e[r]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bs{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=vh(40);for(let o=0;o<i.length;++o)r.length<20&&i[o]<e&&(r+=t.charAt(i[o]%62))}return r}}function B(n,t){return n<t?-1:n>t?1:0}function cs(n,t){const e=Math.min(n.length,t.length);for(let r=0;r<e;r++){const i=n.charAt(r),o=t.charAt(r);if(i!==o)return Qr(i)===Qr(o)?B(i,o):Qr(i)?1:-1}return B(n.length,t.length)}const wh=55296,Ah=57343;function Qr(n){const t=n.charCodeAt(0);return t>=wh&&t<=Ah}function Ce(n,t,e){return n.length===t.length&&n.every((r,i)=>e(r,t[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eo="__name__";class Pt{constructor(t,e,r){e===void 0?e=0:e>t.length&&M(637,{offset:e,range:t.length}),r===void 0?r=t.length-e:r>t.length-e&&M(1746,{length:r,range:t.length-e}),this.segments=t,this.offset=e,this.len=r}get length(){return this.len}isEqual(t){return Pt.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof Pt?t.forEach(r=>{e.push(r)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,r=this.limit();e<r;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const r=Math.min(t.length,e.length);for(let i=0;i<r;i++){const o=Pt.compareSegments(t.get(i),e.get(i));if(o!==0)return o}return B(t.length,e.length)}static compareSegments(t,e){const r=Pt.isNumericId(t),i=Pt.isNumericId(e);return r&&!i?-1:!r&&i?1:r&&i?Pt.extractNumericId(t).compare(Pt.extractNumericId(e)):cs(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Rs.fromString(t.substring(4,t.length-2))}}class J extends Pt{construct(t,e,r){return new J(t,e,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const r of t){if(r.indexOf("//")>=0)throw new D(b.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);e.push(...r.split("/").filter(i=>i.length>0))}return new J(e)}static emptyPath(){return new J([])}}const Rh=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ot extends Pt{construct(t,e,r){return new ot(t,e,r)}static isValidIdentifier(t){return Rh.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ot.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Eo}static keyField(){return new ot([Eo])}static fromServerFormat(t){const e=[];let r="",i=0;const o=()=>{if(r.length===0)throw new D(b.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(r),r=""};let c=!1;for(;i<t.length;){const u=t[i];if(u==="\\"){if(i+1===t.length)throw new D(b.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const f=t[i+1];if(f!=="\\"&&f!=="."&&f!=="`")throw new D(b.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);r+=f,i+=2}else u==="`"?(c=!c,i++):u!=="."||c?(r+=u,i++):(o(),i++)}if(o(),c)throw new D(b.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new ot(e)}static emptyPath(){return new ot([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(t){this.path=t}static fromPath(t){return new O(J.fromString(t))}static fromName(t){return new O(J.fromString(t).popFirst(5))}static empty(){return new O(J.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&J.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return J.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new O(new J(t.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sh(n,t,e){if(!e)throw new D(b.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${t}.`)}function bh(n,t,e,r){if(t===!0&&r===!0)throw new D(b.INVALID_ARGUMENT,`${n} and ${e} cannot be used together.`)}function To(n){if(!O.isDocumentKey(n))throw new D(b.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Va(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Cs(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const t=function(r){return r.constructor?r.constructor.name:null}(n);return t?`a custom ${t} object`:"an object"}}return typeof n=="function"?"a function":M(12329,{type:typeof n})}function ls(n,t){if("_delegate"in n&&(n=n._delegate),!(n instanceof t)){if(t.name===n.constructor.name)throw new D(b.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=Cs(n);throw new D(b.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z(n,t){const e={typeString:n};return t&&(e.value=t),e}function yn(n,t){if(!Va(n))throw new D(b.INVALID_ARGUMENT,"JSON must be an object");let e;for(const r in t)if(t[r]){const i=t[r].typeString,o="value"in t[r]?{value:t[r].value}:void 0;if(!(r in n)){e=`JSON missing required field: '${r}'`;break}const c=n[r];if(i&&typeof c!==i){e=`JSON field '${r}' must be a ${i}.`;break}if(o!==void 0&&c!==o.value){e=`Expected '${r}' field to equal '${o.value}'`;break}}if(e)throw new D(b.INVALID_ARGUMENT,e);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Io=-62135596800,vo=1e6;class K{static now(){return K.fromMillis(Date.now())}static fromDate(t){return K.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),r=Math.floor((t-1e3*e)*vo);return new K(e,r)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new D(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new D(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<Io)throw new D(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new D(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/vo}_compareTo(t){return this.seconds===t.seconds?B(this.nanoseconds,t.nanoseconds):B(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:K._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(yn(t,K._jsonSchema))return new K(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-Io;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}K._jsonSchemaVersion="firestore/timestamp/1.0",K._jsonSchema={type:Z("string",K._jsonSchemaVersion),seconds:Z("number"),nanoseconds:Z("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{static fromTimestamp(t){return new G(t)}static min(){return new G(new K(0,0))}static max(){return new G(new K(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const un=-1;function Ch(n,t){const e=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=G.fromTimestamp(r===1e9?new K(e+1,0):new K(e,r));return new Wt(i,O.empty(),t)}function Ph(n){return new Wt(n.readTime,n.key,un)}class Wt{constructor(t,e,r){this.readTime=t,this.documentKey=e,this.largestBatchId=r}static min(){return new Wt(G.min(),O.empty(),un)}static max(){return new Wt(G.max(),O.empty(),un)}}function Vh(n,t){let e=n.readTime.compareTo(t.readTime);return e!==0?e:(e=O.comparator(n.documentKey,t.documentKey),e!==0?e:B(n.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dh="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Nh{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ps(n){if(n.code!==b.FAILED_PRECONDITION||n.message!==Dh)throw n;P("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&M(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new S((r,i)=>{this.nextCallback=o=>{this.wrapSuccess(t,o).next(r,i)},this.catchCallback=o=>{this.wrapFailure(e,o).next(r,i)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof S?e:S.resolve(e)}catch(e){return S.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):S.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):S.reject(e)}static resolve(t){return new S((e,r)=>{e(t)})}static reject(t){return new S((e,r)=>{r(t)})}static waitFor(t){return new S((e,r)=>{let i=0,o=0,c=!1;t.forEach(u=>{++i,u.next(()=>{++o,c&&o===i&&e()},f=>r(f))}),c=!0,o===i&&e()})}static or(t){let e=S.resolve(!1);for(const r of t)e=e.next(i=>i?S.resolve(i):r());return e}static forEach(t,e){const r=[];return t.forEach((i,o)=>{r.push(e.call(this,i,o))}),this.waitFor(r)}static mapArray(t,e){return new S((r,i)=>{const o=t.length,c=new Array(o);let u=0;for(let f=0;f<o;f++){const d=f;e(t[d]).next(T=>{c[d]=T,++u,u===o&&r(c)},T=>i(T))}})}static doWhile(t,e){return new S((r,i)=>{const o=()=>{t()===!0?e().next(()=>{o()},i):r()};o()})}}function kh(n){const t=n.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}function En(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>e.writeSequenceNumber(r))}ae(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ue&&this.ue(t),t}}Vs.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ds=-1;function Ns(n){return n==null}function Yn(n){return n===0&&1/n==-1/0}function Oh(n){return typeof n=="number"&&Number.isInteger(n)&&!Yn(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Da="";function xh(n){let t="";for(let e=0;e<n.length;e++)t.length>0&&(t=wo(t)),t=Mh(n.get(e),t);return wo(t)}function Mh(n,t){let e=t;const r=n.length;for(let i=0;i<r;i++){const o=n.charAt(i);switch(o){case"\0":e+="";break;case Da:e+="";break;default:e+=o}}return e}function wo(n){return n+Da+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ao(n){let t=0;for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t++;return t}function Oe(n,t){for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t(e,n[e])}function Na(n){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tt{constructor(t,e){this.comparator=t,this.root=e||st.EMPTY}insert(t,e){return new Tt(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,st.BLACK,null,null))}remove(t){return new Tt(this.comparator,this.root.remove(t,this.comparator).copy(null,null,st.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const r=this.comparator(t,e.key);if(r===0)return e.value;r<0?e=e.left:r>0&&(e=e.right)}return null}indexOf(t){let e=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(t,r.key);if(i===0)return e+r.left.size;i<0?r=r.left:(e+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,r)=>(t(e,r),!1))}toString(){const t=[];return this.inorderTraversal((e,r)=>(t.push(`${e}:${r}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Bn(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Bn(this.root,t,this.comparator,!1)}getReverseIterator(){return new Bn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Bn(this.root,t,this.comparator,!0)}}class Bn{constructor(t,e,r,i){this.isReverse=i,this.nodeStack=[];let o=1;for(;!t.isEmpty();)if(o=e?r(t.key,e):1,e&&i&&(o*=-1),o<0)t=this.isReverse?t.left:t.right;else{if(o===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class st{constructor(t,e,r,i,o){this.key=t,this.value=e,this.color=r??st.RED,this.left=i??st.EMPTY,this.right=o??st.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,r,i,o){return new st(t??this.key,e??this.value,r??this.color,i??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,r){let i=this;const o=r(t,i.key);return i=o<0?i.copy(null,null,null,i.left.insert(t,e,r),null):o===0?i.copy(null,e,null,null,null):i.copy(null,null,null,null,i.right.insert(t,e,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return st.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let r,i=this;if(e(t,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(t,e),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),e(t,i.key)===0){if(i.right.isEmpty())return st.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(t,e))}return i.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,st.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,st.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw M(43730,{key:this.key,value:this.value});if(this.right.isRed())throw M(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw M(27949);return t+(this.isRed()?0:1)}}st.EMPTY=null,st.RED=!0,st.BLACK=!1;st.EMPTY=new class{constructor(){this.size=0}get key(){throw M(57766)}get value(){throw M(16141)}get color(){throw M(16727)}get left(){throw M(29726)}get right(){throw M(36894)}copy(t,e,r,i,o){return this}insert(t,e,r){return new st(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(t){this.comparator=t,this.data=new Tt(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,r)=>(t(e),!1))}forEachInRange(t,e){const r=this.data.getIteratorFrom(t[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,t[1])>=0)return;e(i.key)}}forEachWhile(t,e){let r;for(r=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();r.hasNext();)if(!t(r.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new Ro(this.data.getIterator())}getIteratorFrom(t){return new Ro(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(r=>{e=e.add(r)}),e}isEqual(t){if(!(t instanceof at)||this.size!==t.size)return!1;const e=this.data.getIterator(),r=t.data.getIterator();for(;e.hasNext();){const i=e.getNext().key,o=r.getNext().key;if(this.comparator(i,o)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new at(this.comparator);return e.data=t,e}}class Ro{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St{constructor(t){this.fields=t,t.sort(ot.comparator)}static empty(){return new St([])}unionWith(t){let e=new at(ot.comparator);for(const r of this.fields)e=e.add(r);for(const r of t)e=e.add(r);return new St(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return Ce(this.fields,t.fields,(e,r)=>e.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(i){try{return atob(i)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new Lh("Invalid base64 string: "+o):o}}(t);return new Nt(e)}static fromUint8Array(t){const e=function(i){let o="";for(let c=0;c<i.length;++c)o+=String.fromCharCode(i[c]);return o}(t);return new Nt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const r=new Uint8Array(e.length);for(let i=0;i<e.length;i++)r[i]=e.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return B(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}Nt.EMPTY_BYTE_STRING=new Nt("");const Fh=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function de(n){if(Q(!!n,39018),typeof n=="string"){let t=0;const e=Fh.exec(n);if(Q(!!e,46558,{timestamp:n}),e[1]){let i=e[1];i=(i+"000000000").substr(0,9),t=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:it(n.seconds),nanos:it(n.nanos)}}function it(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Pe(n){return typeof n=="string"?Nt.fromBase64String(n):Nt.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ka="server_timestamp",Oa="__type__",xa="__previous_value__",Ma="__local_write_time__";function ks(n){return(n?.mapValue?.fields||{})[Oa]?.stringValue===ka}function Os(n){const t=n.mapValue.fields[xa];return ks(t)?Os(t):t}function Zn(n){const t=de(n.mapValue.fields[Ma].timestampValue);return new K(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uh{constructor(t,e,r,i,o,c,u,f,d,T,w){this.databaseId=t,this.appId=e,this.persistenceKey=r,this.host=i,this.ssl=o,this.forceLongPolling=c,this.autoDetectLongPolling=u,this.longPollingOptions=f,this.useFetchStreams=d,this.isUsingEmulator=T,this.apiKey=w}}const tr="(default)";class er{constructor(t,e){this.projectId=t,this.database=e||tr}static empty(){return new er("","")}get isDefaultDatabase(){return this.database===tr}isEqual(t){return t instanceof er&&t.projectId===this.projectId&&t.database===this.database}}function Bh(n,t){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new D(b.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new er(n.options.projectId,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const La="__type__",jh="__max__",jn={mapValue:{}},Fa="__vector__",us="value";function pe(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?ks(n)?4:qh(n)?9007199254740991:$h(n)?10:11:M(28295,{value:n})}function kt(n,t){if(n===t)return!0;const e=pe(n);if(e!==pe(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===t.booleanValue;case 4:return Zn(n).isEqual(Zn(t));case 3:return function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const c=de(i.timestampValue),u=de(o.timestampValue);return c.seconds===u.seconds&&c.nanos===u.nanos}(n,t);case 5:return n.stringValue===t.stringValue;case 6:return function(i,o){return Pe(i.bytesValue).isEqual(Pe(o.bytesValue))}(n,t);case 7:return n.referenceValue===t.referenceValue;case 8:return function(i,o){return it(i.geoPointValue.latitude)===it(o.geoPointValue.latitude)&&it(i.geoPointValue.longitude)===it(o.geoPointValue.longitude)}(n,t);case 2:return function(i,o){if("integerValue"in i&&"integerValue"in o)return it(i.integerValue)===it(o.integerValue);if("doubleValue"in i&&"doubleValue"in o){const c=it(i.doubleValue),u=it(o.doubleValue);return c===u?Yn(c)===Yn(u):isNaN(c)&&isNaN(u)}return!1}(n,t);case 9:return Ce(n.arrayValue.values||[],t.arrayValue.values||[],kt);case 10:case 11:return function(i,o){const c=i.mapValue.fields||{},u=o.mapValue.fields||{};if(Ao(c)!==Ao(u))return!1;for(const f in c)if(c.hasOwnProperty(f)&&(u[f]===void 0||!kt(c[f],u[f])))return!1;return!0}(n,t);default:return M(52216,{left:n})}}function hn(n,t){return(n.values||[]).find(e=>kt(e,t))!==void 0}function Ve(n,t){if(n===t)return 0;const e=pe(n),r=pe(t);if(e!==r)return B(e,r);switch(e){case 0:case 9007199254740991:return 0;case 1:return B(n.booleanValue,t.booleanValue);case 2:return function(o,c){const u=it(o.integerValue||o.doubleValue),f=it(c.integerValue||c.doubleValue);return u<f?-1:u>f?1:u===f?0:isNaN(u)?isNaN(f)?0:-1:1}(n,t);case 3:return So(n.timestampValue,t.timestampValue);case 4:return So(Zn(n),Zn(t));case 5:return cs(n.stringValue,t.stringValue);case 6:return function(o,c){const u=Pe(o),f=Pe(c);return u.compareTo(f)}(n.bytesValue,t.bytesValue);case 7:return function(o,c){const u=o.split("/"),f=c.split("/");for(let d=0;d<u.length&&d<f.length;d++){const T=B(u[d],f[d]);if(T!==0)return T}return B(u.length,f.length)}(n.referenceValue,t.referenceValue);case 8:return function(o,c){const u=B(it(o.latitude),it(c.latitude));return u!==0?u:B(it(o.longitude),it(c.longitude))}(n.geoPointValue,t.geoPointValue);case 9:return bo(n.arrayValue,t.arrayValue);case 10:return function(o,c){const u=o.fields||{},f=c.fields||{},d=u[us]?.arrayValue,T=f[us]?.arrayValue,w=B(d?.values?.length||0,T?.values?.length||0);return w!==0?w:bo(d,T)}(n.mapValue,t.mapValue);case 11:return function(o,c){if(o===jn.mapValue&&c===jn.mapValue)return 0;if(o===jn.mapValue)return 1;if(c===jn.mapValue)return-1;const u=o.fields||{},f=Object.keys(u),d=c.fields||{},T=Object.keys(d);f.sort(),T.sort();for(let w=0;w<f.length&&w<T.length;++w){const R=cs(f[w],T[w]);if(R!==0)return R;const V=Ve(u[f[w]],d[T[w]]);if(V!==0)return V}return B(f.length,T.length)}(n.mapValue,t.mapValue);default:throw M(23264,{he:e})}}function So(n,t){if(typeof n=="string"&&typeof t=="string"&&n.length===t.length)return B(n,t);const e=de(n),r=de(t),i=B(e.seconds,r.seconds);return i!==0?i:B(e.nanos,r.nanos)}function bo(n,t){const e=n.values||[],r=t.values||[];for(let i=0;i<e.length&&i<r.length;++i){const o=Ve(e[i],r[i]);if(o)return o}return B(e.length,r.length)}function De(n){return hs(n)}function hs(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(e){const r=de(e);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(e){return Pe(e).toBase64()}(n.bytesValue):"referenceValue"in n?function(e){return O.fromName(e).toString()}(n.referenceValue):"geoPointValue"in n?function(e){return`geo(${e.latitude},${e.longitude})`}(n.geoPointValue):"arrayValue"in n?function(e){let r="[",i=!0;for(const o of e.values||[])i?i=!1:r+=",",r+=hs(o);return r+"]"}(n.arrayValue):"mapValue"in n?function(e){const r=Object.keys(e.fields||{}).sort();let i="{",o=!0;for(const c of r)o?o=!1:i+=",",i+=`${c}:${hs(e.fields[c])}`;return i+"}"}(n.mapValue):M(61005,{value:n})}function Gn(n){switch(pe(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=Os(n);return t?16+Gn(t):16;case 5:return 2*n.stringValue.length;case 6:return Pe(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,o)=>i+Gn(o),0)}(n.arrayValue);case 10:case 11:return function(r){let i=0;return Oe(r.fields,(o,c)=>{i+=o.length+Gn(c)}),i}(n.mapValue);default:throw M(13486,{value:n})}}function fs(n){return!!n&&"integerValue"in n}function xs(n){return!!n&&"arrayValue"in n}function Kn(n){return!!n&&"mapValue"in n}function $h(n){return(n?.mapValue?.fields||{})[La]?.stringValue===Fa}function en(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const t={mapValue:{fields:{}}};return Oe(n.mapValue.fields,(e,r)=>t.mapValue.fields[e]=en(r)),t}if(n.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(n.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=en(n.arrayValue.values[e]);return t}return{...n}}function qh(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===jh}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(t){this.value=t}static empty(){return new At({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let r=0;r<t.length-1;++r)if(e=(e.mapValue.fields||{})[t.get(r)],!Kn(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=en(e)}setAll(t){let e=ot.emptyPath(),r={},i=[];t.forEach((c,u)=>{if(!e.isImmediateParentOf(u)){const f=this.getFieldsMap(e);this.applyChanges(f,r,i),r={},i=[],e=u.popLast()}c?r[u.lastSegment()]=en(c):i.push(u.lastSegment())});const o=this.getFieldsMap(e);this.applyChanges(o,r,i)}delete(t){const e=this.field(t.popLast());Kn(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return kt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let r=0;r<t.length;++r){let i=e.mapValue.fields[t.get(r)];Kn(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},e.mapValue.fields[t.get(r)]=i),e=i}return e.mapValue.fields}applyChanges(t,e,r){Oe(e,(i,o)=>t[i]=o);for(const i of r)delete t[i]}clone(){return new At(en(this.value))}}function Ua(n){const t=[];return Oe(n.fields,(e,r)=>{const i=new ot([e]);if(Kn(r)){const o=Ua(r.mapValue).fields;if(o.length===0)t.push(i);else for(const c of o)t.push(i.child(c))}else t.push(i)}),new St(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(t,e,r,i,o,c,u){this.key=t,this.documentType=e,this.version=r,this.readTime=i,this.createTime=o,this.data=c,this.documentState=u}static newInvalidDocument(t){return new wt(t,0,G.min(),G.min(),G.min(),At.empty(),0)}static newFoundDocument(t,e,r,i){return new wt(t,1,e,G.min(),r,i,0)}static newNoDocument(t,e){return new wt(t,2,e,G.min(),G.min(),At.empty(),0)}static newUnknownDocument(t,e){return new wt(t,3,e,G.min(),G.min(),At.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(G.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=At.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=At.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=G.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof wt&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new wt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nr{constructor(t,e){this.position=t,this.inclusive=e}}function Co(n,t,e){let r=0;for(let i=0;i<n.position.length;i++){const o=t[i],c=n.position[i];if(o.field.isKeyField()?r=O.comparator(O.fromName(c.referenceValue),e.key):r=Ve(c,e.data.field(o.field)),o.dir==="desc"&&(r*=-1),r!==0)break}return r}function Po(n,t){if(n===null)return t===null;if(t===null||n.inclusive!==t.inclusive||n.position.length!==t.position.length)return!1;for(let e=0;e<n.position.length;e++)if(!kt(n.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rr{constructor(t,e="asc"){this.field=t,this.dir=e}}function zh(n,t){return n.dir===t.dir&&n.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ba{}class rt extends Ba{constructor(t,e,r){super(),this.field=t,this.op=e,this.value=r}static create(t,e,r){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,r):new Gh(t,e,r):e==="array-contains"?new Qh(t,r):e==="in"?new Jh(t,r):e==="not-in"?new Xh(t,r):e==="array-contains-any"?new Yh(t,r):new rt(t,e,r)}static createKeyFieldInFilter(t,e,r){return e==="in"?new Kh(t,r):new Wh(t,r)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison(Ve(e,this.value)):e!==null&&pe(this.value)===pe(e)&&this.matchesComparison(Ve(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return M(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Qt extends Ba{constructor(t,e){super(),this.filters=t,this.op=e,this.Pe=null}static create(t,e){return new Qt(t,e)}matches(t){return ja(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function ja(n){return n.op==="and"}function $a(n){return Hh(n)&&ja(n)}function Hh(n){for(const t of n.filters)if(t instanceof Qt)return!1;return!0}function ds(n){if(n instanceof rt)return n.field.canonicalString()+n.op.toString()+De(n.value);if($a(n))return n.filters.map(t=>ds(t)).join(",");{const t=n.filters.map(e=>ds(e)).join(",");return`${n.op}(${t})`}}function qa(n,t){return n instanceof rt?function(r,i){return i instanceof rt&&r.op===i.op&&r.field.isEqual(i.field)&&kt(r.value,i.value)}(n,t):n instanceof Qt?function(r,i){return i instanceof Qt&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((o,c,u)=>o&&qa(c,i.filters[u]),!0):!1}(n,t):void M(19439)}function za(n){return n instanceof rt?function(e){return`${e.field.canonicalString()} ${e.op} ${De(e.value)}`}(n):n instanceof Qt?function(e){return e.op.toString()+" {"+e.getFilters().map(za).join(" ,")+"}"}(n):"Filter"}class Gh extends rt{constructor(t,e,r){super(t,e,r),this.key=O.fromName(r.referenceValue)}matches(t){const e=O.comparator(t.key,this.key);return this.matchesComparison(e)}}class Kh extends rt{constructor(t,e){super(t,"in",e),this.keys=Ha("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Wh extends rt{constructor(t,e){super(t,"not-in",e),this.keys=Ha("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Ha(n,t){return(t.arrayValue?.values||[]).map(e=>O.fromName(e.referenceValue))}class Qh extends rt{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return xs(e)&&hn(e.arrayValue,this.value)}}class Jh extends rt{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&hn(this.value.arrayValue,e)}}class Xh extends rt{constructor(t,e){super(t,"not-in",e)}matches(t){if(hn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!hn(this.value.arrayValue,e)}}class Yh extends rt{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!xs(e)||!e.arrayValue.values)&&e.arrayValue.values.some(r=>hn(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zh{constructor(t,e=null,r=[],i=[],o=null,c=null,u=null){this.path=t,this.collectionGroup=e,this.orderBy=r,this.filters=i,this.limit=o,this.startAt=c,this.endAt=u,this.Te=null}}function Vo(n,t=null,e=[],r=[],i=null,o=null,c=null){return new Zh(n,t,e,r,i,o,c)}function Ms(n){const t=$(n);if(t.Te===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(r=>ds(r)).join(","),e+="|ob:",e+=t.orderBy.map(r=>function(o){return o.field.canonicalString()+o.dir}(r)).join(","),Ns(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(r=>De(r)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(r=>De(r)).join(",")),t.Te=e}return t.Te}function Ls(n,t){if(n.limit!==t.limit||n.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<n.orderBy.length;e++)if(!zh(n.orderBy[e],t.orderBy[e]))return!1;if(n.filters.length!==t.filters.length)return!1;for(let e=0;e<n.filters.length;e++)if(!qa(n.filters[e],t.filters[e]))return!1;return n.collectionGroup===t.collectionGroup&&!!n.path.isEqual(t.path)&&!!Po(n.startAt,t.startAt)&&Po(n.endAt,t.endAt)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hr{constructor(t,e=null,r=[],i=[],o=null,c="F",u=null,f=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=r,this.filters=i,this.limit=o,this.limitType=c,this.startAt=u,this.endAt=f,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}}function tf(n,t,e,r,i,o,c,u){return new hr(n,t,e,r,i,o,c,u)}function ef(n){return new hr(n)}function Do(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function nf(n){return O.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function rf(n){return n.collectionGroup!==null}function nn(n){const t=$(n);if(t.Ie===null){t.Ie=[];const e=new Set;for(const o of t.explicitOrderBy)t.Ie.push(o),e.add(o.field.canonicalString());const r=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(c){let u=new at(ot.comparator);return c.filters.forEach(f=>{f.getFlattenedFilters().forEach(d=>{d.isInequality()&&(u=u.add(d.field))})}),u})(t).forEach(o=>{e.has(o.canonicalString())||o.isKeyField()||t.Ie.push(new rr(o,r))}),e.has(ot.keyField().canonicalString())||t.Ie.push(new rr(ot.keyField(),r))}return t.Ie}function le(n){const t=$(n);return t.Ee||(t.Ee=sf(t,nn(n))),t.Ee}function sf(n,t){if(n.limitType==="F")return Vo(n.path,n.collectionGroup,t,n.filters,n.limit,n.startAt,n.endAt);{t=t.map(i=>{const o=i.dir==="desc"?"asc":"desc";return new rr(i.field,o)});const e=n.endAt?new nr(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new nr(n.startAt.position,n.startAt.inclusive):null;return Vo(n.path,n.collectionGroup,t,n.filters,n.limit,e,r)}}function ps(n,t,e){return new hr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),t,e,n.startAt,n.endAt)}function Ga(n,t){return Ls(le(n),le(t))&&n.limitType===t.limitType}function Ka(n){return`${Ms(le(n))}|lt:${n.limitType}`}function Xe(n){return`Query(target=${function(e){let r=e.path.canonicalString();return e.collectionGroup!==null&&(r+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(r+=`, filters: [${e.filters.map(i=>za(i)).join(", ")}]`),Ns(e.limit)||(r+=", limit: "+e.limit),e.orderBy.length>0&&(r+=`, orderBy: [${e.orderBy.map(i=>function(c){return`${c.field.canonicalString()} (${c.dir})`}(i)).join(", ")}]`),e.startAt&&(r+=", startAt: ",r+=e.startAt.inclusive?"b:":"a:",r+=e.startAt.position.map(i=>De(i)).join(",")),e.endAt&&(r+=", endAt: ",r+=e.endAt.inclusive?"a:":"b:",r+=e.endAt.position.map(i=>De(i)).join(",")),`Target(${r})`}(le(n))}; limitType=${n.limitType})`}function Fs(n,t){return t.isFoundDocument()&&function(r,i){const o=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(o):O.isDocumentKey(r.path)?r.path.isEqual(o):r.path.isImmediateParentOf(o)}(n,t)&&function(r,i){for(const o of nn(r))if(!o.field.isKeyField()&&i.data.field(o.field)===null)return!1;return!0}(n,t)&&function(r,i){for(const o of r.filters)if(!o.matches(i))return!1;return!0}(n,t)&&function(r,i){return!(r.startAt&&!function(c,u,f){const d=Co(c,u,f);return c.inclusive?d<=0:d<0}(r.startAt,nn(r),i)||r.endAt&&!function(c,u,f){const d=Co(c,u,f);return c.inclusive?d>=0:d>0}(r.endAt,nn(r),i))}(n,t)}function of(n){return(t,e)=>{let r=!1;for(const i of nn(n)){const o=af(i,t,e);if(o!==0)return o;r=r||i.field.isKeyField()}return 0}}function af(n,t,e){const r=n.field.isKeyField()?O.comparator(t.key,e.key):function(o,c,u){const f=c.data.field(o),d=u.data.field(o);return f!==null&&d!==null?Ve(f,d):M(42886)}(n.field,t,e);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return M(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),r=this.inner[e];if(r!==void 0){for(const[i,o]of r)if(this.equalsFn(i,t))return o}}has(t){return this.get(t)!==void 0}set(t,e){const r=this.mapKeyFn(t),i=this.inner[r];if(i===void 0)return this.inner[r]=[[t,e]],void this.innerSize++;for(let o=0;o<i.length;o++)if(this.equalsFn(i[o][0],t))return void(i[o]=[t,e]);i.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),r=this.inner[e];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],t))return r.length===1?delete this.inner[e]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(t){Oe(this.inner,(e,r)=>{for(const[i,o]of r)t(i,o)})}isEmpty(){return Na(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cf=new Tt(O.comparator);function sr(){return cf}const Wa=new Tt(O.comparator);function $n(...n){let t=Wa;for(const e of n)t=t.insert(e.key,e);return t}function Qa(n){let t=Wa;return n.forEach((e,r)=>t=t.insert(e,r.overlayedDocument)),t}function oe(){return rn()}function Ja(){return rn()}function rn(){return new _e(n=>n.toString(),(n,t)=>n.isEqual(t))}const lf=new Tt(O.comparator),uf=new at(O.comparator);function ht(...n){let t=uf;for(const e of n)t=t.add(e);return t}const hf=new at(B);function ff(){return hf}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Us(n,t){if(n.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Yn(t)?"-0":t}}function Xa(n){return{integerValue:""+n}}function Ya(n,t){return Oh(t)?Xa(t):Us(n,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fr{constructor(){this._=void 0}}function df(n,t,e){return n instanceof fn?function(i,o){const c={fields:{[Oa]:{stringValue:ka},[Ma]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return o&&ks(o)&&(o=Os(o)),o&&(c.fields[xa]=o),{mapValue:c}}(e,t):n instanceof dn?tc(n,t):n instanceof pn?ec(n,t):function(i,o){const c=Za(i,o),u=No(c)+No(i.Ae);return fs(c)&&fs(i.Ae)?Xa(u):Us(i.serializer,u)}(n,t)}function pf(n,t,e){return n instanceof dn?tc(n,t):n instanceof pn?ec(n,t):e}function Za(n,t){return n instanceof mn?function(r){return fs(r)||function(o){return!!o&&"doubleValue"in o}(r)}(t)?t:{integerValue:0}:null}class fn extends fr{}class dn extends fr{constructor(t){super(),this.elements=t}}function tc(n,t){const e=nc(t);for(const r of n.elements)e.some(i=>kt(i,r))||e.push(r);return{arrayValue:{values:e}}}class pn extends fr{constructor(t){super(),this.elements=t}}function ec(n,t){let e=nc(t);for(const r of n.elements)e=e.filter(i=>!kt(i,r));return{arrayValue:{values:e}}}class mn extends fr{constructor(t,e){super(),this.serializer=t,this.Ae=e}}function No(n){return it(n.integerValue||n.doubleValue)}function nc(n){return xs(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rc{constructor(t,e){this.field=t,this.transform=e}}function mf(n,t){return n.field.isEqual(t.field)&&function(r,i){return r instanceof dn&&i instanceof dn||r instanceof pn&&i instanceof pn?Ce(r.elements,i.elements,kt):r instanceof mn&&i instanceof mn?kt(r.Ae,i.Ae):r instanceof fn&&i instanceof fn}(n.transform,t.transform)}class gf{constructor(t,e){this.version=t,this.transformResults=e}}class xt{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new xt}static exists(t){return new xt(void 0,t)}static updateTime(t){return new xt(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Wn(n,t){return n.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(n.updateTime):n.exists===void 0||n.exists===t.isFoundDocument()}class dr{}function sc(n,t){if(!n.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return n.isNoDocument()?new oc(n.key,xt.none()):new Tn(n.key,n.data,xt.none());{const e=n.data,r=At.empty();let i=new at(ot.comparator);for(let o of t.fields)if(!i.has(o)){let c=e.field(o);c===null&&o.length>1&&(o=o.popLast(),c=e.field(o)),c===null?r.delete(o):r.set(o,c),i=i.add(o)}return new ye(n.key,r,new St(i.toArray()),xt.none())}}function _f(n,t,e){n instanceof Tn?function(i,o,c){const u=i.value.clone(),f=Oo(i.fieldTransforms,o,c.transformResults);u.setAll(f),o.convertToFoundDocument(c.version,u).setHasCommittedMutations()}(n,t,e):n instanceof ye?function(i,o,c){if(!Wn(i.precondition,o))return void o.convertToUnknownDocument(c.version);const u=Oo(i.fieldTransforms,o,c.transformResults),f=o.data;f.setAll(ic(i)),f.setAll(u),o.convertToFoundDocument(c.version,f).setHasCommittedMutations()}(n,t,e):function(i,o,c){o.convertToNoDocument(c.version).setHasCommittedMutations()}(0,t,e)}function sn(n,t,e,r){return n instanceof Tn?function(o,c,u,f){if(!Wn(o.precondition,c))return u;const d=o.value.clone(),T=xo(o.fieldTransforms,f,c);return d.setAll(T),c.convertToFoundDocument(c.version,d).setHasLocalMutations(),null}(n,t,e,r):n instanceof ye?function(o,c,u,f){if(!Wn(o.precondition,c))return u;const d=xo(o.fieldTransforms,f,c),T=c.data;return T.setAll(ic(o)),T.setAll(d),c.convertToFoundDocument(c.version,T).setHasLocalMutations(),u===null?null:u.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(w=>w.field))}(n,t,e,r):function(o,c,u){return Wn(o.precondition,c)?(c.convertToNoDocument(c.version).setHasLocalMutations(),null):u}(n,t,e)}function yf(n,t){let e=null;for(const r of n.fieldTransforms){const i=t.data.field(r.field),o=Za(r.transform,i||null);o!=null&&(e===null&&(e=At.empty()),e.set(r.field,o))}return e||null}function ko(n,t){return n.type===t.type&&!!n.key.isEqual(t.key)&&!!n.precondition.isEqual(t.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Ce(r,i,(o,c)=>mf(o,c))}(n.fieldTransforms,t.fieldTransforms)&&(n.type===0?n.value.isEqual(t.value):n.type!==1||n.data.isEqual(t.data)&&n.fieldMask.isEqual(t.fieldMask))}class Tn extends dr{constructor(t,e,r,i=[]){super(),this.key=t,this.value=e,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class ye extends dr{constructor(t,e,r,i,o=[]){super(),this.key=t,this.data=e,this.fieldMask=r,this.precondition=i,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function ic(n){const t=new Map;return n.fieldMask.fields.forEach(e=>{if(!e.isEmpty()){const r=n.data.field(e);t.set(e,r)}}),t}function Oo(n,t,e){const r=new Map;Q(n.length===e.length,32656,{Ve:e.length,de:n.length});for(let i=0;i<e.length;i++){const o=n[i],c=o.transform,u=t.data.field(o.field);r.set(o.field,pf(c,u,e[i]))}return r}function xo(n,t,e){const r=new Map;for(const i of n){const o=i.transform,c=e.data.field(i.field);r.set(i.field,df(o,c,t))}return r}class oc extends dr{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Ef extends dr{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tf{constructor(t,e,r,i){this.batchId=t,this.localWriteTime=e,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(t,e){const r=e.mutationResults;for(let i=0;i<this.mutations.length;i++){const o=this.mutations[i];o.key.isEqual(t.key)&&_f(o,t,r[i])}}applyToLocalView(t,e){for(const r of this.baseMutations)r.key.isEqual(t.key)&&(e=sn(r,t,e,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(t.key)&&(e=sn(r,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const r=Ja();return this.mutations.forEach(i=>{const o=t.get(i.key),c=o.overlayedDocument;let u=this.applyToLocalView(c,o.mutatedFields);u=e.has(i.key)?null:u;const f=sc(c,u);f!==null&&r.set(i.key,f),c.isValidDocument()||c.convertToNoDocument(G.min())}),r}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),ht())}isEqual(t){return this.batchId===t.batchId&&Ce(this.mutations,t.mutations,(e,r)=>ko(e,r))&&Ce(this.baseMutations,t.baseMutations,(e,r)=>ko(e,r))}}class Bs{constructor(t,e,r,i){this.batch=t,this.commitVersion=e,this.mutationResults=r,this.docVersions=i}static from(t,e,r){Q(t.mutations.length===r.length,58842,{me:t.mutations.length,fe:r.length});let i=function(){return lf}();const o=t.mutations;for(let c=0;c<o.length;c++)i=i.insert(o[c].key,r[c].version);return new Bs(t,e,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class If{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Y,F;function vf(n){switch(n){case b.OK:return M(64938);case b.CANCELLED:case b.UNKNOWN:case b.DEADLINE_EXCEEDED:case b.RESOURCE_EXHAUSTED:case b.INTERNAL:case b.UNAVAILABLE:case b.UNAUTHENTICATED:return!1;case b.INVALID_ARGUMENT:case b.NOT_FOUND:case b.ALREADY_EXISTS:case b.PERMISSION_DENIED:case b.FAILED_PRECONDITION:case b.ABORTED:case b.OUT_OF_RANGE:case b.UNIMPLEMENTED:case b.DATA_LOSS:return!0;default:return M(15467,{code:n})}}function wf(n){if(n===void 0)return fe("GRPC error has no .code"),b.UNKNOWN;switch(n){case Y.OK:return b.OK;case Y.CANCELLED:return b.CANCELLED;case Y.UNKNOWN:return b.UNKNOWN;case Y.DEADLINE_EXCEEDED:return b.DEADLINE_EXCEEDED;case Y.RESOURCE_EXHAUSTED:return b.RESOURCE_EXHAUSTED;case Y.INTERNAL:return b.INTERNAL;case Y.UNAVAILABLE:return b.UNAVAILABLE;case Y.UNAUTHENTICATED:return b.UNAUTHENTICATED;case Y.INVALID_ARGUMENT:return b.INVALID_ARGUMENT;case Y.NOT_FOUND:return b.NOT_FOUND;case Y.ALREADY_EXISTS:return b.ALREADY_EXISTS;case Y.PERMISSION_DENIED:return b.PERMISSION_DENIED;case Y.FAILED_PRECONDITION:return b.FAILED_PRECONDITION;case Y.ABORTED:return b.ABORTED;case Y.OUT_OF_RANGE:return b.OUT_OF_RANGE;case Y.UNIMPLEMENTED:return b.UNIMPLEMENTED;case Y.DATA_LOSS:return b.DATA_LOSS;default:return M(39323,{code:n})}}(F=Y||(Y={}))[F.OK=0]="OK",F[F.CANCELLED=1]="CANCELLED",F[F.UNKNOWN=2]="UNKNOWN",F[F.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",F[F.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",F[F.NOT_FOUND=5]="NOT_FOUND",F[F.ALREADY_EXISTS=6]="ALREADY_EXISTS",F[F.PERMISSION_DENIED=7]="PERMISSION_DENIED",F[F.UNAUTHENTICATED=16]="UNAUTHENTICATED",F[F.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",F[F.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",F[F.ABORTED=10]="ABORTED",F[F.OUT_OF_RANGE=11]="OUT_OF_RANGE",F[F.UNIMPLEMENTED=12]="UNIMPLEMENTED",F[F.INTERNAL=13]="INTERNAL",F[F.UNAVAILABLE=14]="UNAVAILABLE",F[F.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Rs([4294967295,4294967295],0);class Af{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function ms(n,t){return n.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function Rf(n,t){return n.useProto3Json?t.toBase64():t.toUint8Array()}function Sf(n,t){return ms(n,t.toTimestamp())}function Ae(n){return Q(!!n,49232),G.fromTimestamp(function(e){const r=de(e);return new K(r.seconds,r.nanos)}(n))}function ac(n,t){return gs(n,t).canonicalString()}function gs(n,t){const e=function(i){return new J(["projects",i.projectId,"databases",i.database])}(n).child("documents");return t===void 0?e:e.child(t)}function bf(n){const t=J.fromString(n);return Q(xf(t),10190,{key:t.toString()}),t}function _s(n,t){return ac(n.databaseId,t.path)}function Cf(n){const t=bf(n);return t.length===4?J.emptyPath():Vf(t)}function Pf(n){return new J(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Vf(n){return Q(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Mo(n,t,e){return{name:_s(n,t),fields:e.value.mapValue.fields}}function Df(n,t){let e;if(t instanceof Tn)e={update:Mo(n,t.key,t.value)};else if(t instanceof oc)e={delete:_s(n,t.key)};else if(t instanceof ye)e={update:Mo(n,t.key,t.data),updateMask:Of(t.fieldMask)};else{if(!(t instanceof Ef))return M(16599,{dt:t.type});e={verify:_s(n,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(r=>function(o,c){const u=c.transform;if(u instanceof fn)return{fieldPath:c.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof dn)return{fieldPath:c.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof pn)return{fieldPath:c.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof mn)return{fieldPath:c.field.canonicalString(),increment:u.Ae};throw M(20930,{transform:c.transform})}(0,r))),t.precondition.isNone||(e.currentDocument=function(i,o){return o.updateTime!==void 0?{updateTime:Sf(i,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:M(27497)}(n,t.precondition)),e}function Nf(n,t){return n&&n.length>0?(Q(t!==void 0,14353),n.map(e=>function(i,o){let c=i.updateTime?Ae(i.updateTime):Ae(o);return c.isEqual(G.min())&&(c=Ae(o)),new gf(c,i.transformResults||[])}(e,t))):[]}function kf(n){let t=Cf(n.parent);const e=n.structuredQuery,r=e.from?e.from.length:0;let i=null;if(r>0){Q(r===1,65062);const T=e.from[0];T.allDescendants?i=T.collectionId:t=t.child(T.collectionId)}let o=[];e.where&&(o=function(w){const R=cc(w);return R instanceof Qt&&$a(R)?R.getFilters():[R]}(e.where));let c=[];e.orderBy&&(c=function(w){return w.map(R=>function(N){return new rr(we(N.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(N.direction))}(R))}(e.orderBy));let u=null;e.limit&&(u=function(w){let R;return R=typeof w=="object"?w.value:w,Ns(R)?null:R}(e.limit));let f=null;e.startAt&&(f=function(w){const R=!!w.before,V=w.values||[];return new nr(V,R)}(e.startAt));let d=null;return e.endAt&&(d=function(w){const R=!w.before,V=w.values||[];return new nr(V,R)}(e.endAt)),tf(t,i,c,o,u,"F",f,d)}function cc(n){return n.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const r=we(e.unaryFilter.field);return rt.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=we(e.unaryFilter.field);return rt.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=we(e.unaryFilter.field);return rt.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const c=we(e.unaryFilter.field);return rt.create(c,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return M(61313);default:return M(60726)}}(n):n.fieldFilter!==void 0?function(e){return rt.create(we(e.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return M(58110);default:return M(50506)}}(e.fieldFilter.op),e.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(e){return Qt.create(e.compositeFilter.filters.map(r=>cc(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return M(1026)}}(e.compositeFilter.op))}(n):M(30097,{filter:n})}function we(n){return ot.fromServerFormat(n.fieldPath)}function Of(n){const t=[];return n.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function xf(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function lc(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(t){this.yt=t}}function Lf(n){const t=kf({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ps(t,t.limit,"L"):t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ff{constructor(){this.Sn=new Uf}addToCollectionParentIndex(t,e){return this.Sn.add(e),S.resolve()}getCollectionParents(t,e){return S.resolve(this.Sn.getEntries(e))}addFieldIndex(t,e){return S.resolve()}deleteFieldIndex(t,e){return S.resolve()}deleteAllFieldIndexes(t){return S.resolve()}createTargetIndexes(t,e){return S.resolve()}getDocumentsMatchingTarget(t,e){return S.resolve(null)}getIndexType(t,e){return S.resolve(0)}getFieldIndexes(t,e){return S.resolve([])}getNextCollectionGroupToUpdate(t){return S.resolve(null)}getMinOffset(t,e){return S.resolve(Wt.min())}getMinOffsetFromCollectionGroup(t,e){return S.resolve(Wt.min())}updateCollectionGroup(t,e,r){return S.resolve()}updateIndexEntries(t,e){return S.resolve()}}class Uf{constructor(){this.index={}}add(t){const e=t.lastSegment(),r=t.popLast(),i=this.index[e]||new at(J.comparator),o=!i.has(r);return this.index[e]=i.add(r),o}has(t){const e=t.lastSegment(),r=t.popLast(),i=this.index[e];return i&&i.has(r)}getEntries(t){return(this.index[t]||new at(J.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lo={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},uc=41943040;class Et{static withCacheSize(t){return new Et(t,Et.DEFAULT_COLLECTION_PERCENTILE,Et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,r){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Et.DEFAULT_COLLECTION_PERCENTILE=10,Et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Et.DEFAULT=new Et(uc,Et.DEFAULT_COLLECTION_PERCENTILE,Et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Et.DISABLED=new Et(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(t){this.sr=t}next(){return this.sr+=2,this.sr}static _r(){return new Ne(0)}static ar(){return new Ne(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fo="LruGarbageCollector",Bf=1048576;function Uo([n,t],[e,r]){const i=B(n,e);return i===0?B(t,r):i}class jf{constructor(t){this.Pr=t,this.buffer=new at(Uo),this.Tr=0}Ir(){return++this.Tr}Er(t){const e=[t,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(e);else{const r=this.buffer.last();Uo(e,r)<0&&(this.buffer=this.buffer.delete(r).add(e))}}get maxValue(){return this.buffer.last()[0]}}class $f{constructor(t,e,r){this.garbageCollector=t,this.asyncQueue=e,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(t){P(Fo,`Garbage collection scheduled in ${t}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){En(e)?P(Fo,"Ignoring IndexedDB error during garbage collection: ",e):await Ps(e)}await this.Ar(3e5)})}}class qf{constructor(t,e){this.Vr=t,this.params=e}calculateTargetCount(t,e){return this.Vr.dr(t).next(r=>Math.floor(e/100*r))}nthSequenceNumber(t,e){if(e===0)return S.resolve(Vs.ce);const r=new jf(e);return this.Vr.forEachTarget(t,i=>r.Er(i.sequenceNumber)).next(()=>this.Vr.mr(t,i=>r.Er(i))).next(()=>r.maxValue)}removeTargets(t,e,r){return this.Vr.removeTargets(t,e,r)}removeOrphanedDocuments(t,e){return this.Vr.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(P("LruGarbageCollector","Garbage collection skipped; disabled"),S.resolve(Lo)):this.getCacheSize(t).next(r=>r<this.params.cacheSizeCollectionThreshold?(P("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Lo):this.gr(t,e))}getCacheSize(t){return this.Vr.getCacheSize(t)}gr(t,e){let r,i,o,c,u,f,d;const T=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(w=>(w>this.params.maximumSequenceNumbersToCollect?(P("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${w}`),i=this.params.maximumSequenceNumbersToCollect):i=w,c=Date.now(),this.nthSequenceNumber(t,i))).next(w=>(r=w,u=Date.now(),this.removeTargets(t,r,e))).next(w=>(o=w,f=Date.now(),this.removeOrphanedDocuments(t,r))).next(w=>(d=Date.now(),ve()<=U.DEBUG&&P("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${c-T}ms
	Determined least recently used ${i} in `+(u-c)+`ms
	Removed ${o} targets in `+(f-u)+`ms
	Removed ${w} documents in `+(d-f)+`ms
Total Duration: ${d-T}ms`),S.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:o,documentsRemoved:w})))}}function zf(n,t){return new qf(n,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hf{constructor(){this.changes=new _e(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,wt.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const r=this.changes.get(e);return r!==void 0?S.resolve(r):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gf{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kf{constructor(t,e,r,i){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=r,this.indexManager=i}getDocument(t,e){let r=null;return this.documentOverlayCache.getOverlay(t,e).next(i=>(r=i,this.remoteDocumentCache.getEntry(t,e))).next(i=>(r!==null&&sn(r.mutation,i,St.empty(),K.now()),i))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(r=>this.getLocalViewOfDocuments(t,r,ht()).next(()=>r))}getLocalViewOfDocuments(t,e,r=ht()){const i=oe();return this.populateOverlays(t,i,e).next(()=>this.computeViews(t,e,i,r).next(o=>{let c=$n();return o.forEach((u,f)=>{c=c.insert(u,f.overlayedDocument)}),c}))}getOverlayedDocuments(t,e){const r=oe();return this.populateOverlays(t,r,e).next(()=>this.computeViews(t,e,r,ht()))}populateOverlays(t,e,r){const i=[];return r.forEach(o=>{e.has(o)||i.push(o)}),this.documentOverlayCache.getOverlays(t,i).next(o=>{o.forEach((c,u)=>{e.set(c,u)})})}computeViews(t,e,r,i){let o=sr();const c=rn(),u=function(){return rn()}();return e.forEach((f,d)=>{const T=r.get(d.key);i.has(d.key)&&(T===void 0||T.mutation instanceof ye)?o=o.insert(d.key,d):T!==void 0?(c.set(d.key,T.mutation.getFieldMask()),sn(T.mutation,d,T.mutation.getFieldMask(),K.now())):c.set(d.key,St.empty())}),this.recalculateAndSaveOverlays(t,o).next(f=>(f.forEach((d,T)=>c.set(d,T)),e.forEach((d,T)=>u.set(d,new Gf(T,c.get(d)??null))),u))}recalculateAndSaveOverlays(t,e){const r=rn();let i=new Tt((c,u)=>c-u),o=ht();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(c=>{for(const u of c)u.keys().forEach(f=>{const d=e.get(f);if(d===null)return;let T=r.get(f)||St.empty();T=u.applyToLocalView(d,T),r.set(f,T);const w=(i.get(u.batchId)||ht()).add(f);i=i.insert(u.batchId,w)})}).next(()=>{const c=[],u=i.getReverseIterator();for(;u.hasNext();){const f=u.getNext(),d=f.key,T=f.value,w=Ja();T.forEach(R=>{if(!o.has(R)){const V=sc(e.get(R),r.get(R));V!==null&&w.set(R,V),o=o.add(R)}}),c.push(this.documentOverlayCache.saveOverlays(t,d,w))}return S.waitFor(c)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(r=>this.recalculateAndSaveOverlays(t,r))}getDocumentsMatchingQuery(t,e,r,i){return nf(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):rf(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,r,i):this.getDocumentsMatchingCollectionQuery(t,e,r,i)}getNextDocuments(t,e,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,r,i).next(o=>{const c=i-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,r.largestBatchId,i-o.size):S.resolve(oe());let u=un,f=o;return c.next(d=>S.forEach(d,(T,w)=>(u<w.largestBatchId&&(u=w.largestBatchId),o.get(T)?S.resolve():this.remoteDocumentCache.getEntry(t,T).next(R=>{f=f.insert(T,R)}))).next(()=>this.populateOverlays(t,d,o)).next(()=>this.computeViews(t,f,d,ht())).next(T=>({batchId:u,changes:Qa(T)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new O(e)).next(r=>{let i=$n();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(t,e,r,i){const o=e.collectionGroup;let c=$n();return this.indexManager.getCollectionParents(t,o).next(u=>S.forEach(u,f=>{const d=function(w,R){return new hr(R,null,w.explicitOrderBy.slice(),w.filters.slice(),w.limit,w.limitType,w.startAt,w.endAt)}(e,f.child(o));return this.getDocumentsMatchingCollectionQuery(t,d,r,i).next(T=>{T.forEach((w,R)=>{c=c.insert(w,R)})})}).next(()=>c))}getDocumentsMatchingCollectionQuery(t,e,r,i){let o;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,r.largestBatchId).next(c=>(o=c,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,r,o,i))).next(c=>{o.forEach((f,d)=>{const T=d.getKey();c.get(T)===null&&(c=c.insert(T,wt.newInvalidDocument(T)))});let u=$n();return c.forEach((f,d)=>{const T=o.get(f);T!==void 0&&sn(T.mutation,d,St.empty(),K.now()),Fs(e,d)&&(u=u.insert(f,d))}),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wf{constructor(t){this.serializer=t,this.Nr=new Map,this.Br=new Map}getBundleMetadata(t,e){return S.resolve(this.Nr.get(e))}saveBundleMetadata(t,e){return this.Nr.set(e.id,function(i){return{id:i.id,version:i.version,createTime:Ae(i.createTime)}}(e)),S.resolve()}getNamedQuery(t,e){return S.resolve(this.Br.get(e))}saveNamedQuery(t,e){return this.Br.set(e.name,function(i){return{name:i.name,query:Lf(i.bundledQuery),readTime:Ae(i.readTime)}}(e)),S.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qf{constructor(){this.overlays=new Tt(O.comparator),this.Lr=new Map}getOverlay(t,e){return S.resolve(this.overlays.get(e))}getOverlays(t,e){const r=oe();return S.forEach(e,i=>this.getOverlay(t,i).next(o=>{o!==null&&r.set(i,o)})).next(()=>r)}saveOverlays(t,e,r){return r.forEach((i,o)=>{this.bt(t,e,o)}),S.resolve()}removeOverlaysForBatchId(t,e,r){const i=this.Lr.get(r);return i!==void 0&&(i.forEach(o=>this.overlays=this.overlays.remove(o)),this.Lr.delete(r)),S.resolve()}getOverlaysForCollection(t,e,r){const i=oe(),o=e.length+1,c=new O(e.child("")),u=this.overlays.getIteratorFrom(c);for(;u.hasNext();){const f=u.getNext().value,d=f.getKey();if(!e.isPrefixOf(d.path))break;d.path.length===o&&f.largestBatchId>r&&i.set(f.getKey(),f)}return S.resolve(i)}getOverlaysForCollectionGroup(t,e,r,i){let o=new Tt((d,T)=>d-T);const c=this.overlays.getIterator();for(;c.hasNext();){const d=c.getNext().value;if(d.getKey().getCollectionGroup()===e&&d.largestBatchId>r){let T=o.get(d.largestBatchId);T===null&&(T=oe(),o=o.insert(d.largestBatchId,T)),T.set(d.getKey(),d)}}const u=oe(),f=o.getIterator();for(;f.hasNext()&&(f.getNext().value.forEach((d,T)=>u.set(d,T)),!(u.size()>=i)););return S.resolve(u)}bt(t,e,r){const i=this.overlays.get(r.key);if(i!==null){const c=this.Lr.get(i.largestBatchId).delete(r.key);this.Lr.set(i.largestBatchId,c)}this.overlays=this.overlays.insert(r.key,new If(e,r));let o=this.Lr.get(e);o===void 0&&(o=ht(),this.Lr.set(e,o)),this.Lr.set(e,o.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jf{constructor(){this.sessionToken=Nt.EMPTY_BYTE_STRING}getSessionToken(t){return S.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,S.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class js{constructor(){this.kr=new at(nt.Kr),this.qr=new at(nt.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(t,e){const r=new nt(t,e);this.kr=this.kr.add(r),this.qr=this.qr.add(r)}$r(t,e){t.forEach(r=>this.addReference(r,e))}removeReference(t,e){this.Wr(new nt(t,e))}Qr(t,e){t.forEach(r=>this.removeReference(r,e))}Gr(t){const e=new O(new J([])),r=new nt(e,t),i=new nt(e,t+1),o=[];return this.qr.forEachInRange([r,i],c=>{this.Wr(c),o.push(c.key)}),o}zr(){this.kr.forEach(t=>this.Wr(t))}Wr(t){this.kr=this.kr.delete(t),this.qr=this.qr.delete(t)}jr(t){const e=new O(new J([])),r=new nt(e,t),i=new nt(e,t+1);let o=ht();return this.qr.forEachInRange([r,i],c=>{o=o.add(c.key)}),o}containsKey(t){const e=new nt(t,0),r=this.kr.firstAfterOrEqual(e);return r!==null&&t.isEqual(r.key)}}class nt{constructor(t,e){this.key=t,this.Hr=e}static Kr(t,e){return O.comparator(t.key,e.key)||B(t.Hr,e.Hr)}static Ur(t,e){return B(t.Hr,e.Hr)||O.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xf{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.Yn=1,this.Jr=new at(nt.Kr)}checkEmpty(t){return S.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,r,i){const o=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const c=new Tf(o,e,r,i);this.mutationQueue.push(c);for(const u of i)this.Jr=this.Jr.add(new nt(u.key,o)),this.indexManager.addToCollectionParentIndex(t,u.key.path.popLast());return S.resolve(c)}lookupMutationBatch(t,e){return S.resolve(this.Zr(e))}getNextMutationBatchAfterBatchId(t,e){const r=e+1,i=this.Xr(r),o=i<0?0:i;return S.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return S.resolve(this.mutationQueue.length===0?Ds:this.Yn-1)}getAllMutationBatches(t){return S.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const r=new nt(e,0),i=new nt(e,Number.POSITIVE_INFINITY),o=[];return this.Jr.forEachInRange([r,i],c=>{const u=this.Zr(c.Hr);o.push(u)}),S.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(t,e){let r=new at(B);return e.forEach(i=>{const o=new nt(i,0),c=new nt(i,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([o,c],u=>{r=r.add(u.Hr)})}),S.resolve(this.Yr(r))}getAllMutationBatchesAffectingQuery(t,e){const r=e.path,i=r.length+1;let o=r;O.isDocumentKey(o)||(o=o.child(""));const c=new nt(new O(o),0);let u=new at(B);return this.Jr.forEachWhile(f=>{const d=f.key.path;return!!r.isPrefixOf(d)&&(d.length===i&&(u=u.add(f.Hr)),!0)},c),S.resolve(this.Yr(u))}Yr(t){const e=[];return t.forEach(r=>{const i=this.Zr(r);i!==null&&e.push(i)}),e}removeMutationBatch(t,e){Q(this.ei(e.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Jr;return S.forEach(e.mutations,i=>{const o=new nt(i.key,e.batchId);return r=r.delete(o),this.referenceDelegate.markPotentiallyOrphaned(t,i.key)}).next(()=>{this.Jr=r})}nr(t){}containsKey(t,e){const r=new nt(e,0),i=this.Jr.firstAfterOrEqual(r);return S.resolve(e.isEqual(i&&i.key))}performConsistencyCheck(t){return this.mutationQueue.length,S.resolve()}ei(t,e){return this.Xr(t)}Xr(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Zr(t){const e=this.Xr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yf{constructor(t){this.ti=t,this.docs=function(){return new Tt(O.comparator)}(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const r=e.key,i=this.docs.get(r),o=i?i.size:0,c=this.ti(e);return this.docs=this.docs.insert(r,{document:e.mutableCopy(),size:c}),this.size+=c-o,this.indexManager.addToCollectionParentIndex(t,r.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const r=this.docs.get(e);return S.resolve(r?r.document.mutableCopy():wt.newInvalidDocument(e))}getEntries(t,e){let r=sr();return e.forEach(i=>{const o=this.docs.get(i);r=r.insert(i,o?o.document.mutableCopy():wt.newInvalidDocument(i))}),S.resolve(r)}getDocumentsMatchingQuery(t,e,r,i){let o=sr();const c=e.path,u=new O(c.child("__id-9223372036854775808__")),f=this.docs.getIteratorFrom(u);for(;f.hasNext();){const{key:d,value:{document:T}}=f.getNext();if(!c.isPrefixOf(d.path))break;d.path.length>c.length+1||Vh(Ph(T),r)<=0||(i.has(T.key)||Fs(e,T))&&(o=o.insert(T.key,T.mutableCopy()))}return S.resolve(o)}getAllFromCollectionGroup(t,e,r,i){M(9500)}ni(t,e){return S.forEach(this.docs,r=>e(r))}newChangeBuffer(t){return new Zf(this)}getSize(t){return S.resolve(this.size)}}class Zf extends Hf{constructor(t){super(),this.Mr=t}applyChanges(t){const e=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?e.push(this.Mr.addEntry(t,i)):this.Mr.removeEntry(r)}),S.waitFor(e)}getFromCache(t,e){return this.Mr.getEntry(t,e)}getAllFromCache(t,e){return this.Mr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class td{constructor(t){this.persistence=t,this.ri=new _e(e=>Ms(e),Ls),this.lastRemoteSnapshotVersion=G.min(),this.highestTargetId=0,this.ii=0,this.si=new js,this.targetCount=0,this.oi=Ne._r()}forEachTarget(t,e){return this.ri.forEach((r,i)=>e(i)),S.resolve()}getLastRemoteSnapshotVersion(t){return S.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return S.resolve(this.ii)}allocateTargetId(t){return this.highestTargetId=this.oi.next(),S.resolve(this.highestTargetId)}setTargetsMetadata(t,e,r){return r&&(this.lastRemoteSnapshotVersion=r),e>this.ii&&(this.ii=e),S.resolve()}lr(t){this.ri.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.oi=new Ne(e),this.highestTargetId=e),t.sequenceNumber>this.ii&&(this.ii=t.sequenceNumber)}addTargetData(t,e){return this.lr(e),this.targetCount+=1,S.resolve()}updateTargetData(t,e){return this.lr(e),S.resolve()}removeTargetData(t,e){return this.ri.delete(e.target),this.si.Gr(e.targetId),this.targetCount-=1,S.resolve()}removeTargets(t,e,r){let i=0;const o=[];return this.ri.forEach((c,u)=>{u.sequenceNumber<=e&&r.get(u.targetId)===null&&(this.ri.delete(c),o.push(this.removeMatchingKeysForTargetId(t,u.targetId)),i++)}),S.waitFor(o).next(()=>i)}getTargetCount(t){return S.resolve(this.targetCount)}getTargetData(t,e){const r=this.ri.get(e)||null;return S.resolve(r)}addMatchingKeys(t,e,r){return this.si.$r(e,r),S.resolve()}removeMatchingKeys(t,e,r){this.si.Qr(e,r);const i=this.persistence.referenceDelegate,o=[];return i&&e.forEach(c=>{o.push(i.markPotentiallyOrphaned(t,c))}),S.waitFor(o)}removeMatchingKeysForTargetId(t,e){return this.si.Gr(e),S.resolve()}getMatchingKeysForTargetId(t,e){const r=this.si.jr(e);return S.resolve(r)}containsKey(t,e){return S.resolve(this.si.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(t,e){this._i={},this.overlays={},this.ai=new Vs(0),this.ui=!1,this.ui=!0,this.ci=new Jf,this.referenceDelegate=t(this),this.li=new td(this),this.indexManager=new Ff,this.remoteDocumentCache=function(i){return new Yf(i)}(r=>this.referenceDelegate.hi(r)),this.serializer=new Mf(e),this.Pi=new Wf(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new Qf,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let r=this._i[t.toKey()];return r||(r=new Xf(e,this.referenceDelegate),this._i[t.toKey()]=r),r}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(t,e,r){P("MemoryPersistence","Starting transaction:",t);const i=new ed(this.ai.next());return this.referenceDelegate.Ti(),r(i).next(o=>this.referenceDelegate.Ii(i).next(()=>o)).toPromise().then(o=>(i.raiseOnCommittedEvent(),o))}Ei(t,e){return S.or(Object.values(this._i).map(r=>()=>r.containsKey(t,e)))}}class ed extends Nh{constructor(t){super(),this.currentSequenceNumber=t}}class $s{constructor(t){this.persistence=t,this.Ri=new js,this.Ai=null}static Vi(t){return new $s(t)}get di(){if(this.Ai)return this.Ai;throw M(60996)}addReference(t,e,r){return this.Ri.addReference(r,e),this.di.delete(r.toString()),S.resolve()}removeReference(t,e,r){return this.Ri.removeReference(r,e),this.di.add(r.toString()),S.resolve()}markPotentiallyOrphaned(t,e){return this.di.add(e.toString()),S.resolve()}removeTarget(t,e){this.Ri.Gr(e.targetId).forEach(i=>this.di.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(t,e.targetId).next(i=>{i.forEach(o=>this.di.add(o.toString()))}).next(()=>r.removeTargetData(t,e))}Ti(){this.Ai=new Set}Ii(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return S.forEach(this.di,r=>{const i=O.fromPath(r);return this.mi(t,i).next(o=>{o||e.removeEntry(i,G.min())})}).next(()=>(this.Ai=null,e.apply(t)))}updateLimboDocument(t,e){return this.mi(t,e).next(r=>{r?this.di.delete(e.toString()):this.di.add(e.toString())})}hi(t){return 0}mi(t,e){return S.or([()=>S.resolve(this.Ri.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ei(t,e)])}}class ir{constructor(t,e){this.persistence=t,this.fi=new _e(r=>xh(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=zf(this,e)}static Vi(t,e){return new ir(t,e)}Ti(){}Ii(t){return S.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}dr(t){const e=this.pr(t);return this.persistence.getTargetCache().getTargetCount(t).next(r=>e.next(i=>r+i))}pr(t){let e=0;return this.mr(t,r=>{e++}).next(()=>e)}mr(t,e){return S.forEach(this.fi,(r,i)=>this.wr(t,r,i).next(o=>o?S.resolve():e(i)))}removeTargets(t,e,r){return this.persistence.getTargetCache().removeTargets(t,e,r)}removeOrphanedDocuments(t,e){let r=0;const i=this.persistence.getRemoteDocumentCache(),o=i.newChangeBuffer();return i.ni(t,c=>this.wr(t,c,e).next(u=>{u||(r++,o.removeEntry(c,G.min()))})).next(()=>o.apply(t)).next(()=>r)}markPotentiallyOrphaned(t,e){return this.fi.set(e,t.currentSequenceNumber),S.resolve()}removeTarget(t,e){const r=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,r)}addReference(t,e,r){return this.fi.set(r,t.currentSequenceNumber),S.resolve()}removeReference(t,e,r){return this.fi.set(r,t.currentSequenceNumber),S.resolve()}updateLimboDocument(t,e){return this.fi.set(e,t.currentSequenceNumber),S.resolve()}hi(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=Gn(t.data.value)),e}wr(t,e,r){return S.or([()=>this.persistence.Ei(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const i=this.fi.get(e);return S.resolve(i!==void 0&&i>r)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qs{constructor(t,e,r,i){this.targetId=t,this.fromCache=e,this.Ts=r,this.Is=i}static Es(t,e){let r=ht(),i=ht();for(const o of e.docChanges)switch(o.type){case 0:r=r.add(o.doc.key);break;case 1:i=i.add(o.doc.key)}return new qs(t,e.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nd{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rd{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return Jl()?8:kh(Kl())>0?6:4}()}initialize(t,e){this.fs=t,this.indexManager=e,this.Rs=!0}getDocumentsMatchingQuery(t,e,r,i){const o={result:null};return this.gs(t,e).next(c=>{o.result=c}).next(()=>{if(!o.result)return this.ps(t,e,i,r).next(c=>{o.result=c})}).next(()=>{if(o.result)return;const c=new nd;return this.ys(t,e,c).next(u=>{if(o.result=u,this.As)return this.ws(t,e,c,u.size)})}).next(()=>o.result)}ws(t,e,r,i){return r.documentReadCount<this.Vs?(ve()<=U.DEBUG&&P("QueryEngine","SDK will not create cache indexes for query:",Xe(e),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),S.resolve()):(ve()<=U.DEBUG&&P("QueryEngine","Query:",Xe(e),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.ds*i?(ve()<=U.DEBUG&&P("QueryEngine","The SDK decides to create cache indexes for query:",Xe(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,le(e))):S.resolve())}gs(t,e){if(Do(e))return S.resolve(null);let r=le(e);return this.indexManager.getIndexType(t,r).next(i=>i===0?null:(e.limit!==null&&i===1&&(e=ps(e,null,"F"),r=le(e)),this.indexManager.getDocumentsMatchingTarget(t,r).next(o=>{const c=ht(...o);return this.fs.getDocuments(t,c).next(u=>this.indexManager.getMinOffset(t,r).next(f=>{const d=this.bs(e,u);return this.Ss(e,d,c,f.readTime)?this.gs(t,ps(e,null,"F")):this.Ds(t,d,e,f)}))})))}ps(t,e,r,i){return Do(e)||i.isEqual(G.min())?S.resolve(null):this.fs.getDocuments(t,r).next(o=>{const c=this.bs(e,o);return this.Ss(e,c,r,i)?S.resolve(null):(ve()<=U.DEBUG&&P("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Xe(e)),this.Ds(t,c,e,Ch(i,un)).next(u=>u))})}bs(t,e){let r=new at(of(t));return e.forEach((i,o)=>{Fs(t,o)&&(r=r.add(o))}),r}Ss(t,e,r,i){if(t.limit===null)return!1;if(r.size!==e.size)return!0;const o=t.limitType==="F"?e.last():e.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(i)>0)}ys(t,e,r){return ve()<=U.DEBUG&&P("QueryEngine","Using full collection scan to execute query:",Xe(e)),this.fs.getDocumentsMatchingQuery(t,e,Wt.min(),r)}Ds(t,e,r,i){return this.fs.getDocumentsMatchingQuery(t,r,i).next(o=>(e.forEach(c=>{o=o.insert(c.key,c)}),o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sd="LocalStore";class id{constructor(t,e,r,i){this.persistence=t,this.Cs=e,this.serializer=i,this.vs=new Tt(B),this.Fs=new _e(o=>Ms(o),Ls),this.Ms=new Map,this.xs=t.getRemoteDocumentCache(),this.li=t.getTargetCache(),this.Pi=t.getBundleCache(),this.Os(r)}Os(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new Kf(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.vs))}}function od(n,t,e,r){return new id(n,t,e,r)}async function fc(n,t){const e=$(n);return await e.persistence.runTransaction("Handle user change","readonly",r=>{let i;return e.mutationQueue.getAllMutationBatches(r).next(o=>(i=o,e.Os(t),e.mutationQueue.getAllMutationBatches(r))).next(o=>{const c=[],u=[];let f=ht();for(const d of i){c.push(d.batchId);for(const T of d.mutations)f=f.add(T.key)}for(const d of o){u.push(d.batchId);for(const T of d.mutations)f=f.add(T.key)}return e.localDocuments.getDocuments(r,f).next(d=>({Ns:d,removedBatchIds:c,addedBatchIds:u}))})})}function ad(n,t){const e=$(n);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=t.batch.keys(),o=e.xs.newChangeBuffer({trackRemovals:!0});return function(u,f,d,T){const w=d.batch,R=w.keys();let V=S.resolve();return R.forEach(N=>{V=V.next(()=>T.getEntry(f,N)).next(L=>{const x=d.docVersions.get(N);Q(x!==null,48541),L.version.compareTo(x)<0&&(w.applyToRemoteDocument(L,d),L.isValidDocument()&&(L.setReadTime(d.commitVersion),T.addEntry(L)))})}),V.next(()=>u.mutationQueue.removeMutationBatch(f,w))}(e,r,t,o).next(()=>o.apply(r)).next(()=>e.mutationQueue.performConsistencyCheck(r)).next(()=>e.documentOverlayCache.removeOverlaysForBatchId(r,i,t.batch.batchId)).next(()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(u){let f=ht();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(f=f.add(u.batch.mutations[d].key));return f}(t))).next(()=>e.localDocuments.getDocuments(r,i))})}function cd(n){const t=$(n);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.li.getLastRemoteSnapshotVersion(e))}function ld(n,t){const e=$(n);return e.persistence.runTransaction("Get next mutation batch","readonly",r=>(t===void 0&&(t=Ds),e.mutationQueue.getNextMutationBatchAfterBatchId(r,t)))}class Bo{constructor(){this.activeTargetIds=ff()}Qs(t){this.activeTargetIds=this.activeTargetIds.add(t)}Gs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Ws(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class ud{constructor(){this.vo=new Bo,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,r){}addLocalQueryTarget(t,e=!0){return e&&this.vo.Qs(t),this.Fo[t]||"not-current"}updateQueryState(t,e,r){this.Fo[t]=e}removeLocalQueryTarget(t){this.vo.Gs(t)}isLocalQueryTarget(t){return this.vo.activeTargetIds.has(t)}clearQueryState(t){delete this.Fo[t]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(t){return this.vo.activeTargetIds.has(t)}start(){return this.vo=new Bo,Promise.resolve()}handleUserChange(t,e,r){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hd{Mo(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jo="ConnectivityMonitor";class $o{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(t){this.Lo.push(t)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){P(jo,"Network connectivity changed: AVAILABLE");for(const t of this.Lo)t(0)}Bo(){P(jo,"Network connectivity changed: UNAVAILABLE");for(const t of this.Lo)t(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qn=null;function ys(){return qn===null?qn=function(){return 268435456+Math.round(2147483648*Math.random())}():qn++,"0x"+qn.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jr="RestConnection",fd={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class dd{get Ko(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.qo=e+"://"+t.host,this.Uo=`projects/${r}/databases/${i}`,this.$o=this.databaseId.database===tr?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(t,e,r,i,o){const c=ys(),u=this.Qo(t,e.toUriEncodedString());P(Jr,`Sending RPC '${t}' ${c}:`,u,r);const f={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(f,i,o);const{host:d}=new URL(u),T=vs(d);return this.zo(t,u,f,r,T).then(w=>(P(Jr,`Received RPC '${t}' ${c}: `,w),w),w=>{throw ln(Jr,`RPC '${t}' ${c} failed with error: `,w,"url: ",u,"request:",r),w})}jo(t,e,r,i,o,c){return this.Wo(t,e,r,i,o)}Go(t,e,r){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+ke}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((i,o)=>t[o]=i),r&&r.headers.forEach((i,o)=>t[o]=i)}Qo(t,e){const r=fd[t];let i=`${this.qo}/v1/${e}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pd{constructor(t){this.Ho=t.Ho,this.Jo=t.Jo}Zo(t){this.Xo=t}Yo(t){this.e_=t}t_(t){this.n_=t}onMessage(t){this.r_=t}close(){this.Jo()}send(t){this.Ho(t)}i_(){this.Xo()}s_(){this.e_()}o_(t){this.n_(t)}__(t){this.r_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lt="WebChannelConnection",Ye=(n,t,e)=>{n.listen(t,r=>{try{e(r)}catch(i){setTimeout(()=>{throw i},0)}})};class Re extends dd{constructor(t){super(t),this.a_=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}static u_(){if(!Re.c_){const t=Sa();Ye(t,Ra.STAT_EVENT,e=>{e.stat===as.PROXY?P(lt,"STAT_EVENT: detected buffering proxy"):e.stat===as.NOPROXY&&P(lt,"STAT_EVENT: detected no buffering proxy")}),Re.c_=!0}}zo(t,e,r,i,o){const c=ys();return new Promise((u,f)=>{const d=new wa;d.setWithCredentials(!0),d.listenOnce(Aa.COMPLETE,()=>{try{switch(d.getLastErrorCode()){case Hn.NO_ERROR:const w=d.getResponseJson();P(lt,`XHR for RPC '${t}' ${c} received:`,JSON.stringify(w)),u(w);break;case Hn.TIMEOUT:P(lt,`RPC '${t}' ${c} timed out`),f(new D(b.DEADLINE_EXCEEDED,"Request time out"));break;case Hn.HTTP_ERROR:const R=d.getStatus();if(P(lt,`RPC '${t}' ${c} failed with status:`,R,"response text:",d.getResponseText()),R>0){let V=d.getResponseJson();Array.isArray(V)&&(V=V[0]);const N=V?.error;if(N&&N.status&&N.message){const L=function(z){const H=z.toLowerCase().replace(/_/g,"-");return Object.values(b).indexOf(H)>=0?H:b.UNKNOWN}(N.status);f(new D(L,N.message))}else f(new D(b.UNKNOWN,"Server responded with status "+d.getStatus()))}else f(new D(b.UNAVAILABLE,"Connection failed."));break;default:M(9055,{l_:t,streamId:c,h_:d.getLastErrorCode(),P_:d.getLastError()})}}finally{P(lt,`RPC '${t}' ${c} completed.`)}});const T=JSON.stringify(i);P(lt,`RPC '${t}' ${c} sending request:`,i),d.send(e,"POST",T,r,15)})}T_(t,e,r){const i=ys(),o=[this.qo,"/","google.firestore.v1.Firestore","/",t,"/channel"],c=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},f=this.longPollingOptions.timeoutSeconds;f!==void 0&&(u.longPollingTimeout=Math.round(1e3*f)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,e,r),u.encodeInitMessageHeaders=!0;const d=o.join("");P(lt,`Creating RPC '${t}' stream ${i}: ${d}`,u);const T=c.createWebChannel(d,u);this.I_(T);let w=!1,R=!1;const V=new pd({Ho:N=>{R?P(lt,`Not sending because RPC '${t}' stream ${i} is closed:`,N):(w||(P(lt,`Opening RPC '${t}' stream ${i} transport.`),T.open(),w=!0),P(lt,`RPC '${t}' stream ${i} sending:`,N),T.send(N))},Jo:()=>T.close()});return Ye(T,Ze.EventType.OPEN,()=>{R||(P(lt,`RPC '${t}' stream ${i} transport opened.`),V.i_())}),Ye(T,Ze.EventType.CLOSE,()=>{R||(R=!0,P(lt,`RPC '${t}' stream ${i} transport closed`),V.o_(),this.E_(T))}),Ye(T,Ze.EventType.ERROR,N=>{R||(R=!0,ln(lt,`RPC '${t}' stream ${i} transport errored. Name:`,N.name,"Message:",N.message),V.o_(new D(b.UNAVAILABLE,"The operation could not be completed")))}),Ye(T,Ze.EventType.MESSAGE,N=>{if(!R){const L=N.data[0];Q(!!L,16349);const x=L,z=x?.error||x[0]?.error;if(z){P(lt,`RPC '${t}' stream ${i} received error:`,z);const H=z.status;let X=function(_t){const y=Y[_t];if(y!==void 0)return wf(y)}(H),gt=z.message;H==="NOT_FOUND"&&gt.includes("database")&&gt.includes("does not exist")&&gt.includes(this.databaseId.database)&&ln(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),X===void 0&&(X=b.INTERNAL,gt="Unknown error status: "+H+" with message "+z.message),R=!0,V.o_(new D(X,gt)),T.close()}else P(lt,`RPC '${t}' stream ${i} received:`,L),V.__(L)}}),Re.u_(),setTimeout(()=>{V.s_()},0),V}terminate(){this.a_.forEach(t=>t.close()),this.a_=[]}I_(t){this.a_.push(t)}E_(t){this.a_=this.a_.filter(e=>e===t)}Go(t,e,r){super.Go(t,e,r),this.databaseInfo.apiKey&&(t["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return ba()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function md(n){return new Re(n)}function Xr(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pr(n){return new Af(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Re.c_=!1;class dc{constructor(t,e,r=1e3,i=1.5,o=6e4){this.Ci=t,this.timerId=e,this.R_=r,this.A_=i,this.V_=o,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(t){this.cancel();const e=Math.floor(this.d_+this.y_()),r=Math.max(0,Date.now()-this.f_),i=Math.max(0,e-r);i>0&&P("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.d_} ms, delay with jitter: ${e} ms, last attempt: ${r} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,i,()=>(this.f_=Date.now(),t())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qo="PersistentStream";class gd{constructor(t,e,r,i,o,c,u,f){this.Ci=t,this.b_=r,this.S_=i,this.connection=o,this.authCredentialsProvider=c,this.appCheckCredentialsProvider=u,this.listener=f,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new dc(t,e)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(t){this.q_(),this.stream.send(t)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(t,e){this.q_(),this.U_(),this.M_.cancel(),this.D_++,t!==4?this.M_.reset():e&&e.code===b.RESOURCE_EXHAUSTED?(fe(e.toString()),fe("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):e&&e.code===b.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.t_(e)}W_(){}auth(){this.state=1;const t=this.Q_(this.D_),e=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.D_===e&&this.G_(r,i)},r=>{t(()=>{const i=new D(b.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(i)})})}G_(t,e){const r=this.Q_(this.D_);this.stream=this.j_(t,e),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.Yo(()=>{r(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(i=>{r(()=>this.z_(i))}),this.stream.onMessage(i=>{r(()=>++this.F_==1?this.H_(i):this.onNext(i))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(t){return P(qo,`close with error: ${t}`),this.stream=null,this.close(4,t)}Q_(t){return e=>{this.Ci.enqueueAndForget(()=>this.D_===t?e():(P(qo,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class _d extends gd{constructor(t,e,r,i,o,c){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,r,i,c),this.serializer=o}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(t,e){return this.connection.T_("Write",t,e)}H_(t){return Q(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,Q(!t.writeResults||t.writeResults.length===0,55816),this.listener.ta()}onNext(t){Q(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.M_.reset();const e=Nf(t.writeResults,t.commitTime),r=Ae(t.commitTime);return this.listener.na(r,e)}ra(){const t={};t.database=Pf(this.serializer),this.K_(t)}ea(t){const e={streamToken:this.lastStreamToken,writes:t.map(r=>Df(this.serializer,r))};this.K_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yd{}class Ed extends yd{constructor(t,e,r,i){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=r,this.serializer=i,this.ia=!1}sa(){if(this.ia)throw new D(b.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(t,e,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Wo(t,gs(e,r),i,o,c)).catch(o=>{throw o.name==="FirebaseError"?(o.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new D(b.UNKNOWN,o.toString())})}jo(t,e,r,i,o){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([c,u])=>this.connection.jo(t,gs(e,r),i,c,u,o)).catch(c=>{throw c.name==="FirebaseError"?(c.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),c):new D(b.UNKNOWN,c.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}function Td(n,t,e,r){return new Ed(n,t,e,r)}class Id{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(t){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ca("Offline")))}set(t){this.Pa(),this.oa=0,t==="Online"&&(this.aa=!1),this.ca(t)}ca(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}la(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(fe(e),this.aa=!1):P("OnlineStateTracker",e)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const In="RemoteStore";class vd{constructor(t,e,r,i,o){this.localStore=t,this.datastore=e,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=o,this.Aa.Mo(c=>{r.enqueueAndForget(async()=>{wn(this)&&(P(In,"Restarting streams for network reachability change."),await async function(f){const d=$(f);d.Ea.add(4),await vn(d),d.Va.set("Unknown"),d.Ea.delete(4),await mr(d)}(this))})}),this.Va=new Id(r,i)}}async function mr(n){if(wn(n))for(const t of n.Ra)await t(!0)}async function vn(n){for(const t of n.Ra)await t(!1)}function wn(n){return $(n).Ea.size===0}async function pc(n,t,e){if(!En(t))throw t;n.Ea.add(1),await vn(n),n.Va.set("Offline"),e||(e=()=>cd(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{P(In,"Retrying IndexedDB access"),await e(),n.Ea.delete(1),await mr(n)})}function mc(n,t){return t().catch(e=>pc(n,e,t))}async function gr(n){const t=$(n),e=Jt(t);let r=t.Ta.length>0?t.Ta[t.Ta.length-1].batchId:Ds;for(;wd(t);)try{const i=await ld(t.localStore,r);if(i===null){t.Ta.length===0&&e.L_();break}r=i.batchId,Ad(t,i)}catch(i){await pc(t,i)}gc(t)&&_c(t)}function wd(n){return wn(n)&&n.Ta.length<10}function Ad(n,t){n.Ta.push(t);const e=Jt(n);e.O_()&&e.Y_&&e.ea(t.mutations)}function gc(n){return wn(n)&&!Jt(n).x_()&&n.Ta.length>0}function _c(n){Jt(n).start()}async function Rd(n){Jt(n).ra()}async function Sd(n){const t=Jt(n);for(const e of n.Ta)t.ea(e.mutations)}async function bd(n,t,e){const r=n.Ta.shift(),i=Bs.from(r,t,e);await mc(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await gr(n)}async function Cd(n,t){t&&Jt(n).Y_&&await async function(r,i){if(function(c){return vf(c)&&c!==b.ABORTED}(i.code)){const o=r.Ta.shift();Jt(r).B_(),await mc(r,()=>r.remoteSyncer.rejectFailedWrite(o.batchId,i)),await gr(r)}}(n,t),gc(n)&&_c(n)}async function zo(n,t){const e=$(n);e.asyncQueue.verifyOperationInProgress(),P(In,"RemoteStore received new credentials");const r=wn(e);e.Ea.add(3),await vn(e),r&&e.Va.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.Ea.delete(3),await mr(e)}async function Pd(n,t){const e=$(n);t?(e.Ea.delete(2),await mr(e)):t||(e.Ea.add(2),await vn(e),e.Va.set("Unknown"))}function Jt(n){return n.fa||(n.fa=function(e,r,i){const o=$(e);return o.sa(),new _d(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,i)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),Yo:Rd.bind(null,n),t_:Cd.bind(null,n),ta:Sd.bind(null,n),na:bd.bind(null,n)}),n.Ra.push(async t=>{t?(n.fa.B_(),await gr(n)):(await n.fa.stop(),n.Ta.length>0&&(P(In,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zs{constructor(t,e,r,i,o){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=r,this.op=i,this.removalCallback=o,this.deferred=new ce,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(c=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,r,i,o){const c=Date.now()+r,u=new zs(t,e,c,i,o);return u.start(r),u}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(b.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function yc(n,t){if(fe("AsyncQueue",`${t}: ${n}`),En(n))return new D(b.UNAVAILABLE,`${t}: ${n}`);throw n}class Vd{constructor(){this.queries=Ho(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(e,r){const i=$(e),o=i.queries;i.queries=Ho(),o.forEach((c,u)=>{for(const f of u.ba)f.onError(r)})})(this,new D(b.ABORTED,"Firestore shutting down"))}}function Ho(){return new _e(n=>Ka(n),Ga)}function Dd(n){n.Ca.forEach(t=>{t.next()})}var Go,Ko;(Ko=Go||(Go={})).Ma="default",Ko.Cache="cache";const Nd="SyncEngine";class kd{constructor(t,e,r,i,o,c){this.localStore=t,this.remoteStore=e,this.eventManager=r,this.sharedClientState=i,this.currentUser=o,this.maxConcurrentLimboResolutions=c,this.Pu={},this.Tu=new _e(u=>Ka(u),Ga),this.Iu=new Map,this.Eu=new Set,this.Ru=new Tt(O.comparator),this.Au=new Map,this.Vu=new js,this.du={},this.mu=new Map,this.fu=Ne.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function Od(n,t,e){const r=Fd(n);try{const i=await function(c,u){const f=$(c),d=K.now(),T=u.reduce((V,N)=>V.add(N.key),ht());let w,R;return f.persistence.runTransaction("Locally write mutations","readwrite",V=>{let N=sr(),L=ht();return f.xs.getEntries(V,T).next(x=>{N=x,N.forEach((z,H)=>{H.isValidDocument()||(L=L.add(z))})}).next(()=>f.localDocuments.getOverlayedDocuments(V,N)).next(x=>{w=x;const z=[];for(const H of u){const X=yf(H,w.get(H.key).overlayedDocument);X!=null&&z.push(new ye(H.key,X,Ua(X.value.mapValue),xt.exists(!0)))}return f.mutationQueue.addMutationBatch(V,d,z,u)}).next(x=>{R=x;const z=x.applyToLocalDocumentSet(w,L);return f.documentOverlayCache.saveOverlays(V,x.batchId,z)})}).then(()=>({batchId:R.batchId,changes:Qa(w)}))}(r.localStore,t);r.sharedClientState.addPendingMutation(i.batchId),function(c,u,f){let d=c.du[c.currentUser.toKey()];d||(d=new Tt(B)),d=d.insert(u,f),c.du[c.currentUser.toKey()]=d}(r,i.batchId,e),await _r(r,i.changes),await gr(r.remoteStore)}catch(i){const o=yc(i,"Failed to persist write");e.reject(o)}}function Wo(n,t,e){const r=$(n);if(r.isPrimaryClient&&e===0||!r.isPrimaryClient&&e===1){const i=[];r.Tu.forEach((o,c)=>{const u=c.view.va(t);u.snapshot&&i.push(u.snapshot)}),function(c,u){const f=$(c);f.onlineState=u;let d=!1;f.queries.forEach((T,w)=>{for(const R of w.ba)R.va(u)&&(d=!0)}),d&&Dd(f)}(r.eventManager,t),i.length&&r.Pu.J_(i),r.onlineState=t,r.isPrimaryClient&&r.sharedClientState.setOnlineState(t)}}async function xd(n,t){const e=$(n),r=t.batch.batchId;try{const i=await ad(e.localStore,t);Tc(e,r,null),Ec(e,r),e.sharedClientState.updateMutationState(r,"acknowledged"),await _r(e,i)}catch(i){await Ps(i)}}async function Md(n,t,e){const r=$(n);try{const i=await function(c,u){const f=$(c);return f.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let T;return f.mutationQueue.lookupMutationBatch(d,u).next(w=>(Q(w!==null,37113),T=w.keys(),f.mutationQueue.removeMutationBatch(d,w))).next(()=>f.mutationQueue.performConsistencyCheck(d)).next(()=>f.documentOverlayCache.removeOverlaysForBatchId(d,T,u)).next(()=>f.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,T)).next(()=>f.localDocuments.getDocuments(d,T))})}(r.localStore,t);Tc(r,t,e),Ec(r,t),r.sharedClientState.updateMutationState(t,"rejected",e),await _r(r,i)}catch(i){await Ps(i)}}function Ec(n,t){(n.mu.get(t)||[]).forEach(e=>{e.resolve()}),n.mu.delete(t)}function Tc(n,t,e){const r=$(n);let i=r.du[r.currentUser.toKey()];if(i){const o=i.get(t);o&&(e?o.reject(e):o.resolve(),i=i.remove(t)),r.du[r.currentUser.toKey()]=i}}async function _r(n,t,e){const r=$(n),i=[],o=[],c=[];r.Tu.isEmpty()||(r.Tu.forEach((u,f)=>{c.push(r.pu(f,t,e).then(d=>{if((d||e)&&r.isPrimaryClient){const T=d?!d.fromCache:e?.targetChanges.get(f.targetId)?.current;r.sharedClientState.updateQueryState(f.targetId,T?"current":"not-current")}if(d){i.push(d);const T=qs.Es(f.targetId,d);o.push(T)}}))}),await Promise.all(c),r.Pu.J_(i),await async function(f,d){const T=$(f);try{await T.persistence.runTransaction("notifyLocalViewChanges","readwrite",w=>S.forEach(d,R=>S.forEach(R.Ts,V=>T.persistence.referenceDelegate.addReference(w,R.targetId,V)).next(()=>S.forEach(R.Is,V=>T.persistence.referenceDelegate.removeReference(w,R.targetId,V)))))}catch(w){if(!En(w))throw w;P(sd,"Failed to update sequence numbers: "+w)}for(const w of d){const R=w.targetId;if(!w.fromCache){const V=T.vs.get(R),N=V.snapshotVersion,L=V.withLastLimboFreeSnapshotVersion(N);T.vs=T.vs.insert(R,L)}}}(r.localStore,o))}async function Ld(n,t){const e=$(n);if(!e.currentUser.isEqual(t)){P(Nd,"User change. New user:",t.toKey());const r=await fc(e.localStore,t);e.currentUser=t,function(o,c){o.mu.forEach(u=>{u.forEach(f=>{f.reject(new D(b.CANCELLED,c))})}),o.mu.clear()}(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,r.removedBatchIds,r.addedBatchIds),await _r(e,r.Ns)}}function Fd(n){const t=$(n);return t.remoteStore.remoteSyncer.applySuccessfulWrite=xd.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=Md.bind(null,t),t}class or{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=pr(t.databaseInfo.databaseId),this.sharedClientState=this.Du(t),this.persistence=this.Cu(t),await this.persistence.start(),this.localStore=this.vu(t),this.gcScheduler=this.Fu(t,this.localStore),this.indexBackfillerScheduler=this.Mu(t,this.localStore)}Fu(t,e){return null}Mu(t,e){return null}vu(t){return od(this.persistence,new rd,t.initialUser,this.serializer)}Cu(t){return new hc($s.Vi,this.serializer)}Du(t){return new ud}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}or.provider={build:()=>new or};class Ud extends or{constructor(t){super(),this.cacheSizeBytes=t}Fu(t,e){Q(this.persistence.referenceDelegate instanceof ir,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new $f(r,t.asyncQueue,e)}Cu(t){const e=this.cacheSizeBytes!==void 0?Et.withCacheSize(this.cacheSizeBytes):Et.DEFAULT;return new hc(r=>ir.Vi(r,e),this.serializer)}}class Es{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Wo(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Ld.bind(null,this.syncEngine),await Pd(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return function(){return new Vd}()}createDatastore(t){const e=pr(t.databaseInfo.databaseId),r=md(t.databaseInfo);return Td(t.authCredentials,t.appCheckCredentials,r,e)}createRemoteStore(t){return function(r,i,o,c,u){return new vd(r,i,o,c,u)}(this.localStore,this.datastore,t.asyncQueue,e=>Wo(this.syncEngine,e,0),function(){return $o.v()?new $o:new hd}())}createSyncEngine(t,e){return function(i,o,c,u,f,d,T){const w=new kd(i,o,c,u,f,d);return T&&(w.gu=!0),w}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){await async function(e){const r=$(e);P(In,"RemoteStore shutting down."),r.Ea.add(5),await vn(r),r.Aa.shutdown(),r.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}Es.provider={build:()=>new Es};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xt="FirestoreClient";class Bd{constructor(t,e,r,i,o){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=r,this._databaseInfo=i,this.user=ut.UNAUTHENTICATED,this.clientId=bs.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(r,async c=>{P(Xt,"Received user=",c.uid),await this.authCredentialListener(c),this.user=c}),this.appCheckCredentials.start(r,c=>(P(Xt,"Received new app check token=",c),this.appCheckCredentialListener(c,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new ce;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const r=yc(e,"Failed to shutdown persistence");t.reject(r)}}),t.promise}}async function Yr(n,t){n.asyncQueue.verifyOperationInProgress(),P(Xt,"Initializing OfflineComponentProvider");const e=n.configuration;await t.initialize(e);let r=e.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await fc(t.localStore,i),r=i)}),t.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=t}async function Qo(n,t){n.asyncQueue.verifyOperationInProgress();const e=await jd(n);P(Xt,"Initializing OnlineComponentProvider"),await t.initialize(e,n.configuration),n.setCredentialChangeListener(r=>zo(t.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>zo(t.remoteStore,i)),n._onlineComponents=t}async function jd(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){P(Xt,"Using user provided OfflineComponentProvider");try{await Yr(n,n._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!function(i){return i.name==="FirebaseError"?i.code===b.FAILED_PRECONDITION||i.code===b.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(e))throw e;ln("Error using user provided cache. Falling back to memory cache: "+e),await Yr(n,new or)}}else P(Xt,"Using default OfflineComponentProvider"),await Yr(n,new Ud(void 0));return n._offlineComponents}async function $d(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(P(Xt,"Using user provided OnlineComponentProvider"),await Qo(n,n._uninitializedComponentsProvider._online)):(P(Xt,"Using default OnlineComponentProvider"),await Qo(n,new Es))),n._onlineComponents}function qd(n){return $d(n).then(t=>t.syncEngine)}function zd(n,t){const e=new ce;return n.asyncQueue.enqueueAndForget(async()=>Od(await qd(n),t,e)),e.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ic(n){const t={};return n.timeoutSeconds!==void 0&&(t.timeoutSeconds=n.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hd="ComponentProvider",Jo=new Map;function Gd(n,t,e,r,i){return new Uh(n,t,e,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,Ic(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vc="firestore.googleapis.com",Xo=!0;class Yo{constructor(t){if(t.host===void 0){if(t.ssl!==void 0)throw new D(b.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=vc,this.ssl=Xo}else this.host=t.host,this.ssl=t.ssl??Xo;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=uc;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<Bf)throw new D(b.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}bh("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ic(t.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new D(b.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new D(b.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new D(b.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class Hs{constructor(t,e,r,i){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Yo({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(b.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new D(b.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Yo(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new gh;switch(r.type){case"firstParty":return new Th(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new D(b.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const r=Jo.get(e);r&&(P(Hd,"Removing Datastore"),Jo.delete(e),r.terminate())}(this),Promise.resolve()}}function Kd(n,t,e,r={}){n=ls(n,Hs);const i=vs(t),o=n._getSettings(),c={...o,emulatorOptions:n._getEmulatorOptions()},u=`${t}:${e}`;i&&($l(`https://${u}`),Gl("Firestore",!0)),o.host!==vc&&o.host!==u&&ln("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const f={...o,host:u,ssl:i,emulatorOptions:r};if(!an(f,c)&&(n._setSettings(f),r.mockUserToken)){let d,T;if(typeof r.mockUserToken=="string")d=r.mockUserToken,T=ut.MOCK_USER;else{d=ql(r.mockUserToken,n._app?.options.projectId);const w=r.mockUserToken.sub||r.mockUserToken.user_id;if(!w)throw new D(b.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");T=new ut(w)}n._authCredentials=new _h(new Pa(d,T))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gs{constructor(t,e,r){this.converter=e,this._query=r,this.type="query",this.firestore=t}withConverter(t){return new Gs(this.firestore,t,this._query)}}class ft{constructor(t,e,r){this.converter=e,this._key=r,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new gn(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new ft(this.firestore,t,this._key)}toJSON(){return{type:ft._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,r){if(yn(e,ft._jsonSchema))return new ft(t,r||null,new O(J.fromString(e.referencePath)))}}ft._jsonSchemaVersion="firestore/documentReference/1.0",ft._jsonSchema={type:Z("string",ft._jsonSchemaVersion),referencePath:Z("string")};class gn extends Gs{constructor(t,e,r){super(t,e,ef(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new ft(this.firestore,null,new O(t))}withConverter(t){return new gn(this.firestore,t,this._path)}}function Dm(n,t,...e){if(n=ue(n),arguments.length===1&&(t=bs.newId()),Sh("doc","path",t),n instanceof Hs){const r=J.fromString(t,...e);return To(r),new ft(n,null,new O(r))}{if(!(n instanceof ft||n instanceof gn))throw new D(b.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(J.fromString(t,...e));return To(r),new ft(n.firestore,n instanceof gn?n.converter:null,new O(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zo="AsyncQueue";class ta{constructor(t=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new dc(this,"async_queue_retry"),this._c=()=>{const r=Xr();r&&P(Zo,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=t;const e=Xr();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.uc(),this.cc(t)}enterRestrictedMode(t){if(!this.ec){this.ec=!0,this.sc=t||!1;const e=Xr();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this._c)}}enqueue(t){if(this.uc(),this.ec)return new Promise(()=>{});const e=new ce;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Yu.push(t),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(t){if(!En(t))throw t;P(Zo,"Operation failed with retryable error: "+t)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(t){const e=this.ac.then(()=>(this.rc=!0,t().catch(r=>{throw this.nc=r,this.rc=!1,fe("INTERNAL UNHANDLED ERROR: ",ea(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=e,e}enqueueAfterDelay(t,e,r){this.uc(),this.oc.indexOf(t)>-1&&(e=0);const i=zs.createAndSchedule(this,t,e,r,o=>this.hc(o));return this.tc.push(i),i}uc(){this.nc&&M(47125,{Pc:ea(this.nc)})}verifyOperationInProgress(){}async Tc(){let t;do t=this.ac,await t;while(t!==this.ac)}Ic(t){for(const e of this.tc)if(e.timerId===t)return!0;return!1}Ec(t){return this.Tc().then(()=>{this.tc.sort((e,r)=>e.targetTimeMs-r.targetTimeMs);for(const e of this.tc)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.Tc()})}Rc(t){this.oc.push(t)}hc(t){const e=this.tc.indexOf(t);this.tc.splice(e,1)}}function ea(n){let t=n.message||"";return n.stack&&(t=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),t}class wc extends Hs{constructor(t,e,r,i){super(t,e,r,i),this.type="firestore",this._queue=new ta,this._persistenceKey=i?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new ta(t),this._firestoreClient=void 0,await t}}}function Nm(n,t){const e=typeof n=="object"?n:Ta(),r=typeof n=="string"?n:tr,i=_n(e,"firestore").getImmediate({identifier:r});if(!i._initialized){const o=Bl("firestore");o&&Kd(i,...o)}return i}function Wd(n){if(n._terminated)throw new D(b.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Qd(n),n._firestoreClient}function Qd(n){const t=n._freezeSettings(),e=Gd(n._databaseId,n._app?.options.appId||"",n._persistenceKey,n._app?.options.apiKey,t);n._componentsProvider||t.localCache?._offlineComponentProvider&&t.localCache?._onlineComponentProvider&&(n._componentsProvider={_offline:t.localCache._offlineComponentProvider,_online:t.localCache._onlineComponentProvider}),n._firestoreClient=new Bd(n._authCredentials,n._appCheckCredentials,n._queue,e,n._componentsProvider&&function(i){const o=i?._online.build();return{_offline:i?._offline.build(o),_online:o}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Rt(Nt.fromBase64String(t))}catch(e){throw new D(b.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new Rt(Nt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:Rt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(yn(t,Rt._jsonSchema))return Rt.fromBase64String(t.bytes)}}Rt._jsonSchemaVersion="firestore/bytes/1.0",Rt._jsonSchema={type:Z("string",Rt._jsonSchemaVersion),bytes:Z("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new D(b.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ot(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yr{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new D(b.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new D(b.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return B(this._lat,t._lat)||B(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Mt._jsonSchemaVersion}}static fromJSON(t){if(yn(t,Mt._jsonSchema))return new Mt(t.latitude,t.longitude)}}Mt._jsonSchemaVersion="firestore/geoPoint/1.0",Mt._jsonSchema={type:Z("string",Mt._jsonSchemaVersion),latitude:Z("number"),longitude:Z("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(r,i){if(r.length!==i.length)return!1;for(let o=0;o<r.length;++o)if(r[o]!==i[o])return!1;return!0}(this._values,t._values)}toJSON(){return{type:Dt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(yn(t,Dt._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(e=>typeof e=="number"))return new Dt(t.vectorValues);throw new D(b.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Dt._jsonSchemaVersion="firestore/vectorValue/1.0",Dt._jsonSchema={type:Z("string",Dt._jsonSchemaVersion),vectorValues:Z("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jd=/^__.*__$/;class Xd{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return this.fieldMask!==null?new ye(t,this.data,this.fieldMask,e,this.fieldTransforms):new Tn(t,this.data,e,this.fieldTransforms)}}function Rc(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw M(40011,{dataSource:n})}}class Ks{constructor(t,e,r,i,o,c){this.settings=t,this.databaseId=e,this.serializer=r,this.ignoreUndefinedProperties=i,o===void 0&&this.validatePath(),this.fieldTransforms=o||[],this.fieldMask=c||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(t){return new Ks({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(t){const e=this.path?.child(t),r=this.contextWith({path:e,arrayElement:!1});return r.validatePathSegment(t),r}childContextForFieldPath(t){const e=this.path?.child(t),r=this.contextWith({path:e,arrayElement:!1});return r.validatePath(),r}childContextForArray(t){return this.contextWith({path:void 0,arrayElement:!0})}createError(t){return ar(t,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}validatePath(){if(this.path)for(let t=0;t<this.path.length;t++)this.validatePathSegment(this.path.get(t))}validatePathSegment(t){if(t.length===0)throw this.createError("Document fields must not be empty");if(Rc(this.dataSource)&&Jd.test(t))throw this.createError('Document fields cannot begin and end with "__"')}}class Yd{constructor(t,e,r){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=r||pr(t)}createContext(t,e,r,i=!1){return new Ks({dataSource:t,methodName:e,targetDoc:r,path:ot.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Zd(n){const t=n._freezeSettings(),e=pr(n._databaseId);return new Yd(n._databaseId,!!t.ignoreUndefinedProperties,e)}function tp(n,t,e,r,i,o={}){const c=n.createContext(o.merge||o.mergeFields?2:0,t,e,i);Pc("Data must be an object, but it was:",c,r);const u=bc(r,c);let f,d;if(o.merge)f=new St(c.fieldMask),d=c.fieldTransforms;else if(o.mergeFields){const T=[];for(const w of o.mergeFields){const R=Js(t,w,e);if(!c.contains(R))throw new D(b.INVALID_ARGUMENT,`Field '${R}' is specified in your field mask but missing from your input data.`);rp(T,R)||T.push(R)}f=new St(T),d=c.fieldTransforms.filter(w=>f.covers(w.field))}else f=null,d=c.fieldTransforms;return new Xd(new At(u),f,d)}class Ws extends yr{_toFieldTransform(t){return new rc(t.path,new fn)}isEqual(t){return t instanceof Ws}}class Qs extends yr{constructor(t,e){super(t),this.Vc=e}_toFieldTransform(t){const e=new mn(t.serializer,Ya(t.serializer,this.Vc));return new rc(t.path,e)}isEqual(t){return t instanceof Qs&&this.Vc===t.Vc}}function Sc(n,t){if(Cc(n=ue(n)))return Pc("Unsupported field value:",t,n),bc(n,t);if(n instanceof yr)return function(r,i){if(!Rc(i.dataSource))throw i.createError(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${r._methodName}() is not currently supported inside arrays`);const o=r._toFieldTransform(i);o&&i.fieldTransforms.push(o)}(n,t),null;if(n===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),n instanceof Array){if(t.settings.arrayElement&&t.dataSource!==4)throw t.createError("Nested arrays are not supported");return function(r,i){const o=[];let c=0;for(const u of r){let f=Sc(u,i.childContextForArray(c));f==null&&(f={nullValue:"NULL_VALUE"}),o.push(f),c++}return{arrayValue:{values:o}}}(n,t)}return function(r,i){if((r=ue(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return Ya(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const o=K.fromDate(r);return{timestampValue:ms(i.serializer,o)}}if(r instanceof K){const o=new K(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:ms(i.serializer,o)}}if(r instanceof Mt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Rt)return{bytesValue:Rf(i.serializer,r._byteString)};if(r instanceof ft){const o=i.databaseId,c=r.firestore._databaseId;if(!c.isEqual(o))throw i.createError(`Document reference is for database ${c.projectId}/${c.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:ac(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof Dt)return function(c,u){const f=c instanceof Dt?c.toArray():c;return{mapValue:{fields:{[La]:{stringValue:Fa},[us]:{arrayValue:{values:f.map(T=>{if(typeof T!="number")throw u.createError("VectorValues must only contain numeric values.");return Us(u.serializer,T)})}}}}}}(r,i);if(lc(r))return r._toProto(i.serializer);throw i.createError(`Unsupported field value: ${Cs(r)}`)}(n,t)}function bc(n,t){const e={};return Na(n)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Oe(n,(r,i)=>{const o=Sc(i,t.childContextForField(r));o!=null&&(e[r]=o)}),{mapValue:{fields:e}}}function Cc(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof K||n instanceof Mt||n instanceof Rt||n instanceof ft||n instanceof yr||n instanceof Dt||lc(n))}function Pc(n,t,e){if(!Cc(e)||!Va(e)){const r=Cs(e);throw r==="an object"?t.createError(n+" a custom object"):t.createError(n+" "+r)}}function Js(n,t,e){if((t=ue(t))instanceof Ac)return t._internalPath;if(typeof t=="string")return np(n,t);throw ar("Field path arguments must be of type string or ",n,!1,void 0,e)}const ep=new RegExp("[~\\*/\\[\\]]");function np(n,t,e){if(t.search(ep)>=0)throw ar(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,e);try{return new Ac(...t.split("."))._internalPath}catch{throw ar(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,e)}}function ar(n,t,e,r,i){const o=r&&!r.isEmpty(),c=i!==void 0;let u=`Function ${t}() called with invalid data`;e&&(u+=" (via `toFirestore()`)"),u+=". ";let f="";return(o||c)&&(f+=" (found",o&&(f+=` in field ${r}`),c&&(f+=` in document ${i}`),f+=")"),new D(b.INVALID_ARGUMENT,u+n+f)}function rp(n,t){return n.some(e=>e.isEqual(t))}function km(){return new Ws("serverTimestamp")}function Om(n){return new Qs("increment",n)}const na="@firebase/firestore",ra="4.12.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vc{constructor(t,e,r,i,o){this._firestore=t,this._userDataWriter=e,this._key=r,this._document=i,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new ft(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new sp(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(t){if(this._document){const e=this._document.data.field(Js("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class sp extends Vc{data(){return super.data()}}function ip(n,t,e){let r;return r=n?e&&(e.merge||e.mergeFields)?n.toFirestore(t,e):n.toFirestore(t):t,r}class zn{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Se extends Vc{constructor(t,e,r,i,o,c){super(t,e,r,i,c),this._firestore=t,this._firestoreImpl=t,this.metadata=o}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new Qn(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const r=this._document.data.field(Js("DocumentSnapshot.get",t));if(r!==null)return this._userDataWriter.convertValue(r,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new D(b.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=Se._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?e:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e)}}Se._jsonSchemaVersion="firestore/documentSnapshot/1.0",Se._jsonSchema={type:Z("string",Se._jsonSchemaVersion),bundleSource:Z("string","DocumentSnapshot"),bundleName:Z("string"),bundle:Z("string")};class Qn extends Se{data(t={}){return super.data(t)}}class on{constructor(t,e,r,i){this._firestore=t,this._userDataWriter=e,this._snapshot=i,this.metadata=new zn(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach(r=>{t.call(e,new Qn(this._firestore,this._userDataWriter,r.key,r,new zn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new D(b.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(i,o){if(i._snapshot.oldDocs.isEmpty()){let c=0;return i._snapshot.docChanges.map(u=>{const f=new Qn(i._firestore,i._userDataWriter,u.doc.key,u.doc,new zn(i._snapshot.mutatedKeys.has(u.doc.key),i._snapshot.fromCache),i.query.converter);return u.doc,{type:"added",doc:f,oldIndex:-1,newIndex:c++}})}{let c=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(u=>o||u.type!==3).map(u=>{const f=new Qn(i._firestore,i._userDataWriter,u.doc.key,u.doc,new zn(i._snapshot.mutatedKeys.has(u.doc.key),i._snapshot.fromCache),i.query.converter);let d=-1,T=-1;return u.type!==0&&(d=c.indexOf(u.doc.key),c=c.delete(u.doc.key)),u.type!==1&&(c=c.add(u.doc),T=c.indexOf(u.doc.key)),{type:op(u.type),doc:f,oldIndex:d,newIndex:T}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new D(b.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=on._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=bs.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],r=[],i=[];return this.docs.forEach(o=>{o._document!==null&&(e.push(o._document),r.push(this._userDataWriter.convertObjectMap(o._document.data.value.mapValue.fields,"previous")),i.push(o.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function op(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return M(61501,{type:n})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */on._jsonSchemaVersion="firestore/querySnapshot/1.0",on._jsonSchema={type:Z("string",on._jsonSchemaVersion),bundleSource:Z("string","QuerySnapshot"),bundleName:Z("string"),bundle:Z("string")};function xm(n,t,e){n=ls(n,ft);const r=ls(n.firestore,wc),i=ip(n.converter,t,e),o=Zd(r);return ap(r,[tp(o,"setDoc",n._key,i,n.converter!==null,e).toMutation(n._key,xt.none())])}function ap(n,t){const e=Wd(n);return zd(e,t)}(function(t,e=!0){mh(rh),Kt(new Lt("firestore",(r,{instanceIdentifier:i,options:o})=>{const c=r.getProvider("app").getImmediate(),u=new wc(new yh(r.getProvider("auth-internal")),new Ih(c,r.getProvider("app-check-internal")),Bh(c,i),c);return o={useFetchStreams:e,...o},u._setSettings(o),u},"PUBLIC").setMultipleInstances(!0)),Vt(na,ra,t),Vt(na,ra,"esm2020")})();var cp="firebase",lp="12.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Vt(cp,lp,"app");const Dc="@firebase/installations",Xs="0.6.20";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nc=1e4,kc=`w:${Xs}`,Oc="FIS_v2",up="https://firebaseinstallations.googleapis.com/v1",hp=60*60*1e3,fp="installations",dp="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pp={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},me=new ur(fp,dp,pp);function xc(n){return n instanceof Yt&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mc({projectId:n}){return`${up}/projects/${n}/installations`}function Lc(n){return{token:n.token,requestStatus:2,expiresIn:gp(n.expiresIn),creationTime:Date.now()}}async function Fc(n,t){const r=(await t.json()).error;return me.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function Uc({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function mp(n,{refreshToken:t}){const e=Uc(n);return e.append("Authorization",_p(t)),e}async function Bc(n){const t=await n();return t.status>=500&&t.status<600?n():t}function gp(n){return Number(n.replace("s","000"))}function _p(n){return`${Oc} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yp({appConfig:n,heartbeatServiceProvider:t},{fid:e}){const r=Mc(n),i=Uc(n),o=t.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&i.append("x-firebase-client",d)}const c={fid:e,authVersion:Oc,appId:n.appId,sdkVersion:kc},u={method:"POST",headers:i,body:JSON.stringify(c)},f=await Bc(()=>fetch(r,u));if(f.ok){const d=await f.json();return{fid:d.fid||e,registrationStatus:2,refreshToken:d.refreshToken,authToken:Lc(d.authToken)}}else throw await Fc("Create Installation",f)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jc(n){return new Promise(t=>{setTimeout(t,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ep(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tp=/^[cdef][\w-]{21}$/,Ts="";function Ip(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const e=vp(n);return Tp.test(e)?e:Ts}catch{return Ts}}function vp(n){return Ep(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Er(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $c=new Map;function qc(n,t){const e=Er(n);zc(e,t),wp(e,t)}function zc(n,t){const e=$c.get(n);if(e)for(const r of e)r(t)}function wp(n,t){const e=Ap();e&&e.postMessage({key:n,fid:t}),Rp()}let ae=null;function Ap(){return!ae&&"BroadcastChannel"in self&&(ae=new BroadcastChannel("[Firebase] FID Change"),ae.onmessage=n=>{zc(n.data.key,n.data.fid)}),ae}function Rp(){$c.size===0&&ae&&(ae.close(),ae=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sp="firebase-installations-database",bp=1,ge="firebase-installations-store";let Zr=null;function Ys(){return Zr||(Zr=Ea(Sp,bp,{upgrade:(n,t)=>{switch(t){case 0:n.createObjectStore(ge)}}})),Zr}async function cr(n,t){const e=Er(n),i=(await Ys()).transaction(ge,"readwrite"),o=i.objectStore(ge),c=await o.get(e);return await o.put(t,e),await i.done,(!c||c.fid!==t.fid)&&qc(n,t.fid),t}async function Hc(n){const t=Er(n),r=(await Ys()).transaction(ge,"readwrite");await r.objectStore(ge).delete(t),await r.done}async function Tr(n,t){const e=Er(n),i=(await Ys()).transaction(ge,"readwrite"),o=i.objectStore(ge),c=await o.get(e),u=t(c);return u===void 0?await o.delete(e):await o.put(u,e),await i.done,u&&(!c||c.fid!==u.fid)&&qc(n,u.fid),u}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zs(n){let t;const e=await Tr(n.appConfig,r=>{const i=Cp(r),o=Pp(n,i);return t=o.registrationPromise,o.installationEntry});return e.fid===Ts?{installationEntry:await t}:{installationEntry:e,registrationPromise:t}}function Cp(n){const t=n||{fid:Ip(),registrationStatus:0};return Gc(t)}function Pp(n,t){if(t.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(me.create("app-offline"));return{installationEntry:t,registrationPromise:i}}const e={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},r=Vp(n,e);return{installationEntry:e,registrationPromise:r}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:Dp(n)}:{installationEntry:t}}async function Vp(n,t){try{const e=await yp(n,t);return cr(n.appConfig,e)}catch(e){throw xc(e)&&e.customData.serverCode===409?await Hc(n.appConfig):await cr(n.appConfig,{fid:t.fid,registrationStatus:0}),e}}async function Dp(n){let t=await sa(n.appConfig);for(;t.registrationStatus===1;)await jc(100),t=await sa(n.appConfig);if(t.registrationStatus===0){const{installationEntry:e,registrationPromise:r}=await Zs(n);return r||e}return t}function sa(n){return Tr(n,t=>{if(!t)throw me.create("installation-not-found");return Gc(t)})}function Gc(n){return Np(n)?{fid:n.fid,registrationStatus:0}:n}function Np(n){return n.registrationStatus===1&&n.registrationTime+Nc<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kp({appConfig:n,heartbeatServiceProvider:t},e){const r=Op(n,e),i=mp(n,e),o=t.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&i.append("x-firebase-client",d)}const c={installation:{sdkVersion:kc,appId:n.appId}},u={method:"POST",headers:i,body:JSON.stringify(c)},f=await Bc(()=>fetch(r,u));if(f.ok){const d=await f.json();return Lc(d)}else throw await Fc("Generate Auth Token",f)}function Op(n,{fid:t}){return`${Mc(n)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ti(n,t=!1){let e;const r=await Tr(n.appConfig,o=>{if(!Kc(o))throw me.create("not-registered");const c=o.authToken;if(!t&&Lp(c))return o;if(c.requestStatus===1)return e=xp(n,t),o;{if(!navigator.onLine)throw me.create("app-offline");const u=Up(o);return e=Mp(n,u),u}});return e?await e:r.authToken}async function xp(n,t){let e=await ia(n.appConfig);for(;e.authToken.requestStatus===1;)await jc(100),e=await ia(n.appConfig);const r=e.authToken;return r.requestStatus===0?ti(n,t):r}function ia(n){return Tr(n,t=>{if(!Kc(t))throw me.create("not-registered");const e=t.authToken;return Bp(e)?{...t,authToken:{requestStatus:0}}:t})}async function Mp(n,t){try{const e=await kp(n,t),r={...t,authToken:e};return await cr(n.appConfig,r),e}catch(e){if(xc(e)&&(e.customData.serverCode===401||e.customData.serverCode===404))await Hc(n.appConfig);else{const r={...t,authToken:{requestStatus:0}};await cr(n.appConfig,r)}throw e}}function Kc(n){return n!==void 0&&n.registrationStatus===2}function Lp(n){return n.requestStatus===2&&!Fp(n)}function Fp(n){const t=Date.now();return t<n.creationTime||n.creationTime+n.expiresIn<t+hp}function Up(n){const t={requestStatus:1,requestTime:Date.now()};return{...n,authToken:t}}function Bp(n){return n.requestStatus===1&&n.requestTime+Nc<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jp(n){const t=n,{installationEntry:e,registrationPromise:r}=await Zs(t);return r?r.catch(console.error):ti(t).catch(console.error),e.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $p(n,t=!1){const e=n;return await qp(e),(await ti(e,t)).token}async function qp(n){const{registrationPromise:t}=await Zs(n);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zp(n){if(!n||!n.options)throw ts("App Configuration");if(!n.name)throw ts("App Name");const t=["projectId","apiKey","appId"];for(const e of t)if(!n.options[e])throw ts(e);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function ts(n){return me.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wc="installations",Hp="installations-internal",Gp=n=>{const t=n.getProvider("app").getImmediate(),e=zp(t),r=_n(t,"heartbeat");return{app:t,appConfig:e,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},Kp=n=>{const t=n.getProvider("app").getImmediate(),e=_n(t,Wc).getImmediate();return{getId:()=>jp(e),getToken:i=>$p(e,i)}};function Wp(){Kt(new Lt(Wc,Gp,"PUBLIC")),Kt(new Lt(Hp,Kp,"PRIVATE"))}Wp();Vt(Dc,Xs);Vt(Dc,Xs,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lr="analytics",Qp="firebase_id",Jp="origin",Xp=60*1e3,Yp="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",ei="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mt=new ws("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zp={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},vt=new ur("analytics","Analytics",Zp);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tm(n){if(!n.startsWith(ei)){const t=vt.create("invalid-gtag-resource",{gtagURL:n});return mt.warn(t.message),""}return n}function Qc(n){return Promise.all(n.map(t=>t.catch(e=>e)))}function em(n,t){let e;return window.trustedTypes&&(e=window.trustedTypes.createPolicy(n,t)),e}function nm(n,t){const e=em("firebase-js-sdk-policy",{createScriptURL:tm}),r=document.createElement("script"),i=`${ei}?l=${n}&id=${t}`;r.src=e?e?.createScriptURL(i):i,r.async=!0,document.head.appendChild(r)}function rm(n){let t=[];return Array.isArray(window[n])?t=window[n]:window[n]=t,t}async function sm(n,t,e,r,i,o){const c=r[i];try{if(c)await t[c];else{const f=(await Qc(e)).find(d=>d.measurementId===i);f&&await t[f.appId]}}catch(u){mt.error(u)}n("config",i,o)}async function im(n,t,e,r,i){try{let o=[];if(i&&i.send_to){let c=i.send_to;Array.isArray(c)||(c=[c]);const u=await Qc(e);for(const f of c){const d=u.find(w=>w.measurementId===f),T=d&&t[d.appId];if(T)o.push(T);else{o=[];break}}}o.length===0&&(o=Object.values(t)),await Promise.all(o),n("event",r,i||{})}catch(o){mt.error(o)}}function om(n,t,e,r){async function i(o,...c){try{if(o==="event"){const[u,f]=c;await im(n,t,e,u,f)}else if(o==="config"){const[u,f]=c;await sm(n,t,e,r,u,f)}else if(o==="consent"){const[u,f]=c;n("consent",u,f)}else if(o==="get"){const[u,f,d]=c;n("get",u,f,d)}else if(o==="set"){const[u]=c;n("set",u)}else n(o,...c)}catch(u){mt.error(u)}}return i}function am(n,t,e,r,i){let o=function(...c){window[r].push(arguments)};return window[i]&&typeof window[i]=="function"&&(o=window[i]),window[i]=om(o,n,t,e),{gtagCore:o,wrappedGtag:window[i]}}function cm(n){const t=window.document.getElementsByTagName("script");for(const e of Object.values(t))if(e.src&&e.src.includes(ei)&&e.src.includes(n))return e;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lm=30,um=1e3;class hm{constructor(t={},e=um){this.throttleMetadata=t,this.intervalMillis=e}getThrottleMetadata(t){return this.throttleMetadata[t]}setThrottleMetadata(t,e){this.throttleMetadata[t]=e}deleteThrottleMetadata(t){delete this.throttleMetadata[t]}}const Jc=new hm;function fm(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function dm(n){const{appId:t,apiKey:e}=n,r={method:"GET",headers:fm(e)},i=Yp.replace("{app-id}",t),o=await fetch(i,r);if(o.status!==200&&o.status!==304){let c="";try{const u=await o.json();u.error?.message&&(c=u.error.message)}catch{}throw vt.create("config-fetch-failed",{httpStatus:o.status,responseMessage:c})}return o.json()}async function pm(n,t=Jc,e){const{appId:r,apiKey:i,measurementId:o}=n.options;if(!r)throw vt.create("no-app-id");if(!i){if(o)return{measurementId:o,appId:r};throw vt.create("no-api-key")}const c=t.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},u=new _m;return setTimeout(async()=>{u.abort()},Xp),Xc({appId:r,apiKey:i,measurementId:o},c,u,t)}async function Xc(n,{throttleEndTimeMillis:t,backoffCount:e},r,i=Jc){const{appId:o,measurementId:c}=n;try{await mm(r,t)}catch(u){if(c)return mt.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${u?.message}]`),{appId:o,measurementId:c};throw u}try{const u=await dm(n);return i.deleteThrottleMetadata(o),u}catch(u){const f=u;if(!gm(f)){if(i.deleteThrottleMetadata(o),c)return mt.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${f?.message}]`),{appId:o,measurementId:c};throw u}const d=Number(f?.customData?.httpStatus)===503?ao(e,i.intervalMillis,lm):ao(e,i.intervalMillis),T={throttleEndTimeMillis:Date.now()+d,backoffCount:e+1};return i.setThrottleMetadata(o,T),mt.debug(`Calling attemptFetch again in ${d} millis`),Xc(n,T,r,i)}}function mm(n,t){return new Promise((e,r)=>{const i=Math.max(t-Date.now(),0),o=setTimeout(e,i);n.addEventListener(()=>{clearTimeout(o),r(vt.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}function gm(n){if(!(n instanceof Yt)||!n.customData)return!1;const t=Number(n.customData.httpStatus);return t===429||t===500||t===503||t===504}class _m{constructor(){this.listeners=[]}addEventListener(t){this.listeners.push(t)}abort(){this.listeners.forEach(t=>t())}}async function ym(n,t,e,r,i){if(i&&i.global){n("event",e,r);return}else{const o=await t,c={...r,send_to:o};n("event",e,c)}}async function Em(n,t,e,r){if(r&&r.global){const i={};for(const o of Object.keys(e))i[`user_properties.${o}`]=e[o];return n("set",i),Promise.resolve()}else{const i=await t;n("config",i,{update:!0,user_properties:e})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Tm(){if(ma())try{await ga()}catch(n){return mt.warn(vt.create("indexeddb-unavailable",{errorInfo:n?.toString()}).message),!1}else return mt.warn(vt.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function Im(n,t,e,r,i,o,c){const u=pm(n);u.then(R=>{e[R.measurementId]=R.appId,n.options.measurementId&&R.measurementId!==n.options.measurementId&&mt.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${R.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(R=>mt.error(R)),t.push(u);const f=Tm().then(R=>{if(R)return r.getId()}),[d,T]=await Promise.all([u,f]);cm(o)||nm(o,d.measurementId),i("js",new Date);const w=c?.config??{};return w[Jp]="firebase",w.update=!0,T!=null&&(w[Qp]=T),i("config",d.measurementId,w),d.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vm{constructor(t){this.app=t}_delete(){return delete be[this.app.options.appId],Promise.resolve()}}let be={},oa=[];const aa={};let es="dataLayer",wm="gtag",ca,ni,la=!1;function Am(){const n=[];if(Ql()&&n.push("This is a browser extension environment."),Xl()||n.push("Cookies are not available."),n.length>0){const t=n.map((r,i)=>`(${i+1}) ${r}`).join(" "),e=vt.create("invalid-analytics-context",{errorInfo:t});mt.warn(e.message)}}function Rm(n,t,e){Am();const r=n.options.appId;if(!r)throw vt.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)mt.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw vt.create("no-api-key");if(be[r]!=null)throw vt.create("already-exists",{id:r});if(!la){rm(es);const{wrappedGtag:o,gtagCore:c}=am(be,oa,aa,es,wm);ni=o,ca=c,la=!0}return be[r]=Im(n,oa,aa,t,ca,es,e),new vm(n)}function Mm(n=Ta()){n=ue(n);const t=_n(n,lr);return t.isInitialized()?t.getImmediate():Sm(n)}function Sm(n,t={}){const e=_n(n,lr);if(e.isInitialized()){const i=e.getImmediate();if(an(t,e.getOptions()))return i;throw vt.create("already-initialized")}return e.initialize({options:t})}function bm(n,t,e){n=ue(n),Em(ni,be[n.app.options.appId],t,e).catch(r=>mt.error(r))}function Cm(n,t,e,r){n=ue(n),ym(ni,be[n.app.options.appId],t,e,r).catch(i=>mt.error(i))}const ua="@firebase/analytics",ha="0.10.20";function Pm(){Kt(new Lt(lr,(t,{options:e})=>{const r=t.getProvider("app").getImmediate(),i=t.getProvider("installations-internal").getImmediate();return Rm(r,i,e)},"PUBLIC")),Kt(new Lt("analytics-internal",n,"PRIVATE")),Vt(ua,ha),Vt(ua,ha,"esm2020");function n(t){try{const e=t.getProvider(lr).getImmediate();return{logEvent:(r,i,o)=>Cm(e,r,i,o),setUserProperties:(r,i)=>bm(e,r,i)}}catch(e){throw vt.create("interop-component-reg-failed",{reason:e})}}}Pm();export{Mm as a,km as b,Om as c,Dm as d,Nm as g,sh as i,xm as s};
