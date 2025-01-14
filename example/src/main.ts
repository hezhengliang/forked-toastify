import './style.css'

import '../../lib/index.css'
import ForkedToast, {type ToastType, type ToastConfigOption } from '../../lib/index'

function createToast(text: string, type='info' as ToastType){
  const options ={
    text,
    type,
    position: 'center',
    close: false,
    gravity: 'top', // 'top' | 'bottom'
    duration: 3000,
  } 
  ForkedToast(options as ToastConfigOption).show()
}
const appEl = document.querySelector<HTMLDivElement>('#app')
function renderToastType(){
  const _html = `<button data-type="success">Success</button>
    <button data-type="warning">Warning</button>
    <button data-type="info">Message</button>
    <button data-type="error">Error</button>`
  const toastTypeEl = document.createElement('div')
  toastTypeEl.className = 'toast-type-wrapper'
  toastTypeEl.innerHTML = _html
  appEl!.appendChild(toastTypeEl)
  toastTypeEl.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement
    if(target.dataset.type){
      console.log(target.dataset.type,'----')
      createToast('This is a toast message!', target.dataset.type as ToastType)
    }
  })
}
function bootstrap(){
  appEl!.innerHTML = `
    <div>
      <h2>Forked-Toastify</h2>
    </div>
  `
  renderToastType()
}
bootstrap()
