const userIdKey = 'ph_phc';
let idKey = Object.keys(localStorage)
  .filter((el) => el.includes(userIdKey))
  .pop();

setTimeout(() => {
  const userId = JSON.parse(localStorage.getItem(idKey)).$user_id;

  if (userId) {
    chrome.storage.sync.set({ student_id: userId }, function () {
      console.log('Value is set to ' + userId)
    })
  } else {
    chrome.storage.sync.remove("student_id", function () {
      console.log("Value is removed")
    })
  }
}, 1000);