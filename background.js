chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  chrome.storage.sync.set({ student_id: message.id }, function () {
    console.log('Value is set to ' + message.id)
  })
})
