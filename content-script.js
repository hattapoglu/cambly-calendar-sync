const userIdKey = 'custom_user_id'
let idKey = Object.keys(localStorage)
  .filter((el) => el.includes(userIdKey))
  .pop()

chrome.storage.sync.set({ student_id: localStorage[idKey] }, function () {
  console.log('Value is set to ' + localStorage[idKey])
})
