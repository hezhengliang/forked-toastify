/*!
 * forked https://github.com/apvarun/toastify-js
 * Toast js 1.12.0
 * origin form: https://github.com/apvarun/toastify-js
 * @license MIT licensed
 *
 * Copyright (C) 2018 Varun A P
 */
// `left`, `center` or `right`
declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;

export type ToastPosition = 'left' | 'center' | 'right' 
export type ToastGravityType = 'top' | 'bottom'

// `info` `success` `warning` `error`
export enum ToastMsgType {
  info = 'info',
  success = 'success',
  warning = 'warning',
  error = 'error',
}
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type ToastConfigOption = {
  text: string // 提示消息
  type: ToastType // toast 类型
  duration: number // 显示持续时间，-1 为永久
  position: ToastPosition // toast 的侧边位置
  node?: HTMLElement // 要在 toast 中挂载的节点
  selector?: string | HTMLElement | null // CSS 选择器
  destination?: string // 点击 toast 后导航的 URL
  newWindow?: boolean // 是否在新窗口中打开目标
  close?: boolean // 是否显示关闭图标
  gravity?: ToastGravityType // toast 出现的位置
  className?: string // 自定义类名
  stopOnFocus?: boolean // 悬停时是否停止计时（仅当设置了持续时间）
  escapeMarkup?: boolean // 是否转义 HTML 标记
  ariaLive?: string // 提高可访问性，通知屏幕阅读器
  style?: Record<string, string> // 直接应用于 toast 的样式
  offset?: { x: number; y: number } // 偏移量
  callback?: () => void // toast 消失时调用的函数
  onClick?: () => void // toast 被点击时调用的函数
}
const TOAST_CLASS_SUFFIX = `toast`
const thresholdWidth = 360
const defaultOptions = {
  oldestFirst: true,
  text: 'Toast is awesome!',
  node: undefined,
  duration: 3000,
  selector: undefined,
  callback: function () {},
  destination: undefined,
  newWindow: false,
  close: false,
  gravity: 'top',
  positionLeft: false,
  position: '',
  avatar: '',
  className: '',
  stopOnFocus: true,
  onClick: function () {},
  offset: { x: 0, y: 0 },
  escapeMarkup: true,
  ariaLive: 'polite',
  style: { background: '' },
  type: '',
}

class Toast {
  version: string
  options
  toastElement: any = null
  _rootElement: HTMLElement | null = null
  timeOut: number | null = null
  constructor(options: ToastConfigOption) {
    this.version = '1.0.0'
    this.options = defaultOptions
    this.toastElement = null
    this._rootElement = document.body

    this._init(options)
  }

  /**
   * Display the toast
   * @public
   */
  public show() {
    // Creating the DOM object for the toast
    this.toastElement = this._build()

    // Getting the root element to with the toast needs to be added
    if (typeof this.options.selector === 'string') {
      this._rootElement = document.getElementById(this.options.selector)
    } else if (
      (this.options.selector as unknown) instanceof HTMLElement ||
      (this.options.selector as unknown) instanceof ShadowRoot
    ) {
      this._rootElement = this.options.selector as unknown as HTMLElement
    } else {
      this._rootElement = document.body
    }

    // Validating if root element is present in DOM
    if (!this._rootElement) {
      throw 'Root element is not defined'
    }

    // Adding the DOM element
    this._rootElement.insertBefore(
      this.toastElement,
      this._rootElement.firstChild,
    )

    // Repositioning the toasts in case multiple toasts are present
    this._reposition()

    if (this.options.duration > 0) {
      this.timeOut = window.setTimeout(() => {
        // Remove the toast from DOM
        this._removeElement(this.toastElement)
      }, this.options.duration) as number // Binding `this` for function invocation
    }

    // Supporting function chaining
    return this
  }

  /**
   * Hide the toast
   * @public
   */
  public hide() {
    this.timeOut && clearTimeout(this.timeOut)
    this._removeElement(this.toastElement)
  }

  private _init(options: ToastConfigOption) {
    // Setting defaults
    this.options = Object.assign(defaultOptions, options)
  }

