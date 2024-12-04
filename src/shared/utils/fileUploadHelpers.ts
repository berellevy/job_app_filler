export const dispatchFileDragEvent = (
  type: string,
  element: HTMLElement,
  files: File[]
) => {
  var dataTransfer = {
    constructor: DataTransfer,
    effectAllowed: 'all',
    dropEffect: 'none',
    types: ['Files'],
    files,
    items: null,
    setData: function () {},
    getData: function () {},
    clearData: function () {},
    setDragImage: function () {},
  }
  if (window.DataTransferItemList) {
    dataTransfer.items = Object.setPrototypeOf(
      Array.prototype.map.call(files, function (file) {
        return {
          constructor: DataTransferItem,
          kind: 'file',
          type: file.type,
          getAsFile: function () {
            return file
          },
          getAsString: function (callback) {
            var reader = new FileReader()
            reader.onload = function (event) {
              callback(event.target.result)
            }
            reader.readAsText(file)
          },
        }
      }),
      {
        constructor: DataTransferItemList,
        add: function () {},
        clear: function () {},
        remove: function () {},
      }
    )
  }
  const { x, y } = element.getBoundingClientRect()
  const dragEvent = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    view: document.defaultView,
    detail: 0,
    screenX: 0,
    screenY: 0,
    clientX: x,
    clientY: y,
    button: 0,
    relatedTarget: null
  })
  Object.setPrototypeOf(dragEvent, null)
  // @ts-ignore
  dragEvent.dataTransfer = dataTransfer
  Object.setPrototypeOf(dragEvent, DragEvent.prototype)
  element.dispatchEvent(dragEvent)
}