  /**
   * Build the Toast element
   * @returns {Element}
   * @private
   */
  private _build() {
    // Validating if the options are defined
    if (!this.options) {
      throw 'Toast is not initialized'
    }
    const {
      className,
      position,
      style,
      gravity,
      ariaLive,
      node,
      text,
      type,
      close,
      stopOnFocus,
      duration,
      destination,
      offset,
    } = this.options
    // Creating the DOM object
    const divElement: HTMLElement = document.createElement('div')
    // toastify is the base class name
    // Positioning toast to left or right or center (default right)
    // Assigning gravity of element
    divElement.className = `toast on ${className} toast-${position} ${TOAST_CLASS_SUFFIX}-${gravity}`

    // Loop through our style object and apply styles to divElement
    for (const property in style) {
      //@ts-ignore
      divElement.style[property] = style[property]
    }

    // Announce the toast to screen readers
    if (ariaLive) {
      divElement.setAttribute('aria-live', ariaLive)
    }
    // content element of toast
    const divContentEl = document.createElement('div')
    divContentEl.className = 'toast-content'
    divElement.appendChild(divContentEl)

    // Adding the toast message/node
    if (node && (node as HTMLElement).nodeType === Node.ELEMENT_NODE) {
      // If we have a valid node, we insert it
      divContentEl.appendChild(node)
    } else {
      const spanEl: HTMLSpanElement = document.createElement('span')
      if (this.options.escapeMarkup) {
        spanEl.innerText = text
        divContentEl.appendChild(spanEl)
      } else {
        spanEl.innerHTML = text
        divContentEl.appendChild(spanEl)
      }

      if (type) {
        const typeEl = document.createElement('i')
        typeEl.className = `toast-icon ${ToastMsgType[type as keyof typeof ToastMsgType] ? `toast-icon--${ToastMsgType[type as keyof typeof ToastMsgType]}` : ''}`
        if (spanEl) {
          spanEl.parentNode!.insertBefore(typeEl, spanEl)
        }
      }
    }

    // Adding a close icon to the toast
    if (close === true) {
      // Create a span for close element
      const closeElement = document.createElement('button')
      closeElement.type = 'button'
      closeElement.setAttribute('aria-label', 'Close')
      closeElement.className = 'toast-close'
      closeElement.innerHTML = '<i class="toast-close-i"></i>'

      // Triggering the removal of toast from DOM on close click
      closeElement.addEventListener('click', (event) => {
        event.stopPropagation()
        this._removeElement(this.toastElement)
        this.timeOut && window.clearTimeout(this.timeOut)
      })

      //Calculating screen width
      const width = window.innerWidth > 0 ? window.innerWidth : screen.width

      // Adding the close icon to the toast element
      // Display on the right if screen width is less than or equal to 360px
      if (position == 'left' && width > thresholdWidth) {
        // Adding close icon on the left of content
        divElement.insertAdjacentElement('afterbegin', closeElement)
      } else {
        // Adding close icon on the right of content
        divContentEl.appendChild(closeElement)
      }
    }

    // Clear timeout while toast is focused
    if (stopOnFocus && duration > 0) {
      // stop countdown
      divElement.addEventListener('mouseover', () => {
        this.timeOut && window.clearTimeout(this.timeOut)
      })
      // add back the timeout
      divElement.addEventListener('mouseleave', () => {
        this.timeOut = window.setTimeout(() => {
          // Remove the toast from DOM
          this._removeElement(divElement)
        }, duration) as number
      })
    }

    // Adding an on-click destination path
    if (typeof destination !== 'undefined') {
      divElement.addEventListener('click', (event: Event) => {
        event.stopPropagation()
        if (this.options.newWindow === true) {
          window.open(destination, '_blank')
        } else {
          window.location = destination
        }
      })
    }

    if (
      typeof this.options.onClick === 'function' &&
      typeof destination === 'undefined'
    ) {
      divElement.addEventListener('click', (event: Event) => {
        event.stopPropagation()
        this.options.onClick()
      })
    }

    // Adding offset
    if (typeof offset === 'object') {
      const x = this._getAxisOffsetAValue('x', this.options)
      const y = this._getAxisOffsetAValue('y', this.options)

      const xOffset = position == 'left' ? x : `-${x}`
      const yOffset = gravity == `${TOAST_CLASS_SUFFIX}-top` ? y : `-${y}`

      divElement.style.transform = `translate(${xOffset},${yOffset})`
    }

    // Returning the generated element
    return divElement
  }

  /**
   * Remove the toast from the DOM
   * @param {Element} toastElement
   */
  private _removeElement(toastElement: HTMLElement) {
    // Hiding the element
    toastElement.className = toastElement.className.replace(' on', '')

    // Removing the element from DOM after transition end
    window.setTimeout(() => {
      // remove options node if any
      if (this.options.node && (this.options.node as HTMLElement).parentNode) {
        ;(
          (this.options.node as HTMLElement).parentNode as HTMLElement
        ).removeChild(this.options.node)
      }

      // Remove the element from the DOM, only when the parent node was not removed before.
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement)
      }

      // Calling the callback function
      this.options.callback.call(toastElement)

      // Repositioning the toasts again
      this._reposition()
    }, 400) // Binding `this` for function invocation
  }

  /**
   * Position the toast on the DOM
   * @private
   */
  private _reposition() {
    // Top margins with gravity
    const topLeftOffsetSize = {
      top: 15,
      bottom: 15,
    }
    const topRightOffsetSize = {
      top: 15,
      bottom: 15,
    }
    const offsetSize = {
      top: 15,
      bottom: 15,
    }

    // Get all toast messages that have been added to the container (selector)
    const allToasts = this._rootElement!.querySelectorAll('.toast')

    let classUsed

    // Modifying the position of each toast element
    for (let i = 0; i < allToasts.length; i++) {
      const toastEl: HTMLElement = allToasts[i] as HTMLElement
      console.log(toastEl.classList, `${TOAST_CLASS_SUFFIX}-top`, toastEl.classList.contains(`${TOAST_CLASS_SUFFIX}-top`))
      // Getting the applied gravity
      if (toastEl.classList.contains(`${TOAST_CLASS_SUFFIX}-top`)) {
        classUsed = `${TOAST_CLASS_SUFFIX}-top`
      } else {
        classUsed = `${TOAST_CLASS_SUFFIX}-bottom`
      }
      const height = toastEl.offsetHeight
      classUsed = classUsed.slice(TOAST_CLASS_SUFFIX.length + 1) as keyof typeof offsetSize
      // Spacing between toasts
      const offset = 15
      console.log(classUsed)
      const width = window.innerWidth > 0 ? window.innerWidth : screen.width
      // Show toast in center if screen with less than or equal to 360px
      if (width <= thresholdWidth) {
        // Setting the position
        toastEl.style[classUsed] = `${offsetSize[classUsed]}px`
        offsetSize[classUsed] += height + offset
      } else {
        if (allToasts[i].classList.contains('toast-left') === true) {
          // Setting the position
          toastEl.style[classUsed] = `${topLeftOffsetSize[classUsed]}px`
          topLeftOffsetSize[classUsed] += height + offset
        } else {
          // Setting the position
          toastEl.style[classUsed] = `${topRightOffsetSize[classUsed]}px`
          topRightOffsetSize[classUsed] += height + offset
        }
      }
    }
  }

  /**
   * Helper function to get offset
   * @param {string} axis - 'x' or 'y'
   * @param {ToastConfigOption} options - The options object containing the offset object
   */
  private _getAxisOffsetAValue(axis: string, options: Record<string, any>) {
    if (options.offset[axis]) {
      if (isNaN(options.offset[axis])) {
        return options.offset[axis]
      } else {
        return `${options.offset[axis]}px`
      }
    }
    return '0px'
  }
}
// Returning the Toast function to be assigned to the window object/module
function StartToastInstance(options: ToastConfigOption) {
  return new Toast(options)
}

export default StartToastInstance
